import { ApiValidationError } from '../express/error';
import { prisma } from './prisma';

class PrismaServiceValidator {
    private model: string;

    constructor(model: string) {
        this.model = model;
    }

    /**
     * Validates a query
     * @param {Query} query - The query to validate
     * @throws ApiValidationError
     * @example
     * { pageSize: 20, page: 1, select: ['id', 'name'], where: { id: 1 }, include: ['user'], orderBy: { id: 'asc' } }
     */
    validate(query: Query) {
        // @ts-ignore
        if (!prisma[this.model]) {
            throw new ApiValidationError(
                'Model ' + this.model + ' does not exist'
            );
        }

        if (query.page && query.page < 1) {
            throw new ApiValidationError('Page must be greater than 0');
        }

        if (query.select) {
            this.validateSelect(query.select);
        }

        if (query.orderBy) {
            this.validateOrder(query.orderBy);
        }

        if (query.where) {
            this.validateWhere(query.where);
        }

        if (query.include) {
            this.validateInclude(query.include);
        }
    }

    /**
     * Validates the select array
     * @param {string[]} select - The select array
     * @throws ApiValidationError
     * @example select = ['id', 'name']
     */
    private validateSelect(select: string[]) {
        return select.length > 0;
    }

    /**
     * Validates the include object. Use '*' to include all related entities.
     * @param include
     * @throws ApiValidationError
     * @example include = { user: { select: ['id', 'name'] } } || include = ['user'] || include = { user: true } || include = '*'
     */
    private validateInclude(include: Include | string[] | string) {
        if (include === '*' || typeof include === 'string') {
            return;
        }

        if (Array.isArray(include)) {
            return include.length > 0;
        } else {
            const keys = Object.keys(include);
            keys.forEach((key) => {
                if (typeof include[key] !== 'boolean') {
                    this.validate(include[key] as Query);
                }
            });
        }
    }

    /**
     * Validates the where object
     * @param where
     * @throws ApiValidationError
     * @example where = { id: 1, name: 'John' } || where = { OR: [{ id: 1 }, { name: 'John' }], AND: [{ id: 1 }, { name: 'John' }], not: [{ id: 1 }] }
     */
    private validateWhere(where: Where) {
        const keys = Object.keys(where);

        if (where.AND || where.OR || where.NOT) {
            keys.forEach((key) => {
                if (key !== 'AND' && key !== 'OR' && key !== 'NOT') {
                    throw new ApiValidationError(
                        'If using or, and or not, where must not have any other conditions'
                    );
                }
            });
        }

        for (const key of keys) {
            if (key === 'AND' || key === 'OR' || key === 'NOT') {
                this.validateWhereOperator(key, where);
            } else {
                this.validateCondition(where[key] as Condition);
            }
        }
    }

    private validateWhereOperator(key: string, where: Where) {
        if (Array.isArray(where[key])) {
            // @ts-ignore
            where[key].forEach((condition) => {
                const field = Object.keys(condition)[0];

                this.validateCondition(condition[field] as Condition);
            });
        } else {
            // @ts-ignore
            validateCondition(where[key]);
        }
    }

    private validateOrder(order: OrderBy | string[]) {
        if (Array.isArray(order)) {
            return order.length > 0;
        }

        const allowedKeys = ['sort', 'nulls', '_count'];

        for (const key in order) {
            if (typeof order[key] === 'string') {
                if (order[key] !== 'asc' && order[key] !== 'desc') {
                    throw new ApiValidationError('Order must be asc or desc');
                }
            }

            if (typeof order[key] === 'object') {
                const keys = Object.keys(order[key]);

                for (const k of keys) {
                    if (allowedKeys.includes(k)) {
                        if (k === 'sort' || k === '_count') {
                            // @ts-ignore
                            if (
                                order[key][k] !== 'asc' &&
                                order[key][k] !== 'desc'
                            ) {
                                throw new ApiValidationError(
                                    'Order must be asc or desc'
                                );
                            }
                        }

                        if (k === 'nulls') {
                            // @ts-ignore
                            if (
                                order[key][k] !== 'first' &&
                                order[key][k] !== 'last'
                            ) {
                                throw new ApiValidationError(
                                    'Nulls must be first or last'
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    private validateCondition(condition: Condition) {
        if (
            typeof condition === 'string' ||
            typeof condition === 'number' ||
            Array.isArray(condition) ||
            typeof condition === 'boolean'
        ) {
            return;
        }

        const keys = Object.keys(condition);

        if (keys.length !== 1) {
            throw new ApiValidationError(
                'Condition must have only one operator'
            );
        }

        const key = keys[0];

        const operator = key.toLowerCase();

        const value = condition[key];

        const validOperators = this.getValidOperators();

        if (!validOperators.includes(operator)) {
            throw new ApiValidationError(
                'Operator must be one of ' + validOperators.join(', ')
            );
        }

        if (Array.isArray(value)) {
            if (operator !== 'in' && operator !== 'notin') {
                throw new ApiValidationError('Operator must be in or notin');
            }
        }

        if (operator === 'isnull') {
            if (typeof value !== 'boolean') {
                throw new ApiValidationError(
                    'Value must be a boolean for isNull operator'
                );
            }
        }
    }

    private getValidOperators() {
        return [
            '=',
            'eq',
            '!=',
            'not',
            '>',
            'gt',
            '<',
            'lt',
            '>=',
            'gte',
            '<=',
            'lte',
            'contains',
            'like',
            'notlike',
            'startswith',
            'start',
            'endswith',
            'end',
            'in',
            'notin',
            'equals',
            'isnull'
        ];
    }
}

export default PrismaServiceValidator;
