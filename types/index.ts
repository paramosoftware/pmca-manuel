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
        code: string;
        name: string;
        definition?: string;
        notes?: string;
        references?: string;
        media?: Media[];
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

    export interface Translation {
        id: number;
        name: string;
        language: Language;
        entry: Entry;
        createdAt?: Date;
        updatedAt?: Date;   
    }
}