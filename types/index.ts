export { };

declare global {

    export interface Category {
        id: number;
        name: string;
        definition?: string;
        parentId?: number;
        children?: Category[];
        entries?: Entry[];
        createdAt?: Date;
        updatedAt?: Date;
    }
    
    export interface Entry {
        id: number;
        slug?: string;
        name: string;
        definition?: string;
        notes?: string;
        references?: WebPage[];
        media?: EntryMedia[];
        variations?: Variation[];
        translations?: Translation[];
        relatedEntries?: Entry[];
        entryChanges?: EntryChanges[];
        category?: Category;
        categoryId?: number;
        createdAt?: Date;
        updatedAt?: Date;
    }

    export interface EntryChanges {
        id: number;
        entryId: number;
        entry: Entry;
        userId: number;
        changes: string;
        createdAt?: Date;
        updatedAt?: Date;
    }
    
    export interface Language {
        id: number;
        name: string;
        abbreviation?: string;
        code?: string;
        translations?: Translation[];
        createdAt?: Date;
        updatedAt?: Date;
    }

    export interface EntryMedia {
        id: number;
        mediaId: number;
        entryId: number;
        position?: number;

        media?: Media;
        entry?: Entry;

        createdAt?: Date;
        updatedAt?: Date;
    }

    export interface Media {
        id: number;
        name: string;
        path?: string;
        subtitle?: string;
        private?: boolean;
        position?: number;
        type?: string;
        entries?: EntryMedia[];
        createdAt?: Date;
        updatedAt?: Date;
    }


    export interface User {
        id: number;
        email: string;
        password: string;

        refreshToken: string;

        name: string;
        
        firstName?: string;
        lastName?: string;

        role?: number;

        createdAt?: Date;
        updatedAt?: Date;
    }

    export interface Translation {
        id: number;
        name: string;
        language?: Language;
        languageId?: number;
        entry: Entry;
        createdAt?: Date;
        updatedAt?: Date;   
    }

    export interface Variation {
        id?: number;
        name: string;
        entry?: Entry;
    }


    export interface WebPage {
        id: number;
        name: string;
        menuName?: string;


        slug: string;

        content?: string;

        createdAt?: Date;
        updatedAt?: Date;

    }
}