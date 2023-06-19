export { };

declare global {

    export interface Category {
        id: number;
        name: string;
        description?: string;
        parentId?: number;
        children?: Category[];
        entries?: Entry[];
        createdAt?: Date;
        updatedAt?: Date;
    }
    
    export interface Entry {
        id: number;
        code?: string;
        name: string;
        definition?: string;
        notes?: string;
        references?: Reference[];
        media?: Media[];
        variations?: Variation[];
        translations?: Translation[];
        relatedEntries?: Entry[];
        category?: Category;
        categoryId?: number;
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

    export interface Media {
        id: number;
        name: string;
        path?: string;
        subtitle?: string;
        private?: boolean;
        position?: number;
        type?: string;
        entries?: Entry[];
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
        languageId: number;
        entry: Entry;
        createdAt?: Date;
        updatedAt?: Date;   
    }

    export interface Variation {
        id?: number;
        name: string;
        entry?: Entry;
    }

    export interface Reference {
        id: number;
        name: string;

        createdAt?: Date;
        updatedAt?: Date;
    }
}