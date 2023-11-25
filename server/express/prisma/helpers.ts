import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { ParsedQs } from 'qs';
import { ApiValidationError } from '../error';
import { normalizeString, sanitizeHtml } from '../utils';
import type { Condition, Include, Order, PaginatedQuery, Query, Where } from './interfaces';


export function convertBodyToPrismaUpdateOrCreateQuery(model: string, body: any, isUpdate: boolean = false, isConnectOrCreate: boolean = false, parentModel: string = '') {

    const modelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === model.toLowerCase())?.fields;

    const prismaQuery: any = {};

    if (isConnectOrCreate) {
        return addConnectOrCreateFields(modelFields, body, parentModel, model);
    }

    const keys = Object.keys(body);

    keys.forEach(key => {

        const field = modelFields?.find(f => f.name === key);

        if (field === undefined) {
            return;
        }

        if (modelFields?.find(f => f.name === key + 'Normalized') !== undefined) {

            prismaQuery[key] = sanitizeHtml(body[key]);
            prismaQuery[key + 'Normalized'] = normalizeString(body[key], true);

        }

        if (key === 'slug') {

            prismaQuery[key] = normalizeString(body['name'], true);

            // TODO: Temporary? Consider moving this to a separate logic related to auth
        } else if (key === 'password' && body[key] != undefined) {

            prismaQuery[key] = bcrypt.hashSync(body[key], 10);

        } else if (field.isReadOnly && field.type.toLowerCase() === 'int') {

            if (body[key] === '' || body[key] == 0 || body[key] === null) {

                if (field.isRequired && !field.hasDefaultValue) {
                    throw new ApiValidationError(key + ' is required for ' + model);
                }

                prismaQuery[key] = null;

            } else if (!isNaN(parseInt(body[key]))) {

                prismaQuery[key] = parseInt(body[key]);

            } else {

                throw new ApiValidationError(key + ' must be a number');

            }

        } else if (typeof body[key] === 'string') {

            if (body[key] === '') {
                if (field.isRequired && !field.hasDefaultValue) {
                    throw new ApiValidationError(key + ' is required for ' + model);
                }

                prismaQuery[key] = null;

            } else {

                prismaQuery[key] = body[key];

            }

        } else if (Array.isArray(body[key])) {

            prismaQuery[key] = {};

            const relatedModel = field?.type;

            if (!relatedModel) {
                throw new ApiValidationError('Related model not found in ' + model + ' for ' + key);
            }

            if (isUpdate) {
                // check if the related model can exist without the parent model
                const relatedModelFields = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === relatedModel.toLowerCase())?.fields;

                if (relatedModelFields?.find(f => f.name === model.toLowerCase() + 'Id' && f.isRequired) !== undefined) {

                    prismaQuery[key].deleteMany = { id: { not: { in: body[key].map((item: any) => item.id) } } };

                } else {

                    prismaQuery[key].set = [];

                }
            }

            prismaQuery[key].connectOrCreate = [];
            prismaQuery[key].connect = [];

            body[key].forEach((item: any) => {


                if (item.id !== undefined && item.id !== 0) {

                    prismaQuery[key].connect.push({ id: item.id });

                } else {

                    item.id = undefined;

                    const relatedObject = convertBodyToPrismaUpdateOrCreateQuery(relatedModel, item, false, true, model);
                    prismaQuery[key].connectOrCreate.push(relatedObject);

                }
            });
        }
    });

    if (!isUpdate) {
        prismaQuery.id = undefined;
    }

    return prismaQuery;
}

function addConnectOrCreateFields(modelFields: Prisma.DMMF.Field[] | undefined, body: any, parentModel: string, model: string) {
   
    const prismaQuery: any = {};
   
    prismaQuery.where = {};

    modelFields?.forEach(f => {
        // TODO: check if there is a cleaner way to do this
        if (f.isRequired && !f.hasDefaultValue && !f.isList && !f.isUpdatedAt && body[f.name] === undefined) {

            if (f.relationFromFields && f.relationFromFields.length > 0) {

                const relatedField = f.relationFromFields[0];

                if (body[relatedField] !== undefined || f.type.toLowerCase() === parentModel.toLowerCase()) {
                    return;
                }
            }

            if (f.kind === 'scalar' && parentModel + 'Id'.toLowerCase() !== f.name.toLowerCase()) {
                return;
            }

            throw new ApiValidationError(f.name + ' is required for ' + model);
        }

        if (f.isUnique && f.name !== 'slug') {
            prismaQuery.where[f.name] = body[f.name];
        }
    });

    if (Object.keys(prismaQuery.where).length === 0) {
        prismaQuery.where['id'] = -1;
    }

    prismaQuery.create = convertBodyToPrismaUpdateOrCreateQuery(model, body);

    return prismaQuery;
}

function calculateSkip(pageSize: number, pageNumber: number) {
    return (pageNumber - 1) * pageSize;
}

export function getParamsFromPath(path: string) {
    const params = path.split('/').filter(param => param !== 'api' && param !== '');

    if (params.length === 1) {
        return { model: params[0], id: '', query: '' };
    }

    if (params.length === 2) {
        if (params[1] === 'query') {
            return { model: params[0], id: '', query: params[1] };
        } else if (!isNaN(Number(params[1]))) {
            return { model: params[0], id: params[1], query: '' };
        }
    }

    return { model: '', id: '', query: '' };
}

export function createRequest(body: Partial<PaginatedQuery>) {
    const request: PaginatedQuery = {
        pageSize: body.pageSize || 20,
        pageNumber: body.pageNumber || 1,
        select: body.select || undefined,
        where: body.where || undefined,
        include: body.include || undefined,
        orderBy: body.orderBy || { id: 'asc' }
    };

    return request;
}

export function convertQueryParamsToPaginatedQuery(queryParams: ParsedQs) {

    const body: Partial<PaginatedQuery> = {};

    if (queryParams.pageSize) {
        body.pageSize = Number(queryParams.pageSize);
    }

    if (queryParams.pageNumber) {
        body.pageNumber = Number(queryParams.pageNumber);
    }

    if (queryParams.select) {
        body.select = convertStringToArray(queryParams.select.toString());
    }

    if (queryParams.where) {
        body.where = convertStringToObject(queryParams.where.toString());
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
    return string.split(',');
}

function convertStringToObject(string: string) {
    const object: any = {};

    const pairs = string.split(',');

    pairs.forEach(pair => {
        const [key, value] = pair.split(':');
        object[key] = value;
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

    if (request.pageNumber) {
        prismaQuery.skip = calculateSkip(request.pageSize, request.pageNumber);
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
        case '=':
            prismaQuery.equals = normalizeString(condition.value as string);
            break;
        case '!=':
            prismaQuery.not = { equals: condition.value };
            break;
        case '>':
            prismaQuery.gt = condition.value;
            break;
        case '<':
            prismaQuery.lt = condition.value;
            break;
        case '>=':
            prismaQuery.gte = condition.value;
            break;
        case '<=':
            prismaQuery.lte = condition.value;
            break;
        case 'like':
            prismaQuery.contains = normalizeString(condition.value as string);
            break;
        case 'not like':
            prismaQuery.not = { contains: normalizeString(condition.value as string) };
            break;
        case 'in':
            prismaQuery.in = Array.isArray(condition.value) ? condition.value : [condition.value];
            break;
        case 'not in':
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

    if (query.pageNumber && (query.pageNumber < 1)) {
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
