import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import getBoolean from "~/utils/getBoolean";
import hashPassword from "~/utils/hashPassword";
import normalizeString from "~/utils/normalizeString";
import parseNumber from "~/utils/parseNumber";
import sanitizeString from "~/utils/sanitizeString";
import { prisma } from "./prisma";
import { ApiValidationError } from "../express/error";
import { deleteEntryMedia, handleMedia } from "./media";
import PrismaServiceConverter from "./PrismaServiceConverter";
import PrismaServiceValidator from "./PrismaServiceValidator";

class PrismaService {
  public model: string;
  public modelFields: readonly Prisma.DMMF.Field[] = [];
  public fieldsMap = new Map<string, Prisma.DMMF.Field>();
  private checkPermissions: boolean = true;
  private permissions: Permission = {};
  private method: Method = "GET";
  private id: ID = 0;
  private request: any = {};
  private userId: ID = "";
  private validator: PrismaServiceValidator;
  private converter: PrismaServiceConverter;

  constructor(model: string, checkPermissions = true) {
    this.model = model;
    this.checkPermissions = checkPermissions;
    this.setModelFields();
    this.validator = new PrismaServiceValidator(model);
    this.converter = new PrismaServiceConverter(
      model,
      this.modelFields,
      this.fieldsMap,
      this.checkPermissions,
      this.permissions
    );
  }

  /**
   * Reads one record.
   * @param identifier - Can be any unique field of the model
   * @param request - The request object with select and include
   * @returns The record or null
   * @throws ApiValidationError
   * @example
   * { select: ['id', 'name'], include: ['user'] }
   */
  async readOne(
    identifier: ID,
    request?: { select?: Select; include?: Include }
  ) {
    try {
      this.request = request ?? {};
      this.validator.validate(this.request);
      const query = await this.converter.convertRequestToPrismaQuery(
        this.request,
        false,
        identifier
      );

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

      const [total, data] = await prisma.$transaction([
        // @ts-ignore
        prisma[this.model].count({ where: query.where }),
        // @ts-ignore
        prisma[this.model].findMany(query),
      ]);

      return {
        page: query.skip && query.take ? query.skip / query.take + 1 : 1,
        pageSize: query.take || total,
        totalPages: query.take ? Math.ceil(total / query.take) : 1,
        total: total,
        items: data,
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

    for (const item of this.request) {
      const query = await this.processCreateOrUpdateRequest(this.model, item);
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
      this.validator.validate(this.request);
      const request = await this.converter.convertRequestToPrismaQuery(
        this.request,
        false,
        identifier
      );

      this.request = {
        where: request.where,
        data: this.request,
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
          throw new ApiValidationError("Update must have a where clause");
        }

        if (item.data === undefined) {
          throw new ApiValidationError(
            "Update must have a data clause: " + item
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
            id: true,
          },
        });

        for (const id of ids) {
          updates.push(
            // @ts-ignore
            prisma[this.model].update({
              where: {
                id: id.id,
              },
              data: query,
            })
          );

          if (this.model.toLowerCase() === "entry") {
            const oldMedia = await prisma.entryMedia.findMany({
              where: {
                entryId: id.id,
              },
            });

            mediaUpdates.set(id.id, oldMedia);
          }
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
        where: query.where,
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

      if (this.model.toLowerCase() === "entry") {
        const entries = await prisma.entry.findMany(query);
        const ids = entries.map((entry) => entry.id);

        let entryMediaTemp = await prisma.entryMedia.findMany({
          where: {
            entryId: {
              in: ids,
            },
          },
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
    parentModel: string = ""
  ) {
    const modelFields = Prisma.dmmf.datamodel.models.find(
      (m) => m.name.toLowerCase() === model.toLowerCase()
    )?.fields!;

    const prismaQuery: any = {};

    const attributes = Object.keys(request);

    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    modelFields?.forEach((f) => {
      if (
        this.isFieldMandatory(model, parentModel, f, request, modelFields) &&
        !isUpdate
      ) {
        throw new ApiValidationError(f.name + " is required for " + model);
      }

      fieldsMap.set(f.name, f);
    });

    for (const attribute of attributes) {
      const field = fieldsMap.get(attribute);

      if (!this.converter.fieldExists(fieldsMap, attribute, model)) {
        continue;
      }

      if (!field || request[attribute] === undefined) {
        continue;
      }

      const keyNormalized = attribute + "Normalized";
      if (fieldsMap.get(keyNormalized) !== undefined) {
        prismaQuery[keyNormalized] = normalizeString(request[attribute]);
      }

      const keySlug = attribute + "Slug";
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

      if (attribute == "createdAt" || attribute == "updatedAt") {
        request[attribute] = undefined;
      }

      if (attribute.endsWith("Id") && !this.isIdValid(request[attribute])) {
        request[attribute] = undefined;
      }

      if (request[attribute] === "" || request[attribute] == null) {
        request[attribute] =
          request[attribute + "Id"] !== undefined ? undefined : null;
        continue;
      }

      const fieldType = field.type.toLowerCase();

      if (fieldType === "int") {
        prismaQuery[attribute] = this.processInt(request[attribute], attribute);
      } else if (fieldType === "string") {
        prismaQuery[attribute] =
          attribute === "password"
            ? hashPassword(request[attribute])
            : sanitizeString(request[attribute]);
      } else if (fieldType === "boolean") {
        prismaQuery[attribute] = this.processBoolean(
          request[attribute],
          attribute
        );
      } else if (field.kind.toLowerCase() === "object" && processRelations) {
        const relatedModel = field.type;

        if (!field.isList) {
          if (
            fieldsMap.get(attribute + "Id") !== undefined &&
            this.isIdValid(request[attribute + "Id"])
          ) {
            continue;
          } else {
            prismaQuery[attribute] = await this.processOneToManyRelation(
              relatedModel,
              model,
              request,
              attribute
            );
          }
        } else {
          prismaQuery[attribute] = await this.processManyToManyRelation(
            relatedModel,
            model,
            request,
            attribute,
            isUpdate
          );
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
    if (typeof request[field] !== "object") {
      throw new ApiValidationError(
        field + " must be an object, got " + typeof request[field]
      );
    }

    const prismaQuery = {} as any;
    const modelFields = Prisma.dmmf.datamodel.models.find(
      (m) => m.name.toLowerCase() === relatedModel.toLowerCase()
    )?.fields!;

    const relatedObject = request[field];

    const action = this.getAction(relatedObject);

    const processedRelatedObject = await this.processCreateOrUpdateRequest(
      relatedModel,
      relatedObject,
      action === "update",
      false,
      parentModel
    );

    if (action === "update") {
      prismaQuery.update = processedRelatedObject;
    } else if (action === "connect") {
      prismaQuery.connect = { id: relatedObject.id };
    } else {
      prismaQuery.connectOrCreate = {
        create: processedRelatedObject,
        where: this.getUpsertWhereClause(modelFields, relatedObject),
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
        field + " must be an array, got " + typeof request[field]
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
                  }),
              },
            },
          };
        }
      }
    }

    for (const item of request[field]) {
      const action = this.getAction(item);
      const processedRelatedObject = await this.processCreateOrUpdateRequest(
        model,
        item,
        action === "update",
        false,
        parentModel
      );

      if (action === "connect") {
        const mode = isUpdate ? "set" : "connect";

        if (!prismaQuery[mode]) {
          prismaQuery[mode] = [];
        }

        prismaQuery[mode].push({ id: item.id });
      } else if (action === "update" && isUpdate) {
        if (!prismaQuery.upsert) {
          prismaQuery.upsert = [];
        }

        const relatedObject = await this.processCreateOrUpdateRequest(
          model,
          item,
          true
        );

        const relationField = this.getRelationField(
          model,
          parentModel,
          modelFields
        );

        if (relationField) {
          relatedObject[relationField] = undefined;
        }

        relatedObject.id = undefined;

        prismaQuery.upsert.push({
          where: this.getUpsertWhereClause(modelFields, item),
          create: relatedObject,
          update: relatedObject,
        });
      } else {
        if (!prismaQuery.connectOrCreate) {
          prismaQuery.connectOrCreate = [];
        }

        item.id = undefined;
        prismaQuery.connectOrCreate.push({
          create: processedRelatedObject,
          where: this.getUpsertWhereClause(modelFields, item),
        });
      }
    }

    return prismaQuery;
  }

  private getAction(relatedObject: any) {
    const validActions = ["connect", "create", "update"];

    const sentAction = relatedObject["_action_"] ?? undefined;

    if (sentAction && validActions.includes(sentAction)) {
      if (sentAction === "update" || sentAction === "connect") {
        if (this.isIdValid(relatedObject.id)) {
          return sentAction;
        } else {
          if (sentAction === "connect") {
            throw new ApiValidationError(
              "id is required for connect action, got " + relatedObject
            );
          }
        }
      }
    }

    if (this.isIdValid(relatedObject.id)) {
      return "connect";
    }

    return "create";
  }

  private isIdValid(id: ID) {
    return id != undefined && id != 0 && id != null;
  }

  private processBoolean(value: any, key: string) {
    if (getBoolean(value) !== undefined) {
      return getBoolean(value);
    } else {
      throw new ApiValidationError(key + " must be a boolean, got " + value);
    }
  }

  private processInt(value: any, key: string) {
    if (!isNaN(parseInt(value))) {
      return parseInt(value);
    } else {
      throw new ApiValidationError(key + " must be a number, got " + value);
    }
  }

  private getUpsertWhereClause(
    modelFields: readonly Prisma.DMMF.Field[],
    body: any
  ) {
    const where: any = {};

    let idType = "int";

    modelFields.forEach((f) => {
      if (f.isUnique || f.isId) {
        if (body[f.name]) {
          where[f.name] =
            f.type.toLowerCase() === "string"
              ? sanitizeString(body[f.name])
              : parseNumber(body[f.name]);
        }
      }

      if (f.name === "id") {
        idType = f.type.toLowerCase();
      }
    });

    if (Object.keys(where).length === 0) {
      where["id"] = idType === "int" ? -1 : "-1";
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
    const appGeneratedPostfix = ["Normalized", "Slug"];

    if (appGeneratedPostfix.some((postfix) => field.name.endsWith(postfix))) {
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
      const relationName = (field.relationName || "").toLowerCase();
      const relationTo = (parentModel + "To" + model).toLowerCase();

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
        [key]: normalizeString(name, true),
      },
    });

    if (!obj) {
      return normalizeString(name, true);
    } else {
      return await this.calculateSlug(
        name + "-" + uuidv4().substring(0, 4),
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
      include: { parent: true },
    });

    if (!resourceConfig) {
      return false;
    }

    if (resourceConfig.isPublic && this.method === "GET") {
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
      case "GET":
        return permission.read;
      case "PUT":
        return permission.update;
      case "POST":
        return permission.create;
      case "DELETE":
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
  }

  setPermissions(permissions: Permission) {
    this.permissions = permissions;
  }
}

export default PrismaService;
