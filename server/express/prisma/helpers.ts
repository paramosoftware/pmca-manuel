import { Prisma } from '@prisma/client';
import type { ParsedQs } from 'qs';
import { ApiValidationError } from '../error';
import sanitizeString from '~/utils/sanitizeString';
import normalizeString from '~/utils/normalizeString';
import type { Condition, Include, Order, PaginatedQuery, Query, Where } from './interfaces';
import hashPassword from '~/utils/hashPassword';
import getBoolean from '~/utils/getBoolean';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '~/server/prisma/prisma';
import capitalize from '~/utils/capitalize';
import parseNumber  from '~/utils/parseNumber';


export async function processRequestBody(model: string, body: any, isUpdate: boolean = false, processRelations = true, parentModel: string = '') {

    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === model.toLowerCase())?.fields!;

    const prismaQuery: any = {};

    const keys = Object.keys(body);

    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    modelFields?.forEach(f => {

        if (isFieldMandatory(model, parentModel, f, body, modelFields) && !isUpdate) {
            throw new ApiValidationError(f.name + ' is required for ' + model);
        }

        fieldsMap.set(f.name, f);
    });

    for (const key of keys) {

        const field = fieldsMap.get(key);

        validateFieldInModel(fieldsMap, key, model);

        if (!field || body[key] === undefined) {
            continue;
        }

        const keyNormalized = key + 'Normalized';
        if (fieldsMap.get(keyNormalized) !== undefined) {
            prismaQuery[keyNormalized] = normalizeString(body[key]);
        }

        const keySlug = key + 'Slug';
        if (fieldsMap.get(keySlug) !== undefined && body[keySlug] === undefined) {
            prismaQuery[keySlug] = await calculateSlug(body[key], model, keySlug);
        }

        if (key == 'createdAt' || key == 'updatedAt') {
            body[key] = undefined;
        }

        if (key.endsWith('Id') && !isIdValid(body[key])) {
            body[key] = undefined;
        }

        if (body[key] === '' || body[key] == null) {
            body[key] = body[key + 'Id'] !== undefined ? undefined : null;
            continue;
        }

        const fieldType = field.type.toLowerCase();

        if (fieldType === 'int') {

            prismaQuery[key] = processInt(body[key], key);

        } else if (fieldType === 'string') {

            prismaQuery[key] = key === 'password' ? hashPassword(body[key]) : sanitizeString(body[key]);

        } else if (fieldType === 'boolean') {

            prismaQuery[key] = processBoolean(body[key], key);

        } else if (field.kind.toLowerCase() === 'object' && processRelations) {

            const relatedModel = field.type;

            if (!field.isList) {
                if (fieldsMap.get(key + 'Id') !== undefined && isIdValid(body[key + 'Id'])) {
                    continue;
                } else {
                    prismaQuery[key] = await processOneToManyRelation(relatedModel, model, body, key);
                }
            } else {
                prismaQuery[key] = await processManyToManyRelation(relatedModel, model, body, key, isUpdate);
            }
        }
    }

    if (!isUpdate) {
        prismaQuery.id = undefined;
    }

    return prismaQuery;
}

async function processOneToManyRelation(relatedModel: string, parentModel: string, body: any, field: string) {
    if (typeof body[field] !== 'object') {
        throw new ApiValidationError(field + ' must be an object');
    }

    const prismaQuery = {} as any;
    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === relatedModel.toLowerCase())?.fields!;

    const relatedObject = body[field];

    const action = getAction(relatedObject);

    const processedRelatedObject = await processRequestBody(relatedModel, relatedObject, action === 'update', false, parentModel);

    if (action === 'update') {
        prismaQuery.update = processedRelatedObject;
    } else if (action === 'connect') {
        prismaQuery.connect = { id: relatedObject.id };
    } else {
        prismaQuery.connectOrCreate = {
            create: processedRelatedObject,
            where: getWhereClause(modelFields, relatedObject)
        }
    }

    return prismaQuery;
}

async function processManyToManyRelation(model: string, parentModel: string, body: any, field: string, isUpdate: boolean) {
    if (!Array.isArray(body[field])) {
        throw new ApiValidationError(field + ' must be an array');
    }

    const prismaQuery = {} as any;
    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === model.toLowerCase())?.fields!;

    const relatedObjects = body[field];

    if (isUpdate) {
        // check if the related model can exist without the parent model and if it's required, delete the ones that are not in the array

        const parentModelField = getRelationField(model, parentModel, modelFields, true);

        if (parentModelField) {
            if (Array.isArray(relatedObjects)) {
                prismaQuery.deleteMany = {
                    id: {
                        not: {
                            in: relatedObjects.filter((item: Item) => {
                                return isIdValid(item.id)
                            }).map((item: Item) => {
                                return item.id
                            })
                        }
                    }
                };
            }
        }
    }

    for (const item of body[field]) {

        const action = getAction(item);
        const processedRelatedObject = await processRequestBody(model, item, action === 'update', false, parentModel);

        if (action === 'connect') {

            const mode = isUpdate ? 'set' : 'connect';

            if (!prismaQuery[mode]) {
                prismaQuery[mode] = [];
            }

            prismaQuery[mode].push({ id: item.id });

        } else if (action === 'update' && isUpdate) {

            if (!prismaQuery.upsert) {
                prismaQuery.upsert = [];
            }

            const relatedObject = await processRequestBody(model, item, true);

            const relationField = getRelationField(model, parentModel, modelFields);

            if (relationField) {
                relatedObject[relationField] = undefined;
            }

            relatedObject.id = undefined;

            prismaQuery.upsert.push({
                where: getWhereClause(modelFields, item),
                create: relatedObject,
                update: relatedObject
            });

        } else {

            if (!prismaQuery.connectOrCreate) {
                prismaQuery.connectOrCreate = [];
            }

            item.id = undefined;
            prismaQuery.connectOrCreate.push({
                create: processedRelatedObject,
                where: getWhereClause(modelFields, item)
            });
        }
    }

    return prismaQuery;
}

function getAction(relatedObject: any) {
    const validActions = ['connect', 'create', 'update'];

    const sentAction = relatedObject['_action_'] ?? undefined;

    if (sentAction && validActions.includes(sentAction)) {
        
        if (sentAction === 'update' || sentAction === 'connect') {
            if (isIdValid(relatedObject.id)) {
                return sentAction;
            } else {
               if (sentAction === 'connect') {
                   throw new ApiValidationError('id is required for connect action');
               }
            }
        }
    }

    if (isIdValid(relatedObject.id)) {
        return 'connect';
    }

    return 'create';
}

function getRelationField(model: string, parentModel: string, modelFields: readonly Prisma.DMMF.Field[], required: boolean = false) {
    for (const field of modelFields) {

        const relationName = (field.relationName || '').toLowerCase();
        const relationTo = (parentModel + 'To' + model).toLowerCase();

        if (field.type.toLowerCase() === parentModel.toLowerCase() && relationName === relationTo) {
            if (required) {
                if (field.isRequired) {
                    return field.relationFromFields?.[0];
                }
            } else {
                return field.relationFromFields?.[0];
            }
        }
    }
}

function isIdValid(id: ID) {
    return id != undefined && id != 0 && id != null
}

function processBoolean(value: any, key: string) {
    if (getBoolean(value) !== undefined) {
        return getBoolean(value);
    } else {
        throw new ApiValidationError(key + ' must be a boolean');
    }
}

function processInt(value: any, key: string) {

    if (!isNaN(parseInt(value))) {
        return parseInt(value);
    } else {
        throw new ApiValidationError(key + ' must be a number');
    }
}

function getWhereClause(modelFields: readonly Prisma.DMMF.Field[], body: any) {
   
    const where: any = {};
   
    let idType = 'int';

    modelFields.forEach(f => {
     
        if (f.isUnique) {
            if (body[f.name]) {
               where[f.name] = f.type.toLowerCase() === 'string' ? sanitizeString(body[f.name]) : body[f.name];
            } 
        }

        if (f.name === 'id') {
            idType = f.type.toLowerCase();
        }

    });

    if (Object.keys(where).length === 0) {
       where['id'] = idType === 'int' ? -1 : '-1';
    }

    return where;
}

function isFieldMandatory(model: string, parentModel: string, field: Prisma.DMMF.Field, body: any, modelFields: readonly Prisma.DMMF.Field[]) {

    const appGeneratedPostfix = ['Normalized', 'Slug'];

    if (appGeneratedPostfix.some(postfix => field.name.endsWith(postfix))) {
        return false;
    }

    if (field.isRequired && !field.hasDefaultValue && !field.isList && !field.isUpdatedAt) {

        if (body[field.name]) {
            return false;
        }

        const relatedField = getRelationField(model, parentModel, modelFields);

        if (relatedField) {
            return false;
        }

        return true;
    }

    return false;
}

function calculateSkip(pageSize: number, page: number) {
    return (page - 1) * pageSize;
}

export function getParamsFromPath(path: string) {

    const info = {
        model: '',
        id: '',
        hasQuery: false,
        isUpload: false,
        isImport: false,
        isExport: false
    };

    const parts = path.replace('/api/', '').split('/');

    info.model = capitalize(parts[0]);

    parts.shift();

    if (parts[parts.length - 1] === 'query') {
        info.hasQuery = true;
        parts.pop();
    } 

    if (parts[parts.length - 1] === 'upload') {
        info.isUpload = true;
        parts.pop();
    }

    if (parts[parts.length - 1] === 'import') {
        info.isImport = true;
        parts.pop();
    }

    if (parts[parts.length - 1] === 'export') {
        info.isExport = true;
        parts.pop();
    }

    if (parts.length > 0) {
        info.id = parts[0];
    }

    return info;
}

export function createRequest(body: Partial<PaginatedQuery>) {
    const request: PaginatedQuery = {
        pageSize: body.pageSize || 20,
        page: body.page || 1,
        select: body.select || undefined,
        where: body.where || undefined,
        include: body.include || undefined,
        orderBy: body.orderBy || undefined
    };

    return request;
}

export function convertQueryParamsToPaginatedQuery(queryParams: ParsedQs) {

    const body: Partial<PaginatedQuery> = {};


    try {
        if (queryParams.pageSize) {
            body.pageSize = Number(queryParams.pageSize);
        }

        if (queryParams.page) {
            body.page = Number(queryParams.page);
        }

        if (queryParams.select) {
            body.select = JSON.parse(queryParams.select.toString());
        }

        if (queryParams.where) {
            body.where = JSON.parse(queryParams.where.toString());
        }

        if (queryParams.include) {

            if (queryParams.include === '*') {
                body.include = '*';
            } else {
                body.include = JSON.parse(queryParams.include.toString());
            }
        }

        if (queryParams.orderBy) {
            body.orderBy = JSON.parse(queryParams.orderBy.toString());
        }

        return body;

    } catch (error: SyntaxError | any) {
        throw new ApiValidationError('Invalid query parameters: ' + (process.env.NODE_ENV === 'development' ? error.message : ''));
    }
}

export function convertPaginatedQueryToPrismaQuery(request: PaginatedQuery, model: string) {

    const prismaQuery = convertQueryToPrismaQuery(request, model);

    if (request.pageSize === -1) {
        prismaQuery.take = undefined;
        prismaQuery.skip = undefined;
        return prismaQuery;
    }


    if (request.pageSize) {
        prismaQuery.take = request.pageSize;
    }

    if (request.page) {
        prismaQuery.skip = calculateSkip(request.pageSize, request.page);
    }

    return prismaQuery;

}

function convertQueryToPrismaQuery(query: Query, model: string, addOrderBy: boolean = true) {

    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === model.toLowerCase())?.fields;
    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    modelFields?.forEach(f => {
        fieldsMap.set(f.name, f);
    });

    const prismaQuery: any = {};

    if (query.select) {
        prismaQuery.select = {};
        query.select.forEach(field => {

            validateFieldInModel(fieldsMap, field, model);
            prismaQuery.select[field] = true;

        });
    }

    if (query.where) {
        prismaQuery.where = convertWhereToPrismaQuery(query.where, model, fieldsMap);
    } 

    if (query.include) {
        if (query.select) {

            const include = convertIncludeToPrismaQuery(query.include, model, fieldsMap);

            prismaQuery.select = {
                ...prismaQuery.select,
                ...include
            };
        } else {
            prismaQuery.include = convertIncludeToPrismaQuery(query.include, model, fieldsMap);
        }
    }

    if (query.orderBy === undefined && addOrderBy) {
        query.orderBy = fieldsMap.get('name') ? { name: 'asc' } : fieldsMap.get('id') ? { id: 'asc' } : undefined;
    }

    if (query.orderBy) {
        prismaQuery.orderBy = convertOrderToPrismaQuery(query.orderBy, model, fieldsMap);
    }

    return prismaQuery;
}

export function convertWhereToPrismaQuery(where: Where, model: string, fieldsMap: Map<string, Prisma.DMMF.Field>) {

    let prismaQuery: any = {};

    const keys = Object.keys(where);

    keys.forEach(key => {

        if (key === 'and' || key === 'or' || key === 'not') {

            const operator = key.toUpperCase();

            prismaQuery[operator] = [];

            if (Array.isArray(where[key])) {
                // @ts-ignore
                where[key].forEach(condition => {
                    const field = Object.keys(condition)[0];
                    prismaQuery[operator].push(convertConditionToPrismaQuery(field, condition[field] as Condition, model, fieldsMap));
                });

            } else {

                prismaQuery[operator].push(convertConditionToPrismaQuery(key, where[key] as Condition, model, fieldsMap));

            }

        } else {

            prismaQuery['AND'] = prismaQuery['AND'] || [];

            prismaQuery['AND'].push(convertConditionToPrismaQuery(key, where[key] as Condition, model, fieldsMap));
        }

    });

    return prismaQuery;

}

function convertConditionToPrismaQuery(field: string, condition: Condition, model: string, fieldsMap: Map<string, Prisma.DMMF.Field>) {

    let isNormalized = false;

    validateFieldInModel(fieldsMap, field, model)

    if (fieldsMap.get(field + 'Normalized') !== undefined) {
        field = field + 'Normalized';
        isNormalized = true;
    }

    const prismaQuery: any = {};
    prismaQuery[field] = {};

    const conditionType = typeof condition;

    if (Array.isArray(condition) || conditionType === 'string' || conditionType === 'number' || conditionType === 'boolean') {

        if (Array.isArray(condition)) {
            prismaQuery[field].in = parseNumber(condition);
        } else {
            if (conditionType === 'boolean') {
                prismaQuery[field].equals = getBoolean(condition);
            } else {
                // @ts-ignore
                prismaQuery[field].equals = isNormalized ? normalizeString(condition) : parseNumber(condition);
            }
        }

        return prismaQuery;
    }

    const key = Object.keys(condition)[0];
    
    const operator = key.toLowerCase();
    const value = condition[key];

    switch (operator) {
        case '=':
        case 'eq':
        case 'equals':
            prismaQuery[field].equals = isNormalized ? normalizeString(value as string) : parseNumber(value);
            break;
        case '!=':
        case 'not':
            prismaQuery[field].not = { equals: parseNumber(value) };
            break;
        case '>':
        case 'gt':
            prismaQuery[field].gt = parseNumber(value);
            break;
        case '<':
        case 'lt':
            prismaQuery[field].lt = parseNumber(value);
            break;
        case '>=':
        case 'gte':
            prismaQuery[field].gte = parseNumber(value);
            break;
        case '<=':
        case 'lte':
            prismaQuery[field].lte = parseNumber(value);
            break;
        case 'contains':
        case 'like':
            prismaQuery[field].contains = isNormalized ? normalizeString(value as string) : value;
            break;
        case 'notlike':
            prismaQuery[field].not = { contains: isNormalized ? normalizeString(value as string) : value };
            break;
        case 'startswith':
        case 'start':
            prismaQuery[field].startsWith = isNormalized ? normalizeString(value as string) : value;
            break;
        case 'endswith':
        case 'end':
            prismaQuery[field].endsWith = isNormalized ? normalizeString(value as string) : value;
            break;
        case 'in':
            prismaQuery[field].in = Array.isArray(value) ? value : [value];
            break;
        case 'notin':
            prismaQuery[field].not = { in: Array.isArray(value) ? value : [value] };
            break;
        case 'isnull':
            prismaQuery[field].equals = value ? null : { not: null };
            break;
        default:
            prismaQuery[field].equals = isNormalized ? normalizeString(value as string) : parseNumber(value);
            break;
    }

    return prismaQuery;

}

function convertIncludeToPrismaQuery(include: Include | string[] |string, model: string, fieldsMap: Map<string, Prisma.DMMF.Field>) {

    if (typeof include === 'string') {
        const prismaQuery: any = {};
        if (include === '*') {
            fieldsMap.forEach(f => {
                if (f.kind === 'object') {
                    prismaQuery[f.name] = true;
                }
            });
            return prismaQuery;
        }
    }

    const prismaQuery: any = {};

    if (Array.isArray(include)) {

        include.forEach(field => {

            validateFieldInModel(fieldsMap, field, model);

            prismaQuery[field] = true;
        });

    } else if (typeof include === 'object') {

        const fields = Object.keys(include);

        fields.forEach(field => {

            validateFieldInModel(fieldsMap, field, model);
            const modelField = fieldsMap.get(field);

            if (typeof include[field] === 'boolean') {
                prismaQuery[field] = include[field];
            } else {

                if (modelField?.kind !== 'object') {
                    throw new ApiValidationError(field + ' is not a relation');
                }

                prismaQuery[field] = convertQueryToPrismaQuery(include[field] as Query, modelField?.type || '', false);
            }
        });
    }

    return prismaQuery;

}

function validateFieldInModel(fieldsMap: Map<string, Prisma.DMMF.Field>, field: string, model: string = '') {
    if (fieldsMap.get(field) === undefined) {
        // TODO: Log error instead of throwing
        //throw new ApiValidationError(field + ' is not a valid field for ' + model);
    }
}

function convertOrderToPrismaQuery(order: Order | string[], model: string, fieldsMap: Map<string, Prisma.DMMF.Field>) {
    const orderBy: Order[] = [];

    const processField = (field: string, direction: 'asc' | 'desc' = 'asc') => {

        validateFieldInModel(fieldsMap, field, model);

        if (fieldsMap.get(field + 'Normalized') !== undefined) {
            field = field + 'Normalized';
        }

        orderBy.push({ [field]: direction });
    };

    if (Array.isArray(order)) {
        order.forEach(field => processField(field));
    } else {
        Object.entries(order).forEach(([key, direction]) => processField(key, direction));
    }

    return orderBy;
}

export function validatePaginatedQuery(query: PaginatedQuery) {

    if (query.pageSize && (query.pageSize < 1) && (query.pageSize !== -1)) {
        throw new ApiValidationError('pageSize must be greater than 0 or -1');
    }

    if (query.page && (query.page < 1)) {
        throw new ApiValidationError('pageNumber must be greater than 0');
    }

    validateQuery(query);

}

function validateQuery(query: Query) {

    if (query.select) {
        validateSelect(query.select);
    }

    if (query.orderBy) {
        validateOrder(query.orderBy);
    }

    if (query.where) {
        validateWhere(query.where);
    }

    if (query.include) {
        validateInclude(query.include);
    }

}

function validateSelect(select: string[]) {
    return select.length > 0;
}

function validateInclude(include: Include | string[] | string) {

    if (include === '*' || typeof include === 'string') {
        return;
    }

    if (Array.isArray(include)) {
        return include.length > 0;
    } else {
        const keys = Object.keys(include);
        keys.forEach(key => {
            if (typeof include[key] !== 'boolean') {
                validateQuery(include[key] as Query);
            }
        });
    }
}

export function validateWhere(where: Where) {

    const keys = Object.keys(where);

    if (where.and || where.or || where.not) {
        keys.forEach(key => {
            if (key !== 'and' && key !== 'or' && key !== 'not') {
                throw new ApiValidationError('If using or, and or not, where must not have any other conditions');
            }
        });
    }

    for (const key of keys) {
        if (key === 'and' || key === 'or' || key === 'not') {
            validateWhereOperator(key, where);
        } else {
            validateCondition(where[key] as Condition);
        }
    }
}

function validateWhereOperator(key: string, where: Where) {
    if (Array.isArray(where[key])) {
        // @ts-ignore
        where[key].forEach(condition => {

            const field = Object.keys(condition)[0];

            validateCondition(condition[field] as Condition);
        });
    } else {
        // @ts-ignore
        validateCondition(where[key]);
    }
}

function validateOrder(order: Order | string[]) {
    if (Array.isArray(order)) {
        return order.length > 0;
    }

    for (const key in order) {
        if (order[key] !== 'asc' && order[key] !== 'desc') {
            throw new ApiValidationError('Order must be asc or desc');
        }
    }
}

function validateCondition(condition: Condition) {

    if (typeof condition === 'string' || typeof condition === 'number' || Array.isArray(condition) || typeof condition === 'boolean') {
        return;
    }

    const keys = Object.keys(condition);

    if (keys.length !== 1) {
        throw new ApiValidationError('Condition must have only one operator');
    }

    const key = keys[0];

    const operator = key.toLowerCase();

    const value = condition[key];

    const validOperators = getValidOperators();

    if (!validOperators.includes(operator)) {
        throw new ApiValidationError('Operator must be one of ' + validOperators.join(', '));
    }

    if (Array.isArray(value)) {
        if (operator !== 'in' && operator !== 'notin') {
            throw new ApiValidationError('Operator must be in or notin');
        }
    } 

    if (operator === 'isnull') {
        if (typeof value !== 'boolean') {
            throw new ApiValidationError('Value must be a boolean for isNull operator');
        }
    }


}

export function getValidOperators() {
    return ['=', 'eq', '!=', 'not', '>', 'gt', '<', 'lt', '>=', 'gte', '<=', 'lte', 'contains', 'like', 'notlike', 'startswith', 'start', 'endswith', 'end', 'in', 'notin', 'equals', 'isnull'];
}

async function calculateSlug(name: string, model: string, key: string) {

    // @ts-ignore
    const obj = await prisma[model].findFirst({
        where: {
            [key]: normalizeString(name, true)
        }
    });

    if (!obj) {
        return normalizeString(name, true);
    } else {
        return await calculateSlug(name + '-' + uuidv4().substring(0, 4), model, key);
    }
}