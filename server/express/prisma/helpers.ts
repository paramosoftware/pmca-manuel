import { Prisma } from '@prisma/client';
import type { ParsedQs } from 'qs';
import { ApiValidationError } from '../error';
import sanitizeHtml from 'sanitize-html'
import normalizeString from '../../../utils/normalizeString';
import type { Condition, Include, Order, PaginatedQuery, Query, Where } from './interfaces';
import  hashPassword from '../../../utils/hashPassword';
import getBoolean from '../../../utils/getBoolean';


export function convertBodyToPrismaUpdateOrCreateQuery(model: string, body: any, isUpdate: boolean = false, isConnectOrCreate: boolean = false, parentModel: string = '', parentBody = {}) {

    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === model.toLowerCase())?.fields;

    const prismaQuery: any = {};

    if (isConnectOrCreate) {
        return addConnectOrCreateFields(modelFields, body, model, parentModel, parentBody);
    }

    const keys = Object.keys(body);

    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    modelFields?.forEach(f => {

        if (isFieldMandatory(f, body, parentModel) && !isUpdate) {
            throw new ApiValidationError(f.name + ' is required for ' + model);
        }

        fieldsMap.set(f.name, f);
    });

    keys.forEach(key => {

        const field = fieldsMap.get(key);

        if (field === undefined || body[key] === undefined) {
            // TODO: Throw error if the field is not found ?
            return;
        }


        if (fieldsMap.get(key + 'Normalized') !== undefined) {
            prismaQuery[key + 'Normalized'] = normalizeString(body[key]);
        }

        if (fieldsMap.get(key + 'Slug') !== undefined) {
            prismaQuery[key + 'Slug'] = normalizeString(body[key], true);
        }

        if (key === 'password') {
            body[key] = hashPassword(body[key]);
        }

        if (body[key] === '' || body[key] == null) {
            prismaQuery[key] = null;
            return;
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

                prismaQuery[key] = processSingleObject(relatedModel, model, body, key, isUpdate);

                if (fieldsMap.get(key + 'Id') !== undefined) {
                    delete prismaQuery[key + 'Id'];
                }

            } else {

                prismaQuery[key] = processMultipleObjects(relatedModel, model, body, key, isUpdate);
            }
        }
    });

    if (!isUpdate) {
        prismaQuery.id = undefined;
    }

    return prismaQuery;
}

function processSingleObject(relatedModel: string, model: string, body: any, key: string, isUpdate: boolean) {
    if (typeof body[key] !== 'object') {
        throw new ApiValidationError(key + ' must be an object');
    }

    const prismaQuery = {} as any;

    if (isUpdate) {

        if (body[key].id !== undefined && body[key].id !== 0) {
            prismaQuery.connect = { id: body[key].id };
        } else {
            // TODO: Upsert if all required fields of the related model are present
            prismaQuery.update = convertBodyToPrismaUpdateOrCreateQuery(relatedModel, body[key], true, false, model, body);
        }

    } else {
        prismaQuery.connectOrCreate = convertBodyToPrismaUpdateOrCreateQuery(relatedModel, body[key], false, true, model, body);
    }


    return prismaQuery;
}


function processMultipleObjects(relatedModel: string, model: string, body: any, key: string, isUpdate: boolean) {
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

    body[key].forEach((item: any) => {

        if (item.id !== undefined && item.id !== 0) {

            prismaQuery.connect.push({ id: item.id });

        } else {

            item.id = undefined;

            const relatedObject = convertBodyToPrismaUpdateOrCreateQuery(relatedModel, item, false, true, model);
            prismaQuery.connectOrCreate.push(relatedObject);

        }
    });

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

function addConnectOrCreateFields(modelFields: Prisma.DMMF.Field[] | undefined, body: any, model: string, parentModel: string, parentBody: any) {
   
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

    prismaQuery.create = convertBodyToPrismaUpdateOrCreateQuery(model, body, false, false, parentModel);

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
        orderBy: body.orderBy || { id: 'asc' }
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

export function convertPaginatedQueryToPrismaQuery(request: PaginatedQuery) {

    const prismaQuery = convertQueryToPrismaQuery(request);

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

function convertQueryToPrismaQuery(query: Query) {

    const prismaQuery: any = {};

    if (query.select) {
        prismaQuery.select = {};
        query.select.forEach(field => {
            prismaQuery.select[field] = true;
        });
    }

    if (query.where) {
        prismaQuery.where = convertWhereToPrismaQuery(query.where);
    }

    if (query.include) {
        if (query.select) {

            const include = convertIncludeToPrismaQuery(query.include);

            prismaQuery.select = {
                ...prismaQuery.select,
                ...include
            };
        } else {
            prismaQuery.include = convertIncludeToPrismaQuery(query.include);
        }
    }

    if (query.orderBy) {
        prismaQuery.orderBy = convertOrderToPrismaQuery(query.orderBy);
    }

    return prismaQuery;
}

export function convertWhereToPrismaQuery(where: Where) {

    const prismaQuery: any = {};

    const keys = Object.keys(where);

    keys.forEach(key => {


        if (key === 'and' || key === 'or' || key === 'not') {

            const operator = key.toUpperCase();

            prismaQuery[operator] = [];

            if (Array.isArray(where[key])) {
                // @ts-ignore
                where[key].forEach(condition => {
                    const field = Object.keys(condition)[0];
                    prismaQuery[operator].push({ [field]: convertConditionToPrismaQuery(condition[field] as Condition) });
                });
            } else {
                prismaQuery[key].push(convertConditionToPrismaQuery(where[key] as Condition));
            }
        } else {
            prismaQuery[key] = convertConditionToPrismaQuery(where[key] as Condition);
        }

    });

    return prismaQuery;

}

function convertConditionToPrismaQuery(condition: Condition) {

    const prismaQuery: any = {};

    if (condition.operator === undefined) {

        if (Array.isArray(condition)) {
            prismaQuery.in = condition;
        } else {
            prismaQuery.equals = normalizeString(condition as unknown as string);
        }

        return prismaQuery;
    }

    switch (condition.operator) {
        case '=' || 'eq':
            prismaQuery.equals = normalizeString(condition.value as string);
            break;
        case '!=' || 'not':
            prismaQuery.not = { equals: condition.value };
            break;
        case '>' || 'gt':
            prismaQuery.gt = condition.value;
            break;
        case '<' || 'lt':
            prismaQuery.lt = condition.value;
            break;
        case '>=' || 'gte':
            prismaQuery.gte = condition.value;
            break;
        case '<=' || 'lte':
            prismaQuery.lte = condition.value;
            break;
        case 'like':
            prismaQuery.contains = normalizeString(condition.value as string);
            break;
        case 'notlike':
            prismaQuery.not = { contains: normalizeString(condition.value as string) };
            break;
        case 'in':
            prismaQuery.in = Array.isArray(condition.value) ? condition.value : [condition.value];
            break;
        case 'notin':
            prismaQuery.not = { in: Array.isArray(condition.value) ? condition.value : [condition.value] };
            break;
        default:
            prismaQuery.equals = normalizeString(condition.value as string);
            break;
    }

    return prismaQuery;

}

function convertIncludeToPrismaQuery(include: Include | string[]) {

    const prismaQuery: any = {};

    if (Array.isArray(include)) {
        include.forEach(field => {
            prismaQuery[field] = true;
        });
    } else {
        const keys = Object.keys(include);

        keys.forEach(key => {
            if (typeof include[key] === 'boolean') {
                prismaQuery[key] = include[key];
            } else {
                prismaQuery[key] = convertQueryToPrismaQuery(include[key] as Query);
            }
        });
    }


    return prismaQuery;

}

function convertOrderToPrismaQuery(order: Order | string[]) {

    const orderBy: Order[] = [];

    if (Array.isArray(order)) {
        order.forEach(field => {
            orderBy.push({ [field]: 'asc' });
        });
    } else {
        const keys = Object.keys(order);

        keys.forEach(key => {
            orderBy.push({ [key]: order[key] });
        });
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

    if ((condition.operator && !condition.value) || (!condition.operator && condition.value)) {
        throw new ApiValidationError('Condition must have both an operator and a value');
    }

}
