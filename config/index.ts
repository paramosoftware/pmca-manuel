type ObjectType = {
    [key: string]: {
        genderNoun: string;
        singular: string;
        plural: string;
        label: string;
        labelPlural: string;
        isHtml?: boolean;
        form?: string;
        includeRelations?: {
            [key: string]: boolean | {
                orderBy?: {
                    [key: string]: any;
                };
                include?: {
                    [key: string]: boolean | {
                        include?: any;
                        select?: string[];
                        orderBy?: any;
                    };
                };
            };
        };
        where?: {
            [key: string]: any;
        };
    };
};


const RESTRICTED_PATH = '/admin'

const ROUTES = {
     restricted: RESTRICTED_PATH,
     create: RESTRICTED_PATH + '/criar/',
     edit: RESTRICTED_PATH + '/editar/', 
     list: RESTRICTED_PATH + '/listar/',
}


// TODO: Move to database
const OBJECTS: ObjectType = {
    categoria: {
        genderNoun: 'f',
        form: 'category',
        singular: 'entry',
        plural: 'entries',
        label: 'categoria',
        labelPlural: 'categorias',
        includeRelations: {
            parent: true
        },
        where: {
            isCategory: true
        }
    },
    verbete: {
        genderNoun: 'm',
        singular: 'entry',
        plural: 'entries',
        label: 'verbete',
        labelPlural: 'verbetes',
        includeRelations: {
            parent: true,
            references: true,
            translations: {
                include: {
                    language: true
                },
            },
            variations: true,
            entries: true,
            changes: {
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: ['name']
                    }
                }
            },
            relatedEntries: {
                include: {
                    media: {
                        include: {
                            media: true
                        },
                        orderBy: ['position']
                    },
                }
            },
            media: {
                include: {
                    media: true
                },
                orderBy: ['position']
            },
            children: true
        },
        where: {
            isCategory: false
        }
    },
    idioma: {
        genderNoun: 'f',
        singular: 'language',
        plural: 'languages',
        label: 'idioma',
        labelPlural: 'idiomas'
    },
    referencia: {
        genderNoun: 'f',
        singular: 'reference',
        plural: 'references',
        label: 'referência',
        labelPlural: 'referências',
        isHtml: true
    },
    traducao: {
        genderNoun: 'f',
        singular: 'translation',
        plural: 'translations',
        label: 'tradução',
        labelPlural: 'traduções'
    },
    variacao: {
        genderNoun: 'f',
        singular: 'variation',
        plural: 'variations',
        label: 'variação',
        labelPlural: 'variações'
    },
    usuario: {
        genderNoun: 'm',
        singular: 'appUser',
        plural: 'users',
        label: 'usuário',
        labelPlural: 'usuários'
    },
    pagina: {
        genderNoun: 'f',
        singular: 'webPage',
        plural: 'web-pages',
        label: 'página',
        labelPlural: 'páginas'
    }
}


export { ROUTES, OBJECTS }