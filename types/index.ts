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
        name: string;
    }

}