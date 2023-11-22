import express from 'express'
import { prisma } from '../prisma/prisma';
import type { ParsedQs } from 'qs';
import ApiValidationError from './errors/ApiValidationError';
import { normalizeString } from './utils';


type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'not like' | 'in' | 'not in';
type Direction = 'asc' | 'desc';

interface Where {
    and?: Condition | Condition[];
    or?: Condition | Condition[];
    not?: Condition | Condition[];
    [key: string]: string | number | string[] | number[] | Condition | Condition[] | undefined
}

interface Condition {
    [key: string]: {
        operator: Operator;
        value: string | number | string[] | number[] 
    } 
    | string | number | string[] | number[];
}

interface Order {
    [key: string]: Direction;
}

interface Include {
    [key: string]: Query | boolean;
}

interface Query {
    select?: string[]
    where?: Where
    include?: Include | string[]
    orderBy?: Order
    take?: number
    skip?: number
}

interface PaginatedQuery extends Query {
    pageSize: number;
    pageNumber: number;
}

const prismaRequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    /*
    GET /api/:model - Get many
    GET /api/:model/:id - Get one

    PUT /api/:model - Update all
    PUT /api/:model/:id - Update one

    POST /api/:model - Create one or many
    POST /api/:model/query - Get one or many with query
    POST /api/:model/:id - Get one with query

    DELETE /api/:model/:id - Delete one
    DELETE /api/:model/query - Delete one or many with query
    */

    const method = req.method;
    const body = req.body;
    const queryParams = req.query;

    const { model, id, query } = getParamsFromPath(req.path);

    if (!model || prisma[model] === undefined) { 
        return next(); 
    }


    switch (method) {
        case 'GET':
            if (id) {
                readOne(model, id, body, res, next);
            } else {
                readMany(model, queryParams, res, next);
            }
            break;
        case 'PUT':
            if (id) {
        //        updateOne(model, id, body, res, next);
            } else {
        //        updateMany(model, body, res, next);
            }
            break;
        case 'POST':
            if (id) {
                readOne(model, id, body, res, next);
            } else if (query) {
                readOneOrManyWithQuery(model, body, res, next);
            } else {
        //        createOneOrMany(model, body, res, next);
            }
            break;
        case 'delete':
            if (id) {
        //        deleteOne(model, id, res, next);
            } else if (query) {
        //        deleteOneOrManyWithQuery(model, body, res, next);
            }
            break;
        default:
            next();
    }
}

async function readOne(model: string, id: string, body: Partial<PaginatedQuery>, res: express.Response, next: express.NextFunction) {

    const request = createRequest(body);
    request.orderBy = undefined;
    request.pageSize = -1;
    
    try {
        validatePaginatedQuery(request);
    } catch (error) {
        return next(error);
    }

    const query = convertPaginatedQueryToPrismaQuery(request);

    query.where = { id: Number(id) };

    await executePrismaFindUniqueQuery(model, query, res, next);
}

async function readMany(model: string, queryParams: ParsedQs, res: express.Response, next: express.NextFunction) {

    const body = convertQueryParamsToPaginatedQuery(queryParams);
    const request = createRequest(body);

    try {
        validatePaginatedQuery(request);
    } catch (error) {
        return next(error);
    }

    const query = convertPaginatedQueryToPrismaQuery(request);

    await executePrismaFindQuery(model, query, res, next);
}

async function readOneOrManyWithQuery(model: string, body: Partial<PaginatedQuery>, res: express.Response, next: express.NextFunction) {

    const request = createRequest(body);

    try {
        validatePaginatedQuery(request);
    } catch (error) {
        return next(error);
    }

    const query = convertPaginatedQueryToPrismaQuery(request);

    await executePrismaFindQuery(model, query, res, next);
}


async function executePrismaFindUniqueQuery(model: string, query: Query, res: express.Response, next: express.NextFunction) {
    try {
        // @ts-ignore
        const data = await prisma[model].findUnique(query);

        res.json(data);

    } catch (error) {
        next(error);
    }
}


async function executePrismaFindQuery(model: string, query: Query, res: express.Response, next: express.NextFunction) {

    try {
        const [total, data] = await prisma.$transaction([
            // @ts-ignore
            prisma[model].count({ where: query.where }),
            // @ts-ignore
            prisma[model].findMany(query)
        ]);

        res.json({ total, data });
        
    } catch (error) {
       next(error);
    }
}

function calculateSkip(pageSize: number, pageNumber: number) {
    return (pageNumber - 1) * pageSize;
}

function getParamsFromPath(path: string) {
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

function createRequest(body: Partial<PaginatedQuery>) {
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

function convertQueryParamsToPaginatedQuery(queryParams: ParsedQs) {

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

function convertPaginatedQueryToPrismaQuery(request: PaginatedQuery) {

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

function convertWhereToPrismaQuery(where: Where) {

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

function validatePaginatedQuery(query: PaginatedQuery) {

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

function validateWhere(where: Where) {
    
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

export default prismaRequestHandler;