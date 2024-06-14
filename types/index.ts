import type * as Prisma from '@prisma/client';
export {};

declare global {
    export type Group = Prisma.Group & {
        users?: User[];
        resources?: Resource[];
    };

    export type GroupPermission = Prisma.GroupPermission & {
        group?: Group;
        resource?: Resource;
    };

    export type Resource = Prisma.Resource & {
        groups?: Group[];
        fields?: ResourceField[];
        relatedResources?: Resource[];
        children?: Resource[];
        parent?: Resource;
    };

    export type ResourceField = Prisma.ResourceField & {
        resource?: Resource;
        relatedResource?: Resource;
    };

    export type User = Prisma.User & {
        groups?: Group[];
        sessions?: UserSession[];
    };

    export type UserSession = Prisma.UserSession & {
        user?: User;
    };

    export type Concept = Prisma.Concept & {
        parent?: Concept;
        translations?: Translation[];
        variations?: Variation[];
        references?: Reference[];
        changes?: ConceptChanges[];
        media?: ConceptMedia[];
        relatedConcepts?: Concept[];
        concepts?: Concept[];
        children?: Concept[];
    };

    export type ConceptChanges = Prisma.ConceptChanges & {
        concept?: Concept;
        user?: User;
    };

    export type ConceptMedia = Prisma.ConceptMedia & {
        concept?: Concept;
    };

    export type Language = Prisma.Language & {
        translations?: Translation[];
    };

    export type Variation = Prisma.ConceptVariation & {
        concept?: Concept;
    };

    export type Translation = Prisma.ConceptTranslation & {
        concept?: Concept;
        language?: Language;
    };

    export type Reference = Prisma.Reference & {
        concepts?: Concept[];
    };

    export type WebPage = Prisma.WebPage;

    export type FormField = Prisma.ResourceField & {
        resource?: Resource | undefined;
        relatedResource?: Resource | undefined;
    };

    export type ValueType =
        | 'string'
        | 'number'
        | 'boolean'
        | 'object'
        | 'array';

    export type UIField =
        | 'autocomplete'
        | 'auxiliaryForm'
        | 'checkbox'
        | 'dropzone'
        | 'finder'
        | 'input'
        | 'media'
        | 'rich'
        | 'select'
        | 'textarea';

    export type InputType =
        | 'text'
        | 'number'
        | 'email'
        | 'date'
        | 'color'
        | 'password'
        | 'search'
        | 'hidden'
        | 'checkbox'
        | 'radio';

    export type GenderNoun = 'm' | 'f' | 'n';

    export type FormStore = ReturnType<typeof useFormStore>;
    export type ResourceStore = ReturnType<typeof useResourceStore>;
    export type ListStore = ReturnType<typeof useListStore>;
    export type UserStore = ReturnType<typeof useUserStore>;
    export type ConceptStore = ReturnType<typeof useConceptStore>;

    export type Item = {
        id: ID;
        name: string;
        nameSlug?: string;
        label?: string;
        labelSlug?: string;
    };

    export type HierarchicalItem = Item & {
        parentId: ID;
        parent?: HierarchicalItem;
        children?: any[];
        position?: number;
    };

    export type PaginatedResponse = {
        pageSize: number;
        totalPages: number;
        page: number;
        total: number;
        items: any[];
    };

    export type ID = number | string | null;

    export type TreeNode = {
        id: ID;
        parentId: ID;
        label: string;
        slug?: string;
        expanded: boolean;
        children: TreeNode[];
        isLeaf?: boolean;
        parent?: TreeNode;
        position: number;
    };

    export type DataTransferFormat = 'json' | 'xml' | 'csv' | 'xlsx';

    export type Permission = {
        [key: string]: {
            create: boolean;
            read: boolean;
            update: boolean;
            delete: boolean;
            batch: boolean;
            import: boolean;
        };
    };

    export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

    type Operator = string | any;

    type Direction = 'asc' | 'desc';

    type Nulls = 'first' | 'last';

    export type WhereValueType =
        | string
        | number
        | boolean
        | Date
        | string[]
        | number[]
        | Condition
        | Condition[]
        | undefined;

    export interface Where {
        AND?: Condition | Condition[];
        OR?: Condition | Condition[];
        NOT?: Condition | Condition[];
        [key: string]: WhereValueType;
    }

    export interface Condition {
        [key: string]:
            | {
                  [key: string]: string | Date | number | string[] | number[];
              }
            | WhereValueType;
    }

    export interface OrderByNested {
        sort?: Direction;
        nulls?: Nulls;
        _count?: Direction;
    }

    export interface OrderBy {
        [key: string]: OrderByNested | Direction | OrderBy;
    }

    export interface Include {
        [key: string]: Query | boolean;
    }

    export type Select = string[];

    export interface Query {
        pageSize?: number;
        page?: number;
        select?: string[];
        where?: Where;
        include?: Include | string[] | '*';
        orderBy?: OrderBy;
        take?: number;
        skip?: number;
    }

    export interface UserToken {
        isAdmin: boolean;
        userId: string;
        permissions: Permission;
        name: string;
    }

    export type Link = {
        label: string;
        to: string;
        icon?: string;
        active?: boolean;
    };

    interface FinderExpandEvent {
        expanded: ID[];
        sourceEvent: string;
        expandedItems: TreeNode[];
    }

    interface ImgHtml {
        src: string;
        alt: string;
        title?: string;
        width?: number;
        height?: number;
    }

    interface ApiParams {
        model: string;
        id: ID;
        hasQuery: boolean;
        partialResource: string;
        isPublic: boolean;
        isUpload: boolean;
        isImport: boolean;
        isExport: boolean;
        apiMethod: string;
    }

    interface RequestProgress {
        progress: number;
        finished: boolean;
        error: boolean;
        message: string;
        report?: string;
    }


    interface ImportReport {
        duration: string;
        totalItems: number;
        processedItems: number;
        skippedItems: number;
        warnings: string[];
        errors: string[];
    }
}
