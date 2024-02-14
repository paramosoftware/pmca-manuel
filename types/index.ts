
import type * as Prisma from '@prisma/client';
export { };

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
    };

    export type ResourceField = Prisma.ResourceField & {
        resource?: Resource;
        relatedResource?: Resource;
    };

    export type User = Prisma.User & {
        groups?: Group[];
        sessions?: UserSession[];
        author?: Author;
    };

    export type UserSession = Prisma.UserSession & {
        user?: User;
    };

    export type Author = Prisma.Author & {
        user?: User;
    };

    export type Entry = Prisma.Entry & {
        parent?: Entry;
        translations?: Translation[];
        variations?: Variation[];
        references?: Reference[];
        changes?: EntryChanges[];
        media?: EntryMedia[];
        relatedEntries?: Entry[];
        entries?: Entry[];
        children?: Entry[];
    };


    export type EntryChanges = Prisma.EntryChanges & {
        entry?: Entry;
        user?: User;
    };

    export type EntryMedia = Prisma.EntryMedia & {
        entry?: Entry;
    };

    export type Language = Prisma.Language & {
        translations?: Translation[];
    };

    export type Variation = Prisma.EntryVariation & {
        entry?: Entry;
    };


    export type Translation = Prisma.EntryTranslation & {
        entry?: Entry;
        language?: Language;
    };

    export type Reference = Prisma.Reference & {
        entries?: Entry[];
    };

    export type WebPage = Prisma.WebPage;

    export type FormField = Prisma.ResourceField & {
        resource?: Resource | undefined,
        relatedResource?: Resource | undefined,
    }

    export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array'
    export type UIField = 'autocomplete' | 'auxiliaryForm' | 'checkbox' | 'dropzone' | 'finder' | 'input' | 'media' | 'rich' | 'select' | 'textarea'
    export type InputType = 'text' | 'number' | 'email' | 'date' | 'color' | 'password' | 'search' | 'hidden' | 'checkbox' | 'radio'
    export type GenderNoun = 'm' | 'f' | 'n'
    
    export type FormStore = ReturnType<typeof useFormStore>;
    export type ResourceStore = ReturnType<typeof useResourceStore>;
    export type ListStore = ReturnType<typeof useListStore>;

    export type Item = {
        id: ID; 
        name: string; 
        nameSlug?: string;
        label?: string 
        labelSlug?: string
    };

    export type HierarchicalItem = Item & {
        parentId: ID;
        parent?: HierarchicalItem;
        children?: any[]
    };

    export type PaginatedResponse = {
        pageSize: number;
        totalPages: number;
        page: number;
        total: number;
        items: any[];
    }

    export type ID = number | string | null;

    export type TreeNode = {
        id: ID;
        parentId: ID;
        label: string;
        slug?: string;
        expanded: boolean;
        children: TreeNode[];
        isLeaf?: boolean;
    }


    export type DataTransferFormat = 'json' | 'xml' | 'csv' | 'xlsx';

    export type Permission = {
        [key: string]: {
            create: boolean;
            read: boolean;
            update: boolean;
            delete: boolean;
        };
    }

}