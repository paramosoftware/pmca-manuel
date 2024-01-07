

const MODELS = new Map<string, { label: string; labelPlural: string; genderNoun: GenderNoun; }>();


MODELS.set('AppGroup', {
    label: 'Grupo',
    labelPlural: 'Grupos',
    genderNoun: 'm'
});
MODELS.set('AppGroupResource', {
    label: 'Recurso do grupo',
    labelPlural: 'Recursos dos grupos',
    genderNoun: 'm'
});
MODELS.set('AppGroupUser', {
    label: 'Grupo de usuário',
    labelPlural: 'Grupos de usuários',
    genderNoun: 'm'
});
MODELS.set('AppMedia', {
    label: 'Mídia',
    labelPlural: 'Mídias',
    genderNoun: 'f'
});
MODELS.set('AppResource', {
    label: 'Recurso',
    labelPlural: 'Recursos',
    genderNoun: 'm'
});
MODELS.set('AppResourceField', {
    label: 'Campo',
    labelPlural: 'Campos',
    genderNoun: 'm'
});
MODELS.set('AppUser', {
    label: 'Usuário',
    labelPlural: 'Usuários',
    genderNoun: 'm'
});
MODELS.set('AppUserRestricted', {
    label: 'Dados restritos do usuário',
    labelPlural: 'Dados restritos dos usuários',
    genderNoun: 'm'
});
MODELS.set('AppUserSession', {
    label: 'Sessão do usuário',
    labelPlural: 'Sessões dos usuários',
    genderNoun: 'f'
});
MODELS.set('Entry', {
    label: 'Verbete',
    labelPlural: 'Verbetes',
    genderNoun: 'm'
});
MODELS.set('EntryChanges', {
    label: 'Alteração do verbete',
    labelPlural: 'Alterações dos verbetes',
    genderNoun: 'f'
});
MODELS.set('EntryMedia', {
    label: 'Mídia do verbete',
    labelPlural: 'Mídias dos verbetes',
    genderNoun: 'f'
});
MODELS.set('Language', {
    label: 'Idioma',
    labelPlural: 'Idiomas',
    genderNoun: 'm'
});
MODELS.set('Variation', {
    label: 'Variação do verbete',
    labelPlural: 'Variações dos verbetes',
    genderNoun: 'f'
});
MODELS.set('Translation', {
    label: 'Tradução do verbete',
    labelPlural: 'Traduções dos verbetes',
    genderNoun: 'f'
});
MODELS.set('Reference', {
    label: 'Referência',
    labelPlural: 'Referências',
    genderNoun: 'f'
});
MODELS.set('WebPage', {
    label: 'Página web',
    labelPlural: 'Páginas web',
    genderNoun: 'f'
});


const FIELDS = new Map<string, string>();
FIELDS.set('id', 'id');
FIELDS.set('name', 'Nome');
FIELDS.set('nameSlug', 'Slug');
FIELDS.set('description', 'Descrição');
FIELDS.set('permissions', 'Permissões');
FIELDS.set('users', 'Usuários');
FIELDS.set('createdAt', 'Criado em');
FIELDS.set('updatedAt', 'Atualizado em');
FIELDS.set('groupId', 'Id do grupos');
FIELDS.set('resourceId', 'Id do recurso');
FIELDS.set('read', 'Ler');
FIELDS.set('create', 'Criar');
FIELDS.set('update', 'Atualizar');
FIELDS.set('delete', 'Apagar');
FIELDS.set('batch', 'Alterar em lote');
FIELDS.set('resource', 'Recurso');
FIELDS.set('group', 'Grupo');
FIELDS.set('userId', 'Id do usuário');
FIELDS.set('user', 'Usuário');
FIELDS.set('originalFilename', 'Nome original');
FIELDS.set('path', 'Caminho no servidor');
FIELDS.set('subtitle', 'Legendas');
FIELDS.set('valueType', 'Tipo de valor do campo');
FIELDS.set('isPublic', 'É público');
FIELDS.set('entryMedia', 'Mídias do verbete');
FIELDS.set('label', 'Rótulo');
FIELDS.set('labelPlural', 'Rótulo no plural');
FIELDS.set('definition', 'Definição');
FIELDS.set('genderNoun', 'Gênero gramatical');
FIELDS.set('isAppModel', 'É modelo do sistema');
FIELDS.set('isPublic', 'É público');
FIELDS.set('groups', 'Grupos');
FIELDS.set('fields', 'Campos');
FIELDS.set('relatedFields', 'Campos relacionados');
FIELDS.set('placeholder', 'Placeholder');
FIELDS.set('richText', 'Text rich');
FIELDS.set('hierarchal', 'É hierárquico?');
FIELDS.set('required', 'É obrigatório?');
FIELDS.set('hidden', 'É oculto?');
FIELDS.set('disabled', 'É desabilitado?');
FIELDS.set('defaultValue', 'Valor padrão');
FIELDS.set('defaultOptions', 'Opções padrão (separadas por vírgula)');
FIELDS.set('relatedResource', 'Recurso relacionado');
FIELDS.set('relatedResourceId', 'Id do recurso relacionado');
FIELDS.set('allowCreate', 'Permitir criar?');
FIELDS.set('allowMultiple', 'Permitir múltiplos?');
FIELDS.set('max', 'Tamanho máximo (em caracteres para string e em itens para array)');
FIELDS.set('query', 'Query para autocomplete e finder');
FIELDS.set('uiField', 'Tipo do campo de interface');
FIELDS.set('inputType', 'Tipo do input');
FIELDS.set('login', 'Login');
FIELDS.set('email', 'E-mail');
FIELDS.set('restricted', 'Dados restritos');
FIELDS.set('isAdmin', 'É administrador?');
FIELDS.set('password', 'Senha');
FIELDS.set('isBlocked', 'Está bloqueado?');
FIELDS.set('groups', 'Grupos');
FIELDS.set('sessions', 'Sessões');
FIELDS.set('refreshToken', 'Token de atualização');
FIELDS.set('accessCount', 'Contagem de acessos');
FIELDS.set('isCategory', 'É categoria');
FIELDS.set('notes', 'Notas');
FIELDS.set('parent', 'Pai');
FIELDS.set('parentId', 'Id do pai');
FIELDS.set('changes', 'Alterações');
FIELDS.set('translations', 'Traduções');
FIELDS.set('variations', 'Variações');
FIELDS.set('references', 'Referências');
FIELDS.set('entryChanges', 'Alterações');
FIELDS.set('media', 'Mídias');
FIELDS.set('relatedEntries', 'Verbetes relacionados');
FIELDS.set('entries', 'Verbetes');
FIELDS.set('entry', 'Verbetes');
FIELDS.set('language', 'Idioma');
FIELDS.set('languageId', 'Id do idioma');
FIELDS.set('languageCode', 'Código do idioma');
FIELDS.set('content', 'Conteúdo');
FIELDS.set('menuName', 'Nome no menu');


export { MODELS, FIELDS }