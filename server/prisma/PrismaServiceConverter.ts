import { Prisma } from "@prisma/client";
import logger from "~/utils/logger";
import getBoolean from "~/utils/getBoolean";
import normalizeString from "~/utils/normalizeString";
import parseNumber from "~/utils/parseNumber";
import { ApiValidationError } from "../express/error";

class PrismaServiceConverter {
  private model: string;
  private pageSize: number = 20;
  private page: number = 1;
  private modelFields: readonly Prisma.DMMF.Field[];
  private fieldsMap: Map<string, Prisma.DMMF.Field>;

  constructor(
    model: string,
    modelFields: readonly Prisma.DMMF.Field[],
    fieldsMap: Map<string, Prisma.DMMF.Field>
  ) {
    this.model = model;
    this.modelFields = modelFields;
    this.fieldsMap = fieldsMap;
  }

  /**
   * Converts the request to a Prisma query
   * @param body
   * @param paginated
   * @param identifierToAddUniqueFields - Identifier to add unique fields to the where clause with OR as: where: { OR: [{ id: 1 }, { name: 1 }] }
   * @returns A Prisma query or a paginated Prisma query
   * @throws ApiValidationError
   * @example body = { select: ['id', 'name'], where: { id: 1 }, include: { user: { select ['id', 'name'] } }, orderBy: { name: 'asc' }, pageSize: 20, page: 1 }
   */
  convertRequestToPrismaQuery(
    request: Query,
    paginated: boolean = false,
    identifierToAddUniqueFields?: ID | undefined
  ) {
    const query = {
      select: request.select || undefined,
      where: request.where || undefined,
      include: request.include || undefined,
      orderBy: request.orderBy || undefined,
    } as Query;

    const prismaQuery = this.convertQuery(query, this.model);

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
          prismaQuery.skip = this.calculateSkip(request.pageSize, request.page);
        }
      }
    }

    if (identifierToAddUniqueFields) {
      const uniqueFields = this.modelFields.filter((f) => f.isUnique || f.isId);

      prismaQuery.where = { OR: [] };

      for (const field of uniqueFields ?? []) {
        const value = parseNumber(identifierToAddUniqueFields);
        const valueType = typeof value;

        if (field.type === "Int" && valueType === "number") {
          prismaQuery.where.OR.push({ [field.name]: value });
        }

        if (field.type === "String" && valueType === "string") {
          prismaQuery.where.OR.push({ [field.name]: value });
        }

        if (this.fieldsMap.get(field.name + "Slug") && valueType === "string") {
          prismaQuery.where.OR.push({
            [field.name + "Slug"]: normalizeString(value, true),
          });
        }

        if (
          this.fieldsMap.get(field.name + "Normalized") &&
          valueType === "string"
        ) {
          prismaQuery.where.OR.push({
            [field.name + "Normalized"]: normalizeString(value),
          });
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
      query.select.forEach((field) => {
        this.fieldExists(fieldsMap, field, model);
        prismaQuery.select[field] = true;
      });
    }

    if (query.where) {
      prismaQuery.where = this.convertWhere(query.where, model, fieldsMap);
    }

    if (query.include) {
      const include = this.convertInclude(query.include, model, fieldsMap);

      if (query.select) {
        prismaQuery.select = {
          ...prismaQuery.select,
          ...include,
        };
      } else {
        prismaQuery.include = include;
      }
    }

    if (query.orderBy === undefined && addOrderBy) {
      query.orderBy = fieldsMap.get("name")
        ? { name: "asc" }
        : fieldsMap.get("id")
        ? { id: "asc" }
        : undefined;
    }

    if (query.orderBy) {
      prismaQuery.orderBy = this.convertOrder(query.orderBy, model, fieldsMap);
    }

    return prismaQuery;
  }

  private convertWhere(
    where: Where,
    model: string,
    fieldsMap: Map<string, Prisma.DMMF.Field>
  ) {
    let prismaQuery: any = {};

    const keys = Object.keys(where);

    keys.forEach((key) => {
      if (key === "AND" || key === "OR" || key === "NOT") {
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
        prismaQuery["AND"] = prismaQuery["AND"] || [];
        prismaQuery["AND"].push(
          this.convertCondition(key, where[key] as Condition, model, fieldsMap)
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

    if (!this.fieldExists(fieldsMap, field, model)) {
      logger.info("Field " + field + " not found in model: " + model);
      return prismaQuery;
    }

    if (fieldsMap.get(field + "Normalized") !== undefined) {
      field = field + "Normalized";
      isNormalized = true;
    }

    prismaQuery[field] = {};

    const conditionType = typeof condition;

    if (
      Array.isArray(condition) ||
      conditionType === "string" ||
      conditionType === "number" ||
      conditionType === "boolean"
    ) {
      if (Array.isArray(condition)) {
        prismaQuery[field].in = parseNumber(condition);
      } else {
        if (conditionType === "boolean") {
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
      case "=":
      case "eq":
      case "equals":
        prismaQuery[field].equals = isNormalized
          ? normalizeString(value as string)
          : parseNumber(value);
        break;
      case "!=":
      case "not":
        prismaQuery[field].not = { equals: parseNumber(value) };
        break;
      case ">":
      case "gt":
        prismaQuery[field].gt = parseNumber(value);
        break;
      case "<":
      case "lt":
        prismaQuery[field].lt = parseNumber(value);
        break;
      case ">=":
      case "gte":
        prismaQuery[field].gte = parseNumber(value);
        break;
      case "<=":
      case "lte":
        prismaQuery[field].lte = parseNumber(value);
        break;
      case "contains":
      case "like":
        prismaQuery[field].contains = isNormalized
          ? normalizeString(value as string)
          : value;
        break;
      case "notlike":
        prismaQuery[field].not = {
          contains: isNormalized ? normalizeString(value as string) : value,
        };
        break;
      case "startswith":
      case "start":
        prismaQuery[field].startsWith = isNormalized
          ? normalizeString(value as string)
          : value;
        break;
      case "endswith":
      case "end":
        prismaQuery[field].endsWith = isNormalized
          ? normalizeString(value as string)
          : value;
        break;
      case "in":
        prismaQuery[field].in = Array.isArray(value) ? value : [value];
        break;
      case "notin":
        prismaQuery[field].not = { in: Array.isArray(value) ? value : [value] };
        break;
      case "isnull":
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
    if (typeof include === "string") {
      const prismaQuery: any = {};
      if (include === "*") {
        fieldsMap.forEach((f) => {
          if (f.kind === "object") {
            prismaQuery[f.name] = true;
          }
        });
        return prismaQuery;
      }
    }

    const prismaQuery: any = {};

    if (Array.isArray(include)) {
      include.forEach((field) => {
        this.fieldExists(fieldsMap, field, model);

        prismaQuery[field] = true;
      });
    } else if (typeof include === "object") {
      const fields = Object.keys(include);

      fields.forEach((field) => {
        const modelField = fieldsMap.get(field);

        if (modelField) {
          if (typeof include[field] === "boolean") {
            prismaQuery[field] = include[field];
          } else {
            if (modelField?.kind !== "object") {
              throw new ApiValidationError(
                field +
                  " is not a relation, got: " +
                  modelField?.kind +
                  "in model: " +
                  model
              );
            }
            prismaQuery[field] = this.convertQuery(
              include[field] as Query,
              modelField?.type || "",
              false
            );
          }
        } else {
          logger.info("Field " + field + " not found in model: " + model);
        }
      });
    }

    return prismaQuery;
  }

  private convertOrder(
    order: Order | string[],
    model: string,
    fieldsMap: Map<string, Prisma.DMMF.Field>
  ) {
    const orderBy: Order[] = [];

    const processField = (field: string, direction: "asc" | "desc" = "asc") => {
      if (fieldsMap.get(field + "Normalized") !== undefined) {
        field = field + "Normalized";
      }

      if (this.fieldExists(fieldsMap, field, model)) {
        orderBy.push({ [field]: direction });
      }
    };

    if (Array.isArray(order)) {
      order.forEach((field) => processField(field));
    } else {
      Object.entries(order).forEach(([key, direction]) =>
        processField(key, direction)
      );
    }

    return orderBy;
  }

  fieldExists(
    fieldsMap: Map<string, Prisma.DMMF.Field>,
    field: string,
    model: string
  ) {
    if (fieldsMap.get(field) === undefined) {
      logger.info("Field " + field + " not found in model: " + model);
      return false;
    }

    return true;
  }

  private calculateSkip(pageSize: number, page: number) {
    return (page - 1) * pageSize;
  }

  setPageSize(pageSize: number) {
    this.pageSize = pageSize;
  }

  setPage(page: number) {
    this.page = page;
  }
}

export default PrismaServiceConverter;
