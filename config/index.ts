type ObjectType = {
    [key: string]: {
        genderNoun: string;
        singular: string;
        plural: string;
        label: string;
        labelPlural: string;
        isHtml?: boolean;
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
        singular: 'category',
        plural: 'categories',
        label: 'categoria',
        labelPlural: 'categorias'
    },
    verbete: {
        genderNoun: 'm',
        singular: 'entry',
        plural: 'entries',
        label: 'verbete',
        labelPlural: 'verbetes'
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
        singular: 'user',
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