import { Prisma } from '@prisma/client';
import type { ParsedQs } from 'qs';
import { ApiValidationError } from '../error';
import sanitizeHtml from 'sanitize-html'
import normalizeString from '../../../utils/normalizeString';
import type { Condition, Include, Order, PaginatedQuery, Query, Where } from './interfaces';
import  hashPassword from '../../../utils/hashPassword';
import getBoolean from '../../../utils/getBoolean';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '~/server/prisma/prisma';


export async function convertBodyToPrismaUpdateOrCreateQuery(model: string, body: any, isUpdate: boolean = false, isConnectOrCreate: boolean = false, parentModel: string = '', parentBody = {}) {

    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === model.toLowerCase())?.fields;

    const prismaQuery: any = {};

    if (isConnectOrCreate) {
        return await addConnectOrCreateFields(modelFields, body, model, parentModel, parentBody);
    }

    const keys = Object.keys(body);

    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    modelFields?.forEach(f => {

        if (isFieldMandatory(f, body, parentModel) && !isUpdate) {
            throw new ApiValidationError(f.name + ' is required for ' + model);
        }

        fieldsMap.set(f.name, f);
    });

    for (const key of keys) {

        const field = fieldsMap.get(key);

        validateFieldInModel(fieldsMap, key, model);

        if (!field || body[key] === undefined) {
            return;
        }


        if (fieldsMap.get(key + 'Normalized') !== undefined) {
            prismaQuery[key + 'Normalized'] = normalizeString(body[key]);
        }


        const keySlug = key + 'Slug';
        if (fieldsMap.get(keySlug) !== undefined && body[keySlug] === undefined) {
            prismaQuery[keySlug] = await calculateSlug(body[key], model, keySlug);
        }

        if (key === 'password') {
            body[key] = hashPassword(body[key]);
        }

        if (body[key] === '' || body[key] == null) {
            prismaQuery[key] = body[key + 'Id'] !== undefined ? undefined : null;
            continue;
        }

        if (field.type.toLowerCase() === 'int') {

            prismaQuery[key] = processInt(body[key], key);

        } else if (field.type.toLowerCase() === 'string') {

            prismaQuery[key] = sanitizeHtml(body[key].toString());

        } else if (field.type.toLowerCase() === 'boolean') {

            prismaQuery[key] = processBoolean(body[key], key);

        } else if (field.kind.toLowerCase() === 'object') {

            const relatedModel = field.type;

            if (!field.isList) {

                prismaQuery[key] = await processSingleObject(relatedModel, model, body, key, isUpdate);

                if (fieldsMap.get(key + 'Id') !== undefined) {
                    delete prismaQuery[key + 'Id'];
                }

            } else {

                prismaQuery[key] = await processMultipleObjects(relatedModel, model, body, key, isUpdate);
            }
        }
    }

    if (!isUpdate) {
        prismaQuery.id = undefined;
    }

    return prismaQuery;
}

async function processSingleObject(relatedModel: string, model: string, body: any, key: string, isUpdate: boolean) {
    if (typeof body[key] !== 'object') {
        throw new ApiValidationError(key + ' must be an object');
    }

    const prismaQuery = {} as any;

    if (isUpdate) {

        if (body[key].id !== undefined && body[key].id !== 0) {
            prismaQuery.connect = { id: body[key].id };
        } else {
            // TODO: Upsert if all required fields of the related model are present
            prismaQuery.update = await convertBodyToPrismaUpdateOrCreateQuery(relatedModel, body[key], true, false, model, body);
        }

    } else {
        prismaQuery.connectOrCreate = await convertBodyToPrismaUpdateOrCreateQuery(relatedModel, body[key], false, true, model, body);
    }


    return prismaQuery;
}


async function processMultipleObjects(relatedModel: string, model: string, body: any, key: string, isUpdate: boolean) {
    if (!Array.isArray(body[key])) {
        throw new ApiValidationError(key + ' must be an array');
    }

    const prismaQuery = {} as any;

    if (isUpdate) {
        // check if the related model can exist without the parent model
        const relatedModelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === relatedModel.toLowerCase())?.fields;

        if (relatedModelFields?.find(f => f.name === model.toLowerCase() + 'Id' && f.isRequired) !== undefined) {
    
            if (Array.isArray(body[key])) {
                prismaQuery.deleteMany = { id: { not: { in: body[key].map((item: any) => item.id) } } };
            }

        } else {

            prismaQuery.set = [];

        }
    }

    prismaQuery.connectOrCreate = [];
    prismaQuery.connect = [];

    for (const item of body[key]) {

        if (item.id !== undefined && item.id !== 0) {

            prismaQuery.connect.push({ id: item.id });

        } else {

            item.id = undefined;

            const relatedObject = await convertBodyToPrismaUpdateOrCreateQuery(relatedModel, item, false, true, model);
            prismaQuery.connectOrCreate.push(relatedObject);

        }
    }

    return prismaQuery;
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

async function addConnectOrCreateFields(modelFields: Prisma.DMMF.Field[] | undefined, body: any, model: string, parentModel: string, parentBody: any) {
   
    const prismaQuery: any = {};
   
    prismaQuery.where = {};

    let idType = 'int';

    modelFields?.forEach(f => {
     
        if (isFieldMandatory(f, body, parentModel)) {
            throw new ApiValidationError(f.name + ' is required for ' + model);
        }

        if (f.isUnique) {

            if (body[f.name]) {

               prismaQuery.where[f.name] = body[f.name];

            } else { 

                const foreignKey = parentModel.toLowerCase().replace('app', '') + 'Id';

                if (f.name === foreignKey && parentBody.id) {
                    prismaQuery.where[f.name] = parentBody.id;
                } 
            }
        }

        if (f.name === 'id') {
            idType = f.type.toLowerCase();
        }

    });

    if (Object.keys(prismaQuery.where).length === 0) {
        prismaQuery.where['id'] = idType === 'int' ? -1 : '-1';
    }

    prismaQuery.create = await convertBodyToPrismaUpdateOrCreateQuery(model, body, false, false, parentModel);

    return prismaQuery;
}

function isFieldMandatory(field: Prisma.DMMF.Field, body: any, parentModel: string) {
    if (field.isRequired && !field.hasDefaultValue && !field.isList && !field.isUpdatedAt) {

        if (field.relationFromFields && field.relationFromFields.length > 0) {

            const relatedField = field.relationFromFields[0];

            if (body[relatedField] !== undefined || field.type.toLowerCase() === parentModel.toLowerCase()) {
                return false;
            }
        }

        const foreignKey = parentModel.replace('app', '') + 'Id';

        if (field.kind === 'scalar' && foreignKey.toLowerCase() === field.name.toLowerCase()) {
            return false;
        }

        if (field.kind === 'object' && field.type.toLowerCase() === parentModel.toLowerCase()) { 
            return false;
        }

        if (body[field.name] !== undefined) {
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
        isPublic: false,
        model: '',
        id: '',
        hasQuery: false,
        isUpload: false
    };

    const parts = path.replace('/api/', '').split('/');

    if (parts[0] === 'public') {
        info.isPublic = true;
    } else {
        info.model = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
    }
    parts.shift();

    if (parts[parts.length - 1] === 'query') {
        info.hasQuery = true;
        parts.pop();
    } 

    if (parts[parts.length - 1] === 'upload') {
        info.isUpload = true;
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

    if (queryParams.query) {
        return JSON.parse(queryParams.query.toString());
    }

    if (queryParams.pageSize) {
        body.pageSize = Number(queryParams.pageSize);
    }

    if (queryParams.page) {
        body.page = Number(queryParams.page);
    }

    if (queryParams.select) {
        body.select = convertStringToArray(queryParams.select.toString());
    }

    if (queryParams.where) {
        body.where = convertStringToObject(queryParams.where.toString(), true);
    }

    if (queryParams.include) {
        body.include = convertStringToObject(queryParams.include.toString());
    }

    if (queryParams.orderBy) {
        body.orderBy = convertStringToObject(queryParams.orderBy.toString());
    }

    return body;
}

function convertStringToArray(string: string) {
    return string.split(';');
}

function convertStringToObject(string: string, isWhere: boolean = false) {
    const object: any = {};

    const pairs = string.split(',');

    pairs.forEach(pair => {
        const values = pair.split(':');

        if (isWhere && values.length === 3) {
            const operator = values[1].toLowerCase();

            let value: any = values[2];

            if (operator == 'in' || operator == 'notin') {
                value = value.split(';');
                value = value.map((item: any) => {
                    return isNaN(Number(item)) ? item : Number(item);
                });
            } else {
                value = isNaN(Number(value)) ? value : Number(value);
            }

            object[values[0]] = { 
                operator: operator,
                value: value
            };
        } else if (values.length === 2) {
            object[values[0]] = values[1];
        } else {
            object[values[0]] = true;
        }
    });

    return object;
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

    if (Array.isArray(condition) || typeof condition === 'string' || typeof condition === 'number' || typeof condition === 'boolean') {

        if (Array.isArray(condition)) {
            prismaQuery[field].in = condition;
        } else {
            prismaQuery[field].equals = isNormalized ? normalizeString(condition as string) : condition;
        }

        return prismaQuery;
    }

    const key = Object.keys(condition)[0];
    
    const operator = key.toLowerCase();
    const value = condition[key];

    switch (operator) {
        case '=' || 'eq' || 'equals':
            prismaQuery[field].equals = isNormalized ? normalizeString(value as string) : value;
            break;
        case '!=' || 'not':
            prismaQuery[field].not = { equals: value };
            break;
        case '>' || 'gt':
            prismaQuery[field].gt = parseNumber(value);
            break;
        case '<' || 'lt':
            prismaQuery[field].lt = parseNumber(value);
            break;
        case '>=' || 'gte':
            prismaQuery[field].gte = parseNumber(value);
            break;
        case '<=' || 'lte':
            prismaQuery[field].lte = parseNumber(value);
            break;
        case 'like' || 'contains':
            prismaQuery[field].contains = isNormalized ? normalizeString(value as string) : value;
            break;
        case 'notlike':
            prismaQuery[field].not = { contains: isNormalized ? normalizeString(value as string) : value };
            break;
        case 'startswith' || 'start':
            prismaQuery[field].startsWith = isNormalized ? normalizeString(value as string) : value;
            break;
        case 'endswith' || 'end':
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
            prismaQuery[field].equals = isNormalized ? normalizeString(value as string) : value;
            break;
    }

    return prismaQuery;

}

function convertIncludeToPrismaQuery(include: Include | string[], model: string, fieldsMap: Map<string, Prisma.DMMF.Field>) {

    const prismaQuery: any = {};

    if (Array.isArray(include)) {

        include.forEach(field => {

            validateFieldInModel(fieldsMap, field, model);

            prismaQuery[field] = true;
        });

    } else {
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
        throw new ApiValidationError(field + ' is not a valid field for ' + model);
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

function validateInclude(include: Include | string[]) {

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