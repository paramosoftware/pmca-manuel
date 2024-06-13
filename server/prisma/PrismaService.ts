import { v4 as uuidv4 } from 'uuid';
import QUERIES from '~/config/queries';
import { prisma, Prisma } from '~/server/prisma/prisma';
import cache from '~/utils/cache';
import capitalize from '~/utils/capitalize';
import getBoolean from '~/utils/getBoolean';
import hashPassword from '~/utils/hashPassword';
import normalizeString from '~/utils/normalizeString';
import parseNumber from '~/utils/parseNumber';
import sanitizeString from '~/utils/sanitizeString';
import { ApiValidationError } from '../express/error';
import { deleteConceptMedia, handleMedia } from './media';
import PrismaServiceConverter from './PrismaServiceConverter';
import PrismaServiceExporter from './PrismaServiceExporter';
import PrismaServiceImporter from './PrismaServiceImporter';
import PrismaServiceValidator from './PrismaServiceValidator';

class PrismaService {
    public model: string;
    public modelFields: readonly Prisma.DMMF.Field[] = [];
    public fieldsMap = new Map<string, Prisma.DMMF.Field>();
    private checkPermissions: boolean = true;
    private permissions: Permission = {};
    private method: Method = 'GET';
    private id: ID = 0;
    private request: any = {};
    private userId: ID = '';
    private validator: PrismaServiceValidator;
    private converter: PrismaServiceConverter;
    private importer: PrismaServiceImporter;
    private exporter: PrismaServiceExporter;
    private onlyPublished: boolean = false;
    private removePrivateFields: boolean = false;

    /**
     * PrismaService constructor
     * @param model - The model name
     * @param checkPermissions - Whether to check permissions. Permissions can be set with setPermissions.
     * @param onlyPublished - Return only published records
     * @param removePrivateFields - Remove private fields from the response and clauses
     */
    constructor(
        model: string,
        checkPermissions = true,
        onlyPublished = false,
        removePrivateFields = false
    ) {
        this.model = this.setModel(model);
        this.checkPermissions = checkPermissions;
        this.onlyPublished = onlyPublished;
        this.removePrivateFields = removePrivateFields;
        this.setModelFields();
        this.validator = new PrismaServiceValidator(this.model);
        this.converter = new PrismaServiceConverter(
            this.model,
            this.modelFields,
            this.fieldsMap,
            this.checkPermissions,
            this.onlyPublished,
            this.removePrivateFields
        );

        this.importer = new PrismaServiceImporter(this);
        this.exporter = new PrismaServiceExporter(this);
    }

    /**
     * Reads one record.
     * @param identifier - Can be any unique field of the model
     * @param request - The request object with select and include
     * @param {string} [partialResource] - The field to be returned as response in case of a partial resource request
     * @returns The record or null
     * @throws ApiValidationError
     * @example
     * { select: ['id', 'name'], include: ['user'] }
     */
    async readOne(
        identifier: ID,
        request?: { select?: Select; include?: Include },
        partialResource?: string
    ) {
        try {
            this.request = request ?? {};
            this.validator.validate(this.request);
            const query = await this.converter.convertRequestToPrismaQuery(
                this.request,
                partialResource !== undefined,
                identifier,
                partialResource
            );

            if (partialResource) {
                this.model = this.converter.getModel();
                return await this.readManyWithCount(query);
            }

            query.orderBy = undefined;

            // @ts-ignore
            return await prisma[this.model].findFirst(query);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reads many records.
     * @param request {Query} - The request object with select, include, where, orderBy, pageSize, and page
     * @returns The records
     * @throws ApiValidationError
     * @example
     * { pageSize: 20, page: 1, select: ['id', 'name'], where: { id: 1 }, include: ['user'], orderBy: { name: 'asc' } }
     */
    async readMany(request: Query) {
        try {
            this.request = request;
            this.validator.validate(this.request);
            const query = await this.converter.convertRequestToPrismaQuery(
                this.request,
                true
            );

            return await this.readManyWithCount(query);
        } catch (error) {
            throw error;
        }
    }

    private async readManyWithCount(query: Query) {
        try {
            const [total, data] = await prisma.$transaction([
                // @ts-ignore
                prisma[this.model].count({ where: query.where }),
                // @ts-ignore
                prisma[this.model].findMany(query)
            ]);

            return {
                page:
                    query.skip && query.take ? query.skip / query.take + 1 : 1,
                pageSize: query.take || total,
                totalPages: query.take ? Math.ceil(total / query.take) : 1,
                total: total,
                items: data
            } as PaginatedResponse;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates one record.
     * @param request {object} - The request object
     * @returns The created record
     * @throws ApiValidationError
     * @example
     * { name: 'John Doe' }
     */
    async createOne(request: object) {
        const data = await this.createMany([request]);
        return data ? data[0] : null;
    }

    /**
     * Creates many records.
     * @param request {Array<object>} - An array of objects to create
     * @returns The created records
     * @throws ApiValidationError
     * @example
     * [{ name: 'John Doe' }, { name: 'Jane Doe' }]
     */
    async createMany(request: Array<object>) {
        this.request = request;

        if (!Array.isArray(this.request)) {
            this.request = [this.request];
        }

        const inserts: any[] = [];

        if (this.checkPermissions) {
            this.permissions = await this.converter.mergeRelatedPermissions();
        }

        for (const item of this.request) {
            const query = await this.processCreateOrUpdateRequest(
                this.model,
                item
            );
            // @ts-ignore
            inserts.push(prisma[this.model].create({ data: query }));
        }

        const data = await prisma.$transaction(inserts);

        return data;
    }

    /**
     * Updates one record.
     * @param identifier - Can be any unique field of the model
     * @param request {object} - An object with the fields to update
     * @returns The updated record
     * @throws ApiValidationError
     * @example
     * { name: 'John Doe' }
     */
    async updateOne(identifier: ID, request?: object) {
        try {
            this.setId(identifier);
            this.request = request ?? {};
            this.validator.validate(this.request);

            const w = await this.converter.convertRequestToPrismaQuery(
                this.request,
                false,
                identifier
            );

            this.request = {
                where: w.where,
                data: this.request
            };

            const data = await this.updateMany([this.request]);
            return data ? data[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates many records.
     * @param request {Array<object>} - An array of objects with the fields to update
     * @returns The updated records
     * @throws ApiValidationError
     * @example
     * [{ where: { id: 1 }, data: { name: 'John Doe' } }, { where: { id: 2 }, data: { name: 'Jane Doe' } }]
     */
    async updateMany(request: Array<object>) {
        try {
            this.request = request;
            if (!Array.isArray(this.request)) {
                this.request = [this.request];
            }

            const updates: any[] = [];
            const mediaUpdates = new Map<number, ConceptMedia[]>();

            for (const item of this.request) {
                if (item.where === undefined) {
                    throw new ApiValidationError(
                        'Update must have a where clause'
                    );
                }

                if (item.data === undefined) {
                    throw new ApiValidationError(
                        'Update must have a data clause: ' + item
                    );
                }

                this.validator.validate(item);
                const q = await this.converter.convertRequestToPrismaQuery(
                    item,
                    false
                );

                const where = q.where;

                const query = await this.processCreateOrUpdateRequest(
                    this.model,
                    item.data,
                    true
                );

                // @ts-ignore
                const ids = await prisma[this.model].findMany({
                    where,
                    select: {
                        id: true
                    }
                });

                for (const id of ids) {
                    if (this.model.toLowerCase() === 'concept') {
                        const oldMedia = await prisma.conceptMedia.findMany({
                            where: {
                                conceptId: id.id
                            }
                        });

                        const changes = await this.trackChanges(
                            id.id,
                            item.data
                        );
                        if (changes.length > 0) {
                            query['changes'] = { create: changes };
                        }
                        mediaUpdates.set(id.id, oldMedia);
                    }

                    updates.push(
                        // @ts-ignore
                        prisma[this.model].update({
                            where: {
                                id: id.id
                            },
                            data: query
                        })
                    );
                }
            }

            const data = await prisma.$transaction(updates);

            for (const [id, media] of mediaUpdates) {
                await handleMedia(media, id);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes one record.
     * @param identifier - Can be any unique field of the model
     * @returns The number of records deleted
     * @throws ApiValidationError
     * @example
     * 1
     */
    async deleteOne(identifier: ID) {
        try {
            const query = await this.converter.convertRequestToPrismaQuery(
                this.request,
                false,
                identifier
            );

            this.request = {
                where: query.where
            };

            return await this.deleteMany(this.request);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes many records.
     * @param request {Query} - The request object with where clause
     * @returns The number of records deleted
     * @throws ApiValidationError
     * @example
     * 10
     */
    async deleteMany(request: Query) {
        try {
            this.request = request;
            this.validator.validate(this.request);
            let query = await this.converter.convertRequestToPrismaQuery(
                this.request,
                false
            );

            query = { where: query.where };

            const conceptMedia: string | any[] = [];

            if (this.model.toLowerCase() === 'concept') {
                const concepts = await prisma.concept.findMany(query);
                const ids = concepts.map((concept) => concept.id);

                let conceptMediaTemp = await prisma.conceptMedia.findMany({
                    where: {
                        conceptId: {
                            in: ids
                        }
                    }
                });

                conceptMediaTemp.forEach((concept) => {
                    conceptMedia.push(concept);
                });
            }

            // @ts-ignore
            const data = await prisma[this.model].deleteMany(query);

            if (conceptMedia.length > 0) {
                deleteConceptMedia(conceptMedia);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finds the tree - only available for Concept model
     * @param nodeId - The node id
     * @param query - The query object with select
     * @returns The tree
     * @throws ApiValidationError
     */
    async findTrees(
        nodeId: number | null = null,
        query: Query
    ) {
        const select = query.select ?? ['id', 'name', 'parentId', 'nameSlug'];
        const depth = (await this.findTreeDepth(nodeId)) as number;

        if (depth === 0) {
            return [];
        }

        let nestedInclude: any = {
            include: {
                children: {
                    select: select
                }
            }
        };

        let pointer = nestedInclude.include;

        for (let i = 0; i < depth; i++) {
            pointer.children.include = {
                children: {
                    select: select
                }
            };

            pointer = pointer.children.include;
        }

        let where = {
            id: nodeId
        } as any;

        if (nodeId === null) {
            where = {
                parentId: null
            };
        }

        return await this.readMany({
            where: where,
            include: nestedInclude.include,
            select: select
        });
    }

    /**
     * Finds the ancestors of a node - only available for Concept model
     * @param nodeId - The node id
     * @param query - The query object with select
     * @param flatten - If it should return a flat array
     * @returns The ancestors
     * @throws ApiValidationError
     */
    async findAncestors(
        nodeId: number,
        query: Query,
        flatten = true
    ) {
        const select = query.select ?? ['id', 'name', 'parentId', 'nameSlug'];
        const depth = await this.findNodeDepth(nodeId);

        if (depth === 0) {
            return [];
        }

        let nestedInclude: any = {
            include: {
                parent: {
                    select: select
                }
            }
        };

        let pointer = nestedInclude.include;

        for (let i = 0; i < depth; i++) {
            pointer.parent.include = {
                parent: {
                    select: select
                }
            };

            pointer = pointer.parent.include;
        }

        let where = {
            id: nodeId
        } as any;

        const result = await this.readMany({
            where: where,
            include: nestedInclude.include,
            select: select
        });

        const parents = result.items[0].parent ? [result.items[0].parent] : [];

        if (!flatten) {
            return parents;
        }

        const ancestors = [];

        for (const parent of parents) {
            const copy = { ...parent };
            delete copy.parent;
            ancestors.push(copy);

            let pointer = parent;

            for (let i = 0; i < depth - 1; i++) {
                if (pointer.parent) {
                    const copy = { ...pointer.parent };
                    delete copy.parent;
                    ancestors.push(copy);
                    pointer = pointer.parent;
                }
            }
        }

        return ancestors.reverse();
    }

    /**
     * Finds the descendants of a node - only available for Concept model
     * @param nodeId - The node id
     * @param query - The query object with select
     * @returns The descendants
     * @throws ApiValidationError
     */
    async findDescendants(
        nodeId: number,
        query: Query
    ) {
        const select = query.select ?? ['id', 'name', 'parentId', 'nameSlug'];
        const ids = await this.findTreeIds(nodeId);

        return await this.readMany({
            where: {
                id: {
                    in: ids
                }
            },
            select: select
        });
    }

    /**
     * Finds the tree - only available for Concept model
     * @param nodeId - The node id
     * @returns The tree
     * @throws ApiValidationError
     */
    async findTreeIds(parentId: number | null = null) {
        return (await this.findTreeProperty(parentId, true)) as number[];
    }

    /**
     * Finds the depth of the tree - only available for Concept model
     * @param parentId - The parent id
     * @returns The depth
     * @throws ApiValidationError
     */
    async findTreeDepth(parentId: number | null = null) {
        return (await this.findTreeProperty(parentId)) as number;
    }

    /**
     * TODO: Merge with findTreeDepth function
     * Finds the depth of the node - only available for Concept model
     * @param nodeId - The node id
     * @returns The depth
     * @throws ApiValidationError
     */
    async findNodeDepth(nodeId: number) {
        return (await this.findTreeProperty(nodeId, false, true)) as number;
    }

    /**
     * Imports data from a file
     * @param filePath - The file path
     * @param mode - The import mode: merge or replace
     * @returns The process id to track the progress with getProgress
     * @throws ApiValidationError
     */
    importData(filePath: string, mode: string = 'merge') {
        return this.importer.importFrom(filePath, mode);
    }

    /**
     * Exports data to a file
     * @param format - The export format: json, csv, xml or xlsx
     * @param addMedia - If it should add media to the export
     * @param query - The query object
     * @throws ApiValidationError
     */
    async exportToFormat(
        format: DataTransferFormat,
        addMedia: boolean,
        query: Query
    ) {
        return await this.exporter.exportToFormat(
            format,
            addMedia,
            query
        );
    }

    getProgress(processId: string) {
        const progress = cache.get(processId) as RequestProgress;

        if (!progress) {
            return {
                progress: 0,
                message: 'Process not found',
                finished: false,
                error: true
            } as RequestProgress;
        }

        return progress;
    }

    setProgress(
        processId: string,
        progress = 0,
        message = '',
        finished = false,
        error = false,
    ) {
        cache.set(processId, { progress, message, finished, error });
    }


    setReportProgress(
        processId: string,
        report: ImportReport
    ) {

        const progress = cache.get(processId) as RequestProgress;

        if (!progress) {
            return;
        }

        cache.set(processId, { ...progress, report });
    }


    /**
     * Return depth of the tree or node or return the ids of the tree
     * @param nodeId - The parent id
     * @param returnIds - If it should return the ids
     * @returns The tree
     * @throws ApiValidationError
     */
    private async findTreeProperty(
        nodeId: number | null = null,
        returnIds = false,
        returnNodeDepth = false
    ) {
        if (this.model !== 'Concept') {
            throw new ApiValidationError(
                'findTreeDepth is only available for Concept model'
            );
        }

        if (nodeId !== null && typeof nodeId !== 'number') {
            throw new ApiValidationError('parentId must be a number');
        }

        let column = 'parentId';
        let joinOn = 'concept.parentId = ch.id';

        if (returnNodeDepth && !returnIds) {
            column = 'id';
            joinOn = 'concept.id = ch.parentId';
        }

        const query = `
                WITH RECURSIVE hierarchy AS (
                SELECT id, parentId, name, 1 AS depth
                FROM Concept
                WHERE ${column} = ${nodeId}

                UNION ALL

                SELECT concept.id, concept.parentId, concept.name, ch.depth + 1
                FROM Concept concept
                JOIN hierarchy ch ON ${joinOn}
            )
        `;

        if (!returnIds) {
            const depth = (await prisma.$queryRawUnsafe(`
                ${query}
                SELECT max(depth) as depth FROM hierarchy;`)) as {
                depth: number;
            }[];

            return Number(depth[0].depth);
        } else {
            const ids = (await prisma.$queryRawUnsafe(`
                ${query}
                SELECT id FROM hierarchy;`)) as { id: number }[];

            return ids.map((id) => id.id);
        }
    }

    /**
     * Processes the create or update request
     * @param model - The model
     * @param request - The request body
     * @param isUpdate - If it's an update request
     * @param processRelations - If it should process relations
     * @param parentModel - The parent model
     * @returns The prisma query
     * @throws ApiValidationError
     * @example
     * { name: 'John Doe' }
     */
    private async processCreateOrUpdateRequest(
        model: string,
        request: any,
        isUpdate: boolean = false,
        processRelations = true,
        parentModel: string = '',
        parentRequest: any = {},
        parentAttribute: string = ''
    ) {
        const modelFields = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === model.toLowerCase()
        )?.fields!;

        const prismaQuery: any = {};
        const fieldsMap = new Map<string, Prisma.DMMF.Field>();
        const relations = new Map<string, string>();

        modelFields?.forEach((f) => {
            if (
                this.isFieldMandatory(
                    model,
                    parentModel,
                    f,
                    request,
                    modelFields
                ) &&
                !isUpdate
            ) {
                throw new ApiValidationError(
                    f.name + ' is required for ' + model
                );
            }

            fieldsMap.set(f.name, f);

            if (f.kind.toLowerCase() === 'object') {
                if (f.relationFromFields?.length === 1) {
                    relations.set(f.relationFromFields[0], f.name);
                }
            }
        });

        if (isUpdate) {
            await this.checkIfIsDescendant(
                model,
                request,
                parentModel,
                parentRequest,
                parentAttribute
            );
        }

        for (const [rawId, relatedField] of relations) {
            if (request[rawId] !== undefined) {
                const validId = this.isIdValid(request[rawId]);
                const field = fieldsMap.get(relatedField)!;

                if (validId && field.type !== parentModel) {
                    prismaQuery[relatedField] = {
                        connect: {
                            id: this.processInt(request[rawId], rawId)
                        }
                    };
                } else if (
                    request[rawId] == null ||
                    request[rawId] == '' ||
                    request[rawId] == 0
                ) {
                    prismaQuery[relatedField] = {
                        disconnect: true
                    };
                }
            }

            if (request[rawId] !== undefined) {
                delete request[rawId];
                delete request[relatedField];
            }
        }

        const attributes = Object.keys(request);

        for (const attribute of attributes) {
            const field = fieldsMap.get(attribute);

            if (!this.converter.fieldExists(fieldsMap, attribute, model)) {
                continue;
            }

            if (!field || request[attribute] === undefined) {
                continue;
            }

            const keyNormalized = attribute + 'Normalized';
            if (fieldsMap.get(keyNormalized) !== undefined) {
                prismaQuery[keyNormalized] = normalizeString(
                    request[attribute]
                );
            }

            const keySlug = attribute + 'Slug';
            if (
                fieldsMap.get(keySlug) !== undefined &&
                request[keySlug] === undefined
            ) {
                prismaQuery[keySlug] = await this.calculateSlug(
                    request[attribute],
                    model,
                    keySlug
                );
            }

            if (attribute == 'createdAt' || attribute == 'updatedAt') {
                request[attribute] = undefined;
            }

            const fieldType = field.type.toLowerCase();

            if (fieldType === 'int') {
                if (request[attribute] != undefined) {
                    prismaQuery[attribute] = this.processInt(
                        request[attribute],
                        attribute
                    );
                }
            } else if (fieldType === 'string') {
                if (request[attribute] === '') {
                    prismaQuery[attribute] = null;
                } else {
                    prismaQuery[attribute] =
                        attribute === 'password'
                            ? hashPassword(request[attribute])
                            : sanitizeString(request[attribute]);
                }
            } else if (fieldType === 'boolean') {
                prismaQuery[attribute] = this.processBoolean(
                    request[attribute],
                    attribute
                );
            } else if (
                field.kind.toLowerCase() === 'object' &&
                processRelations
            ) {
                const relatedModel = field.type;

                if (!field.isList) {
                    const relatedObject = await this.processOneToManyRelation(
                        relatedModel,
                        model,
                        request,
                        attribute
                    );

                    if (Object.keys(relatedObject).length > 0) {
                        prismaQuery[attribute] = relatedObject;
                    }
                } else {
                    const relatedObjects = await this.processManyToManyRelation(
                        relatedModel,
                        model,
                        request,
                        attribute,
                        isUpdate
                    );

                    if (Object.keys(relatedObjects).length > 0) {
                        prismaQuery[attribute] = relatedObjects;
                    }
                }
            }
        }

        if (!isUpdate) {
            prismaQuery.id = undefined;
        }

        return prismaQuery;
    }

    private async processOneToManyRelation(
        relatedModel: string,
        parentModel: string,
        request: any,
        field: string
    ) {
        if (typeof request[field] !== 'object') {
            throw new ApiValidationError(
                field + ' must be an object, got ' + typeof request[field]
            );
        }

        const prismaQuery = {} as any;
        const modelFields = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === relatedModel.toLowerCase()
        )?.fields!;

        const relatedObject = request[field];

        if (relatedObject == null || Object.keys(relatedObject).length === 0) {
            prismaQuery.disconnect = true;
            return prismaQuery;
        }

        const action = this.getAction(relatedObject, relatedModel, field);

        if (action === 'connect') {
            prismaQuery.connect = { id: relatedObject.id };
            return prismaQuery;
        }

        const processedRelatedObject = await this.processCreateOrUpdateRequest(
            relatedModel,
            relatedObject,
            action !== 'create',
            false,
            parentModel,
            request,
            field
        );

        if (action === 'update') {
            prismaQuery.update = processedRelatedObject;
        } else if (action === 'create') {
            prismaQuery.connectOrCreate = {
                create: processedRelatedObject,
                where: this.getUpsertWhereClause(modelFields, relatedObject)
            };
        }

        return prismaQuery;
    }

    private async processManyToManyRelation(
        model: string,
        parentModel: string,
        request: any,
        field: string,
        isUpdate: boolean
    ) {
        if (!Array.isArray(request[field])) {
            throw new ApiValidationError(
                field + ' must be an array, got ' + typeof request[field]
            );
        }

        const prismaQuery = {} as any;
        const modelFields = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === model.toLowerCase()
        )?.fields!;

        const relatedObjects = request[field];

        if (isUpdate) {
            // check if the related model can exist without the parent model
            // and if it's required, delete the ones that are not in the array
            const parentModelField = this.getRelationField(
                model,
                parentModel,
                modelFields,
                true
            );

            if (parentModelField) {
                if (Array.isArray(relatedObjects)) {
                    prismaQuery.deleteMany = {
                        id: {
                            not: {
                                in: relatedObjects
                                    .filter((item: Item) => {
                                        return this.isIdValid(item.id);
                                    })
                                    .map((item: Item) => {
                                        return item.id;
                                    })
                            }
                        }
                    };
                }
            }
        }

        for (const item of request[field]) {
            const action = this.getAction(item, model, field);
            const processedRelatedObject =
                await this.processCreateOrUpdateRequest(
                    model,
                    item,
                    action !== 'create',
                    false,
                    parentModel,
                    request,
                    field
                );

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

                const relationField = this.getRelationField(
                    model,
                    parentModel,
                    modelFields
                );

                if (relationField) {
                    processedRelatedObject[relationField] = undefined;
                }

                processedRelatedObject.id = undefined;

                prismaQuery.upsert.push({
                    where: this.getUpsertWhereClause(modelFields, item),
                    create: processedRelatedObject,
                    update: processedRelatedObject
                });
            } else if (action === 'create') {
                if (!prismaQuery.connectOrCreate) {
                    prismaQuery.connectOrCreate = [];
                }

                item.id = undefined;
                prismaQuery.connectOrCreate.push({
                    create: processedRelatedObject,
                    where: this.getUpsertWhereClause(modelFields, item)
                });
            }
        }

        if (request[field].length === 0 && isUpdate) {
            prismaQuery.set = [];
        }

        return prismaQuery;
    }

    /**
     * Gets the action for the related object and throws an error the user doesn't have permission
     * @param relatedObject - The related object
     * @param model - The related model
     * @param field - The field name
     * @returns The action - connect, create, or update
     * @throws ApiValidationError
     */
    private getAction(relatedObject: any, model: string, field: string) {
        const validActions = ['connect', 'create', 'update'];

        const sentAction = relatedObject['_action_'] ?? undefined;

        let action = undefined;

        if (sentAction && validActions.includes(sentAction)) {
            if (sentAction === 'update' || sentAction === 'connect') {
                if (this.isIdValid(relatedObject.id)) {
                    action = sentAction;
                } else {
                    if (sentAction === 'connect') {
                        throw new ApiValidationError(
                            'id is required for connect action, got ' +
                                relatedObject
                        );
                    }
                }
            }
        }

        if (this.isIdValid(relatedObject.id) && !action) {
            action = 'connect';
        } else if (!action) {
            action = 'create';
        }

        if (action === 'update' || action === 'create') {
            this.checkFieldPermission(model, field, action === 'update');
        }

        return action;
    }

    private isIdValid(id: ID) {
        return id != 0 && id != null && id != '';
    }

    private processBoolean(value: any, key: string) {
        if (getBoolean(value) !== undefined) {
            return getBoolean(value);
        } else {
            throw new ApiValidationError(
                key + ' must be a boolean, got ' + value
            );
        }
    }

    private processInt(value: any, key: string) {
        if (!isNaN(parseInt(value))) {
            return parseInt(value);
        } else if (value === null || value === '' || value == 0) {
            return null;
        } else {
            throw new ApiValidationError(
                key + ' must be a number, got ' + value
            );
        }
    }

    private getUpsertWhereClause(
        modelFields: readonly Prisma.DMMF.Field[],
        body: any
    ) {
        const where: any = {};

        let idType = 'int';

        modelFields.forEach((f) => {
            if (f.isUnique || f.isId) {
                if (body[f.name]) {
                    where[f.name] =
                        f.type.toLowerCase() === 'string'
                            ? sanitizeString(body[f.name])
                            : parseNumber(body[f.name]);
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

    private isFieldMandatory(
        model: string,
        parentModel: string,
        field: Prisma.DMMF.Field,
        body: any,
        modelFields: readonly Prisma.DMMF.Field[]
    ) {
        const appGeneratedPostfix = ['Normalized', 'Slug'];

        if (
            appGeneratedPostfix.some((postfix) => field.name.endsWith(postfix))
        ) {
            return false;
        }

        if (
            field.isRequired &&
            !field.hasDefaultValue &&
            !field.isList &&
            !field.isUpdatedAt
        ) {
            if (body[field.name]) {
                return false;
            }

            const relatedField = this.getRelationField(
                model,
                parentModel,
                modelFields
            );

            if (relatedField) {
                return false;
            }

            return true;
        }

        return false;
    }

    private getRelationField(
        model: string,
        parentModel: string,
        modelFields: readonly Prisma.DMMF.Field[],
        required: boolean = false
    ) {
        for (const field of modelFields) {
            const relationName = (field.relationName || '').toLowerCase();
            const relationTo = (parentModel + 'To' + model).toLowerCase();

            if (
                field.type.toLowerCase() === parentModel.toLowerCase() &&
                relationName === relationTo
            ) {
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

    /**
     * Check if request is trying to set the current record to be a descendant of itself
     */
    private async checkIfIsDescendant(
        model: string,
        request: any,
        parentModel: string,
        parentRequest: any,
        parentAttribute: string
    ) {
        if (parentModel && parentModel === model) {
            if (parentAttribute === 'children') {
                const currentId = parseNumber(parentRequest.id ?? this.id);
                const targetId = parseNumber(request.id ?? null);

                if (currentId && targetId && currentId == targetId) {
                    throw new ApiValidationError(
                        `Cannot set ${currentId} as parent of ${targetId} because it's the same record`
                    );
                }

                const descendants = await this.findTreeIds(targetId);

                if (descendants.includes(currentId)) {
                    throw new ApiValidationError(
                        `Cannot set ${currentId} as parent of ${targetId} because it's a descendant`
                    );
                }
            }
        } else {
            const currentId = parseNumber(request.id ?? this.id);
            const targetId = parseNumber(
                request.parentId ?? request.parent?.id ?? null
            );

            if (currentId && targetId && currentId == targetId) {
                throw new ApiValidationError(
                    `Cannot set ${targetId} as parent of ${currentId} because it's the same record`
                );
            }

            if (targetId) {
                const descendants = await this.findTreeIds(currentId);

                if (descendants.includes(targetId)) {
                    throw new ApiValidationError(
                        `Cannot set ${targetId} as parent of ${currentId} because it's a descendant`
                    );
                }
            }
        }
    }

    // @ts-ignore
    private async calculateSlug(name: string, model: string, key: string) {
        // @ts-ignore
        const obj = await prisma[model].findFirst({
            where: {
                [key]: normalizeString(name, true)
            }
        });

        if (!obj || obj.id == this.id) {
            return normalizeString(name, true);
        } else {
            return await this.calculateSlug(
                name + '-' + uuidv4().substring(0, 4),
                model,
                key
            );
        }
    }

    private setModelFields() {
        this.modelFields = Prisma.dmmf.datamodel.models.find(
            (m) => m.name.toLowerCase() === this.model.toLowerCase()
        )?.fields!;
        this.modelFields?.forEach((f) => {
            this.fieldsMap.set(f.name, f);
        });
    }

    async canAccess() {
        const resourceConfig = await prisma.resource.findFirst({
            where: { nameNormalized: normalizeString(this.model) },
            include: { parent: true }
        });

        if (!resourceConfig) {
            return false;
        }

        if (resourceConfig.isPublic && this.method === 'GET') {
            return true;
        }

        if (!this.permissions || Object.keys(this.permissions).length === 0) {
            return false;
        }

        let model = this.model;
        if (resourceConfig.parent) {
            model = resourceConfig.parent.name;
        }

        const permission = this.permissions[model];

        if (!permission) {
            return false;
        }

        switch (this.method) {
            case 'GET':
                return permission.read;
            case 'PUT':
                return permission.update;
            case 'POST':
                return permission.create;
            case 'DELETE':
                return permission.delete;
            default:
                return false;
        }
    }

    getModel() {
        return this.model;
    }

    setModel(model: string) {
        this.model = capitalize(model);
        return this.model;
    }

    getId() {
        return this.id;
    }

    setId(id: ID) {
        this.id = parseNumber(id);
    }

    setMethod(method: Method) {
        this.method = method;
    }

    setUserId(userId: ID) {
        this.userId = userId;
        this.converter.setUserId(userId);
    }

    setPermissions(permissions: Permission) {
        this.permissions = permissions;
        this.converter.setPermissions(permissions);
    }

    /**
     * Check if the checkPermissions flag is set and if the model has create or update permission
     * @param model
     * @param field name
     * @param isUpdate - Whether it's an update request
     * @returns Whether the field has read permission
     * @throws ApiValidationError
     */
    private checkFieldPermission(
        model: string,
        field: string,
        isUpdate: boolean = false
    ) {
        const action = isUpdate ? 'update' : 'create';

        if (this.checkPermissions) {
            if (
                this.converter.permissions[model] &&
                this.converter.permissions[model][action]
            ) {
                return true;
            } else {
                throw new ApiValidationError(
                    'No permission to ' +
                        action +
                        ' field ' +
                        field +
                        ' of model ' +
                        model
                );
            }
        }
    }

    private async trackChanges(id: any, newData: any) {
        const fieldsToRemove = [
            'createdAt',
            'updatedAt',
            'id',
            'changes',
            'media',
            'children',
            'privateNotes'
        ];
        const ignoreWithSuffix = ['Normalized', 'Slug', 'Id', 'Count'];
        const fieldsToTrack = [] as string[];

        const oldData = (await prisma.concept.findUnique({
            where: {
                id: parseInt(id)
            },
            include: QUERIES.get('TrackChanges')?.include || {}
        })) as any;

        const fieldsKeys = [] as string[];

        const newDataFields = Object.keys(newData);
        const oldDataFields = Object.keys(oldData);

        fieldsKeys.push(...newDataFields, ...oldDataFields);

        fieldsKeys.forEach((field: string) => {
            if (fieldsToRemove.includes(field)) {
                return;
            }

            if (ignoreWithSuffix.some((suffix) => field.endsWith(suffix))) {
                return;
            }

            if (!fieldsToTrack.includes(field)) {
                fieldsToTrack.push(field);
            }
        });

        const fields = await prisma.resourceField.findMany({
            where: {
                resource: {
                    name: this.model
                }
            }
        });

        const fieldsMap = new Map<string, any>();

        fields.forEach((field: any) => {
            fieldsMap.set(field.name, field);
        });

        const changes = [] as {
            user: { connect: { id: number } };
            field: { connect: { id: number } };
            changes: string;
        }[];

        fieldsToTrack.forEach((field: any) => {
            if (typeof newData[field] === 'string' || newData[field] === null) {
                if (newData[field] !== oldData[field]) {
                    _addChange(
                        field,
                        JSON.stringify({
                            old: oldData[field],
                            new: newData[field]
                        }),
                        this.userId
                    );
                }
            }

            if (typeof newData[field] === 'object' && newData[field] !== null) {
                if (Array.isArray(newData[field])) {
                    const newNames = newData[field].map(
                        (item: any) => item.name
                    );
                    const oldNames = oldData[field].map(
                        (item: any) => item.name
                    );

                    const added = newNames.filter(
                        (name: any) => !oldNames.includes(name)
                    );
                    const removed = oldNames.filter(
                        (name: any) => !newNames.includes(name)
                    );

                    const fieldChanges = {} as {
                        added: string[];
                        removed: string[];
                    };

                    if (added.length > 0) {
                        fieldChanges['added'] = added;
                    }

                    if (removed.length > 0) {
                        fieldChanges['removed'] = removed;
                    }

                    if (added.length > 0 || removed.length > 0) {
                        _addChange(
                            field,
                            JSON.stringify(fieldChanges),
                            this.userId
                        );
                    }
                } else if (newData[field].name !== undefined) {
                    if (newData[field].name !== oldData[field].name) {
                        _addChange(
                            field,
                            JSON.stringify({
                                old: oldData[field].name,
                                new: newData[field].name
                            }),
                            this.userId
                        );
                    }
                }
            }
        });

        return changes;

        function _addChange(field: string, change: string, userId: ID) {
            const data = {
                changes: change
            } as any;

            const fieldData = fieldsMap.get(field);

            if (fieldData) {
                data['field'] = {
                    connect: {
                        id: fieldData.id
                    }
                };
            }

            if (userId) {
                data['user'] = {
                    connect: {
                        id: userId
                    }
                };
            }

            changes.push(data);
        }
    }
}

export default PrismaService;
