import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import getBoolean from '~/utils/getBoolean';
import hashPassword from '~/utils/hashPassword';
import normalizeString from '~/utils/normalizeString';
import parseNumber from '~/utils/parseNumber';
import sanitizeString from '~/utils/sanitizeString';
import { prisma } from './prisma';
import { ApiValidationError } from '../express/error';
import { deleteEntryMedia, handleMedia } from './media';
import PrismaServiceConverter from './PrismaServiceConverter';
import PrismaServiceValidator from './PrismaServiceValidator';
import QUERIES from '~/config/queries';

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
    private onlyPublished: boolean = false;

    /**
     * PrismaService constructor
     * @param model - The model name
     * @param checkPermissions - Whether to check permissions. Permissions can be set with setPermissions.
     * @param onlyPublished - Return only published records
     */
    constructor(model: string, checkPermissions = true, onlyPublished = false) {
        this.model = model;
        this.checkPermissions = checkPermissions;
        this.onlyPublished = onlyPublished;
        this.setModelFields();
        this.validator = new PrismaServiceValidator(model);
        this.converter = new PrismaServiceConverter(
            model,
            this.modelFields,
            this.fieldsMap,
            this.checkPermissions,
            this.onlyPublished
        );
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
            const mediaUpdates = new Map<number, EntryMedia[]>();

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
                    if (this.model.toLowerCase() === 'entry') {
                        const oldMedia = await prisma.entryMedia.findMany({
                            where: {
                                entryId: id.id
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

            const entryMedia: string | any[] = [];

            if (this.model.toLowerCase() === 'entry') {
                const entries = await prisma.entry.findMany(query);
                const ids = entries.map((entry) => entry.id);

                let entryMediaTemp = await prisma.entryMedia.findMany({
                    where: {
                        entryId: {
                            in: ids
                        }
                    }
                });

                entryMediaTemp.forEach((entry) => {
                    entryMedia.push(entry);
                });
            }

            // @ts-ignore
            const data = await prisma[this.model].deleteMany(query);

            if (entryMedia.length > 0) {
                deleteEntryMedia(entryMedia);
            }

            return data;
        } catch (error) {
            throw error;
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
        parentModel: string = ''
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
            action === 'update',
            false,
            parentModel
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
                    action === 'update',
                    false,
                    parentModel
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

    setModel(model: string) {
        this.model = model;
    }

    setId(id: ID) {
        this.id = id;
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
            'children'
        ];
        const ignoreWithSuffix = ['Normalized', 'Slug', 'Id', 'Count'];
        const fieldsToTrack = [] as string[];

        const oldData = (await prisma.entry.findUnique({
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

        const author = await prisma.author.findFirst({
            where: {
                users: {
                    some: {
                        id: this.userId as any
                    }
                }
            }
        });

        const changes = [] as {
            author: { connect: { id: number } };
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
                        })
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

                    const fieldChanges = {
                        added,
                        removed
                    };

                    if (added.length > 0 || removed.length > 0) {
                        _addChange(field, JSON.stringify(fieldChanges));
                    }
                } else if (newData[field].name !== undefined) {
                    if (newData[field].name !== oldData[field].name) {
                        _addChange(
                            field,
                            JSON.stringify({
                                old: oldData[field].name,
                                new: newData[field].name
                            })
                        );
                    }
                }
            }
        });

        return changes;

        function _addChange(field: string, change: string) {
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

            if (author) {
                data['author'] = {
                    connect: {
                        id: author.id
                    }
                };
            }

            changes.push(data);
        }
    }
}

export default PrismaService;
