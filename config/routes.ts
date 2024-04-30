const RESTRICTED_PATH = '/admin';

const ROUTES = {
    restricted: RESTRICTED_PATH,
    create: RESTRICTED_PATH + '/criar/',
    edit: RESTRICTED_PATH + '/editar/',
    list: RESTRICTED_PATH + '/listar/',
    import: RESTRICTED_PATH + '/importar',
    backup: RESTRICTED_PATH + '/backup'
};

export default ROUTES;
