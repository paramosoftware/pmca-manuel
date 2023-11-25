type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'not like' | 'in' | 'not in';

type Direction = 'asc' | 'desc';

export interface Where {
    and?: Condition | Condition[];
    or?: Condition | Condition[];
    not?: Condition | Condition[];
    [key: string]: string | number | string[] | number[] | Condition | Condition[] | undefined;
}

export interface Condition {
    [key: string]: {
        operator: Operator;
        value: string | number | string[] | number[];
    } |
    string | number | string[] | number[];
}

export interface Order {
    [key: string]: Direction;
}

export interface Include {
    [key: string]: Query | boolean;
}

export interface Query {
    select?: string[];
    where?: Where;
    include?: Include | string[];
    orderBy?: Order;
    take?: number;
    skip?: number;
}

export interface PaginatedQuery extends Query {
    pageSize: number;
    page: number;
}
