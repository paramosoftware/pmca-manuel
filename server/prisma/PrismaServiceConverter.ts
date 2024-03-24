import { Prisma } from '@prisma/client';
import cache from '~/utils/cache';
import getBoolean from '~/utils/getBoolean';
import logger from '~/utils/logger';
import normalizeString from '~/utils/normalizeString';
import parseNumber from '~/utils/parseNumber';
import { ApiValidationError } from '../express/error';
import { prisma } from '../prisma/prisma';
import uncapitalize from '~/utils/uncapitalize';

class PrismaServiceConverter {
    private model: string;
    private pageSize: number = 20;
    private page: number = 1;
    private modelFields: readonly Prisma.DMMF.Field[];
    private fieldsMap: Map<string, Prisma.DMMF.Field>;
    private checkPermissions: boolean = true;
    private userId: ID = '';
    public permissions: Permission = {};
    private onlyPublished: boolean = false;

    constructor(
        model: string,
        modelFields: readonly Prisma.DMMF.Field[],
        fieldsMap: Map<string, Prisma.DMMF.Field>,
        checkPermissions: boolean = true,
        onlyPublished: boolean = false
    ) {
        this.model = model;
        this.modelFields = modelFields;
        this.fieldsMap = fieldsMap;
        this.checkPermissions = checkPermissions;
        this.onlyPublished = onlyPublished;
    }

    /**
     * Converts the request to a Prisma query
     * @param body
     * @param  {boolean} [paginated=false] - Whether to process the request as a paginated request and add pagination to the query
     * @param identifierToAddUniqueFields - Identifier to add unique fields to the where clause with OR as: where: { OR: [{ id: 'article' }, { name: 'article' }, { nameSlug: 'article' }] }
     * @param {string} [partialResource] - The field to be returned as response in case of a partial resource request
     * @returns A Prisma query or a paginated Prisma query
     * @throws ApiValidationError
     * @example body = { select: ['id', 'name'], where: { id: 1 }, include: { user: { select ['id', 'name'] } }, orderBy: { name: 'asc' }, pageSize: 20, page: 1 }
     */
    async convertRequestToPrismaQuery(
        request: Query,
        paginated: boolean = false,
        identifierToAddUniqueFields?: ID | undefined,
        partialResource?: string
    ) {
        const query = {
            select: request.select || undefined,
            where: request.where || undefined,
            include: request.include || undefined,
            orderBy: request.orderBy || undefined
        } as Query;

        if (this.checkPermissions) {
            await this.mergeRelatedPermissions();
        }

        const partialResourceWhere = this.convertToPartialResourceRequest(
            partialResource,
            identifierToAddUniqueFields
        );

        let prismaQuery = this.convertQuery(query, this.model);

        if (paginated) {
            request.pageSize = request.pageSize || this.pageSize;
            request.page = request.page || this.page;

            if (request.pageSize === -1) {
                prismaQuery.take = undefined;
                prismaQuery.skip = undefined;
            } else {
                if (request.pageSize) {
                    prismaQuery.take = request.pageSize;
                }

                if (request.page) {
                    prismaQuery.skip = this.calculateSkip(
                        request.pageSize,
                        request.page
                    );
                }
            }
        }

        if (partialResource) {
            prismaQuery = this.addClauseToWhereOperator(
                prismaQuery,
                partialResourceWhere,
                'AND'
            );
        } else if (identifierToAddUniqueFields) {
            const whereUniqueFields = this.getUniqueFieldsToAddInWhereClause(
                identifierToAddUniqueFields
            );

            prismaQuery = this.addClauseToWhereOperator(
                prismaQuery,
                whereUniqueFields,
                'OR'
            );
        }

        if (this.onlyPublished && this.fieldsMap.get('published')) {
            prismaQuery = this.addClauseToWhereOperator(
                prismaQuery,
                { published: true },
                'AND'
            );
        }

        return prismaQuery;
    }

    private getUniqueFieldsToAddInWhereClause(
        identifierToAddUniqueFields: ID | undefined
    ) {
        const where = [] as any;

        if (identifierToAddUniqueFields) {
            const uniqueFields = this.modelFields.filter(
                (f) => f.isUnique || f.isId
            );

            for (const field of uniqueFields ?? []) {
                const value = parseNumber(identifierToAddUniqueFields);
                const valueType = typeof value;

                if (field.type === 'Int' && valueType === 'number') {
                    where.push({ [field.name]: value });
                }

                if (field.type === 'String' && valueType === 'string') {
                    where.push({ [field.name]: value });
                }

                if (
                    this.fieldsMap.get(field.name + 'Slug') &&
                    valueType === 'string'
                ) {
                    where.push({
                        [field.name + 'Slug']: normalizeString(value, true)
                    });
                }

                if (
                    this.fieldsMap.get(field.name + 'Normalized') &&
                    valueType === 'string'
                ) {
                    where.push({
                        [field.name + 'Normalized']: normalizeString(value)
                    });
                }
            }
        }

        return where;
    }

    private addClauseToWhereOperator(
        prismaQuery: any,
        clause: object | object[],
        operator: 'AND' | 'OR' | 'NOT'
    ) {
        const logicalOperators = ['AND', 'OR', 'NOT'];

        if (typeof clause === 'undefined' || Array.isArray(clause) && clause.length === 0) {
            return prismaQuery;
        }

        const clauses = Array.isArray(clause) ? clause : [clause];

        if (!prismaQuery.where) {
            prismaQuery.where = {};
            prismaQuery.where[operator] = clauses;
        } else if (Array.isArray(prismaQuery.where[operator])) {
            clauses.forEach((c) => {
                prismaQuery.where[operator].push(c);
            });
        } else {
            const keys = Object.keys(prismaQuery.where);
            if (keys.some((key) => logicalOperators.includes(key))) {
                prismaQuery.where[operator] = [];
            } else {
                const temp = { ...prismaQuery.where };
                prismaQuery.where = {};
                prismaQuery.where[operator] = [];
                clauses.forEach((c) => {
                    prismaQuery.where[operator].push(c);
                });

                if (!Array.isArray(prismaQuery.where['AND'])) {
                    prismaQuery.where['AND'] = [];
                }

                for (const [key, value] of Object.entries(temp)) {
                    prismaQuery.where['AND'].push({ [key]: value });
                }
            }
        }

        return prismaQuery;
    }

    /**
     * Converts a query to a Prisma query
     * @param query - The query to convert
     * @param model - The model to convert the query to
     * @param addOrderBy - Whether to add an orderBy clause if none is provided
     * @returns The converted query
     * @throws ApiValidationError
     */
    convertQuery(query: Query, model: string, addOrderBy: boolean = true) {
        const modelFields = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === model.toLowerCase()
        )?.fields;
        const fieldsMap = new Map<string, Prisma.DMMF.Field>();

        modelFields?.forEach((f) => {
            fieldsMap.set(f.name, f);
        });

        const prismaQuery: any = {};

        if (query.select) {
            prismaQuery.select = {};

            if (!Array.isArray(query.select)) {
                throw new ApiValidationError(
                    'The select property must be an array of strings'
                );
            }

            query.select.forEach((field) => {
                this.fieldExists(fieldsMap, field, model);

                if (fieldsMap.get(field)?.kind === 'object') {
                    logger.info(
                        'Field ' + field + ' is a relation in model: ' + model
                    );
                } else {
                    prismaQuery.select[field] = true;
                }
            });
        }

        if (query.where) {
            prismaQuery.where = this.convertWhere(
                query.where,
                model,
                fieldsMap
            );
        }

        if (query.include) {
            const include = this.convertInclude(
                query.include,
                model,
                fieldsMap
            );

            if (query.select) {
                prismaQuery.select = {
                    ...prismaQuery.select,
                    ...include
                };
            } else {
                prismaQuery.include = include;
            }
        }

        if (query.orderBy === undefined && addOrderBy) {
            query.orderBy = fieldsMap.get('name')
                ? { name: 'asc' }
                : fieldsMap.get('id')
                  ? { id: 'asc' }
                  : undefined;
        }

        if (query.orderBy) {
            prismaQuery.orderBy = this.convertOrder(
                query.orderBy,
                model,
                fieldsMap
            );
        }

        return prismaQuery;
    }

    private convertWhere(
        where: Where,
        model: string,
        fieldsMap: Map<string, Prisma.DMMF.Field>
    ) {
        let prismaQuery: any = {};
        const logicalOperators = ['AND', 'OR', 'NOT'];

        let keys = Object.keys(where);

        keys = Object.keys(where);

        keys.forEach((key) => {
            if (logicalOperators.includes(key.toUpperCase())) {
                const operator = key.toUpperCase();

                prismaQuery[operator] = [];

                if (Array.isArray(where[key])) {
                    // @ts-ignore
                    where[key].forEach((condition) => {
                        const field = Object.keys(condition)[0];
                        prismaQuery[operator].push(
                            this.convertCondition(
                                field,
                                condition[field] as Condition,
                                model,
                                fieldsMap
                            )
                        );
                    });
                } else {
                    prismaQuery[operator].push(
                        this.convertCondition(
                            key,
                            where[key] as Condition,
                            model,
                            fieldsMap
                        )
                    );
                }
            } else {
                prismaQuery['AND'] = prismaQuery['AND'] || [];
                prismaQuery['AND'].push(
                    this.convertCondition(
                        key,
                        where[key] as Condition,
                        model,
                        fieldsMap
                    )
                );
            }
        });

        return prismaQuery;
    }

    convertCondition(
        field: string,
        condition: Condition,
        model: string,
        fieldsMap: Map<string, Prisma.DMMF.Field>
    ) {
        let isNormalized = false;
        const prismaQuery: any = {};

        if (
            !this.fieldExists(fieldsMap, field, model) ||
            !this.checkFieldPermission(model, field)
        ) {
            return prismaQuery;
        }

        if (fieldsMap.get(field + 'Normalized') !== undefined) {
            field = field + 'Normalized';
            isNormalized = true;
        }

        prismaQuery[field] = {};

        const conditionType = typeof condition;

        if (
            Array.isArray(condition) ||
            conditionType === 'string' ||
            conditionType === 'number' ||
            conditionType === 'boolean'
        ) {
            if (Array.isArray(condition)) {
                prismaQuery[field].in = isNormalized
                    ? condition.map((c) => normalizeString(c as string))
                    : parseNumber(condition);
            } else {
                if (conditionType === 'boolean') {
                    prismaQuery[field].equals = getBoolean(condition);
                } else {
                    prismaQuery[field].equals = isNormalized
                        ? normalizeString(condition as unknown as string)
                        : parseNumber(condition);
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
                prismaQuery[field].equals = isNormalized
                    ? normalizeString(value as string)
                    : parseNumber(value);
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
                prismaQuery[field].contains = isNormalized
                    ? normalizeString(value as string)
                    : value;
                break;
            case 'notlike':
                prismaQuery[field].not = {
                    contains: isNormalized
                        ? normalizeString(value as string)
                        : value
                };
                break;
            case 'startswith':
            case 'start':
                prismaQuery[field].startsWith = isNormalized
                    ? normalizeString(value as string)
                    : value;
                break;
            case 'endswith':
            case 'end':
                prismaQuery[field].endsWith = isNormalized
                    ? normalizeString(value as string)
                    : value;
                break;
            case 'in':
                prismaQuery[field].in = Array.isArray(value) ? value : [value];
                break;
            case 'notin':
                prismaQuery[field].not = {
                    in: Array.isArray(value) ? value : [value]
                };
                break;
            case 'isnull':
                prismaQuery[field].equals = value ? null : { not: null };
                break;
            default:
                prismaQuery[field].equals = isNormalized
                    ? normalizeString(value as string)
                    : parseNumber(value);
                break;
        }

        return prismaQuery;
    }

    private convertInclude(
        include: Include | string[] | string,
        model: string,
        fieldsMap: Map<string, Prisma.DMMF.Field>
    ) {
        const prismaQuery: any = {};
        const published = {
            where: {
                published: true
            }
        };

        const _addInclude = (
            field: Prisma.DMMF.Field,
            onlyPublished = false
        ) => {
            const relatedModel = field.type;

            const hasPublishedField = Prisma.dmmf.datamodel.models
                .find((m) => m.name === relatedModel)
                ?.fields?.some((f) => f.name === 'published');

            if (hasPublishedField && onlyPublished) {
                prismaQuery[field.name] = published;
            } else if (this.checkFieldPermission(relatedModel, field.name)) {
                prismaQuery[field.name] = true;
            }
        };

        if (typeof include === 'string') {
            if (include === '*') {
                fieldsMap.forEach((f) => {
                    if (f.kind === 'object') {
                        _addInclude(f, this.onlyPublished);
                    }
                });
                return prismaQuery;
            }
        }

        if (Array.isArray(include)) {
            include.forEach((field) => {
                if (this.fieldExists(fieldsMap, field, model)) {
                    const modelField = fieldsMap.get(field);
                    if (modelField?.kind === 'object') {
                        _addInclude(modelField, this.onlyPublished);
                    } else {
                        logger.info(
                            'Field ' +
                                field +
                                ' is not a relation in model: ' +
                                model
                        );
                    }
                }
            });
        } else if (typeof include === 'object') {
            const fields = Object.keys(include);

            fields.forEach((field) => {
                const modelField = fieldsMap.get(field);

                if (modelField) {
                    if (typeof include[field] === 'boolean') {
                        _addInclude(modelField, this.onlyPublished);
                    } else {
                        if (modelField?.kind === 'object') {
                            _addInclude(modelField, this.onlyPublished);

                            const temp = this.convertQuery(
                                include[field] as Query,
                                modelField?.type || '',
                                false
                            );

                            if (prismaQuery[modelField.name]) {
                                prismaQuery[modelField.name] = {
                                    ...prismaQuery[modelField.name],
                                    ...temp
                                };
                            } else if (
                                this.checkFieldPermission(
                                    modelField.type,
                                    field
                                )
                            ) {
                                prismaQuery[modelField.name] = temp;
                            }
                        } else {
                            logger.info(
                                'Field ' +
                                    field +
                                    ' is not a relation in model: ' +
                                    model
                            );
                        }
                    }
                } else if (field !== '_action_') {
                    logger.info(
                        'Field ' + field + ' not found in model: ' + model
                    );
                }
            });
        }

        return prismaQuery;
    }

    private convertOrder(
        order: OrderBy | string[],
        model: string,
        fieldsMap: Map<string, Prisma.DMMF.Field>
    ) {
        const orderBy: OrderBy[] = [];

        const processField = (
            field: string,
            direction: Direction | OrderBy = 'asc'
        ) => {
            if (fieldsMap.get(field + 'Normalized') !== undefined) {
                field = field + 'Normalized';
            }

            if (this.fieldExists(fieldsMap, field, model)) {
                const modelField = fieldsMap.get(field);
                if (modelField?.kind !== 'object') {
                    const allowedKeys = ['sort', 'nulls'];

                    if (typeof direction === 'string') {
                        orderBy.push({
                            [field]: direction === 'desc' ? 'desc' : 'asc'
                        });
                    } else if (typeof direction === 'object') {
                        const order = {} as OrderBy;
                        const keys = Object.keys(direction);
                        for (const k of keys) {
                            if (allowedKeys.includes(k)) {
                                order[k] = direction[k];
                            } else {
                                logger.info(
                                    'Order key must be one of ' +
                                        allowedKeys.join(', ') +
                                        ', got ' +
                                        k
                                );
                            }
                            orderBy.push({ [field]: order });
                        }
                    }
                } else {
                    if (this.checkFieldPermission(modelField.type, field)) {
                        if (typeof direction === 'object') {
                            if (modelField.isList) {
                                const order = {} as OrderBy;
                                const allowedKeys = ['_count'];

                                const keys = Object.keys(direction);
                                for (const k of keys) {
                                    if (allowedKeys.includes(k)) {
                                        order[k] = direction[k];
                                    } else {
                                        logger.info(
                                            'Order key must be one of ' +
                                                allowedKeys.join(', ') +
                                                ', got ' +
                                                k
                                        );
                                    }
                                }
                                orderBy.push({ [field]: order });
                            } else {
                                const order = this.convertQuery(
                                    { orderBy: direction as OrderBy },
                                    modelField.type,
                                    false
                                );

                                if (order.orderBy) {
                                    const tempOrderBy = {} as OrderBy;

                                    order.orderBy.forEach((o: any) => {
                                        const keys = Object.keys(o);
                                        keys.forEach((key) => {
                                            tempOrderBy[key] = o[key];
                                        });
                                    });

                                    orderBy.push({ [field]: tempOrderBy });
                                }
                            }
                        }
                    }
                }
            }
        };

        if (Array.isArray(order)) {
            order.forEach((field) => processField(field));
        } else {
            Object.entries(order).forEach(([key, direction]) =>
                processField(key, direction as OrderBy | Direction)
            );
        }

        return orderBy;
    }

    fieldExists(
        fieldsMap: Map<string, Prisma.DMMF.Field>,
        field: string,
        model: string
    ) {
        if (fieldsMap.get(field) === undefined && field !== '_action_') {
            logger.info('Field ' + field + ' not found in model: ' + model);
            return false;
        }

        return true;
    }

    private calculateSkip(pageSize: number, page: number) {
        return (page - 1) * pageSize;
    }

    /**
     * Merge public permissions with the user's permissions. Add permissions for children resources.
     * @returns The merged permissions
     */
    public async mergeRelatedPermissions() {
        const cacheKey = this.userId
            ? `mergeRelatedPermissions|${this.userId}`
            : 'mergeRelatedPermissions';

        if (cache.has(cacheKey)) {
            this.permissions = cache.get(cacheKey)!;
            return this.permissions;
        }

        const userPermissions = Object.keys(this.permissions);

        const publicResources = await prisma.resource.findMany({
            where: {
                isPublic: true
            },
            include: {
                children: true
            }
        });

        for (const resource of publicResources) {
            if (!this.permissions[resource.name]) {
                this.permissions[resource.name] = {
                    create: false,
                    read: true,
                    update: false,
                    delete: false,
                    import: false
                };
            } else {
                this.permissions[resource.name].read = true;
            }

            if (resource.children.length > 0) {
                for (const child of resource.children) {
                    if (!this.permissions[child.name]) {
                        this.permissions[child.name] = {
                            create: false,
                            read: true,
                            update: false,
                            delete: false,
                            import: false
                        };
                    } else {
                        this.permissions[child.name].read = true;
                    }
                }
            }
        }

        const currentPermissions = await prisma.resource.findMany({
            where: {
                name: {
                    in: userPermissions
                }
            },
            include: {
                children: true
            }
        });

        for (const resource of currentPermissions) {
            if (resource.children.length > 0) {
                for (const child of resource.children) {
                    if (!this.permissions[child.name]) {
                        this.permissions[child.name] = {
                            create: this.permissions[resource.name].create,
                            read: this.permissions[resource.name].read,
                            update: this.permissions[resource.name].update,
                            delete: this.permissions[resource.name].delete,
                            import: this.permissions[resource.name].import
                        };
                    } else {
                        this.permissions[child.name].create =
                            this.permissions[resource.name].create;
                        this.permissions[child.name].read =
                            this.permissions[resource.name].read;
                        this.permissions[child.name].update =
                            this.permissions[resource.name].update;
                        this.permissions[child.name].delete =
                            this.permissions[resource.name].delete;
                        this.permissions[child.name].import =
                            this.permissions[resource.name].import;
                    }
                }
            }
        }

        cache.set(cacheKey, this.permissions, 60 * 5);

        return this.permissions;
    }

    /**
     * Check if the checkPermissions flag is set and if the model has read permission
     * @param model
     * @param field name
     * @returns Whether the field has read permission
     */
    private checkFieldPermission(model: string, field: string) {
        if (this.checkPermissions) {
            if (this.permissions[model]?.read) {
                return true;
            } else {
                logger.warn(
                    'No read permission for type ' +
                        model +
                        ' of the field ' +
                        field
                );
                return false;
            }
        } else {
            return true;
        }
    }

    /**
     * Converts a full resource request to a partial resource request
     * @param partialResource - The field to be returned as response in case of a partial resource request
     * @param identifierToAddUniqueFields - Identifier to add unique fields to the where clause with OR as: where: { OR: [{ id: 'article' }, { name: 'article' }, { nameSlug: 'article' }] }
     * @throws ApiValidationError
     * @example If a resource Article has a relation field called references, the request can be converted to return only the references field as response, that can be paginated, ordered, etc.
     *
     */
    private convertToPartialResourceRequest(
        partialResource?: string,
        identifierToAddUniqueFields?: ID | undefined
    ) {
        if (!partialResource) {
            return;
        }

        const partialResourceWhere: any = {};

        const whereUniqueFields = this.getUniqueFieldsToAddInWhereClause(
            identifierToAddUniqueFields
        );

        const prismaField = this.fieldsMap.get(partialResource);

        const fields = Prisma.dmmf.datamodel.models
            .find((m) => m.name === prismaField?.type)
            ?.fields;


        const relationField = fields?.find((f) => f.kind === 'object' && f.relationName === prismaField?.relationName);

        if (!prismaField || prismaField.kind.toLowerCase() !== 'object' || !relationField) {
            throw new ApiValidationError(
                `${partialResource} is not a relation field of ${this.model} model and cannot be returned as a partial resource`
            );
        }

        const where = {} as any;

        const isChildResource = relationField.relationFromFields && relationField.relationFromFields.length > 0;
        
        where.OR = whereUniqueFields;
        
        if (this.onlyPublished && this.fieldsMap.get('published')) {
            where.AND = [{ published: true }];
        }

        if (partialResource === 'children') {
            partialResourceWhere['parent'] = where;
        } else if (!isChildResource) {
            partialResourceWhere[relationField.name] = { some: where };
        } else {
            partialResourceWhere[relationField.name] = where;
        }


        this.model = prismaField.type;
        this.setModelFields();

        return partialResourceWhere;
    }

    getModel() {
        return this.model;
    }

    setPageSize(pageSize: number) {
        this.pageSize = pageSize;
    }

    setPage(page: number) {
        this.page = page;
    }

    setPermissions(permissions: Permission) {
        this.permissions = permissions;
    }

    setUserId(userId: ID) {
        this.userId = userId;
    }

    private setModelFields() {
        this.modelFields = [];
        this.fieldsMap = new Map<string, Prisma.DMMF.Field>();
        this.modelFields = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === this.model.toLowerCase()
        )?.fields!;
        this.modelFields?.forEach((f) => {
            this.fieldsMap.set(f.name, f);
        });
    }
}

export default PrismaServiceConverter;
