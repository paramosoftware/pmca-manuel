
import type * as Prisma from '@prisma/client';
export { };

declare global {

    export type AppGroup = Prisma.AppGroup & {
        users: AppUser[];
        resources: AppResource[];
    };

    export type AppGroupResource = Prisma.AppGroupResource & {
        group: AppGroup;
        resource: AppResource;
    };

    export type AppGroupUser = Prisma.AppGroupUser & {
        group: AppGroup;
        user: AppUser;
    };

    export type AppMedia = Prisma.AppMedia & {
        entryMedia: EntryMedia[];
    };

    export type AppResource = Prisma.AppResource & {
        groups?: AppGroup[];
        fields?: AppResourceField[];
    };

    export type AppResourceField = Prisma.AppResourceField & {
        resource?: AppResource;
        relatedResource?: AppResource;
    };

    export type AppUser = Prisma.AppUser & {
        restricted?: AppUserRestricted;
    };

    export type AppUserRestricted = Prisma.AppUserRestricted & {
        user?: AppUser;
    };

    export type AppUserSession = Prisma.AppUserSession & {
        user?: AppUser;
    };

    export type Category = {
        id: number;
        name: string;
        nameSlug: string;
        definition?: string;
        children?: Entry[];
        isCategory?: boolean;
        parent?: Category;
        parentId?: number;
    };

    export type Entry = Prisma.Entry & {
        category?: Category;
        translations?: Translation[];
        variations?: Variation[];
        references?: Reference[];
        entryChanges?: EntryChanges[];
        media?: AppMedia[];
        relatedEntries?: Entry[];
        entries?: Entry[];
    };


    export type EntryChanges = Prisma.EntryChanges & {
        entry?: Entry;
        user?: AppUser;
    };

    export type EntryMedia = Prisma.EntryMedia & {
        entry?: Entry;
        media?: AppMedia;
    };


    export type Language = Prisma.Language & {
        translations?: Translation[];
    };

    export type Variation = Prisma.Variation & {
        entry?: Entry;
    };


    export type Translation = Prisma.Translation & {
        entry?: Entry;
        language?: Language;
    };

    export type Reference = Prisma.Reference & {
        entries?: Entry[];
    };

    export type WebPage = Prisma.WebPage;

    export type FormField = Prisma.AppResourceField & {
        resource?: AppResource | undefined,
        relatedResource?: AppResource | undefined,
    }

    export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array'
    export type UIField = 'autocomplete' | 'auxiliaryForm' | 'checkbox' | 'dropzone' | 'finder' | 'input' | 'media' | 'rich' | 'select' | 'textarea'
    export type InputType = 'text' | 'number' | 'email' | 'date' | 'color' | 'password' | 'search' | 'hidden' | 'checkbox' | 'radio'
    export type GenderNoun = 'm' | 'f' | 'n'
    
    export type FormStore = ReturnType<typeof useFormStore>;

    export type Item =  {id: number | string; name: string; };

    export type PaginatedResponse = {
        pageSize: number;
        totalPages: number;
        page: number;
        total: number;
        items: any[];
    }


}