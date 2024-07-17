const MODELS = new Map<
    string,
    { label: string; labelPlural: string; genderNoun: GenderNoun }
>();

MODELS.set('Group', {
    label: 'Grupo de permissões',
    labelPlural: 'Grupos de permissões',
    genderNoun: 'm'
});
MODELS.set('GroupPermission', {
    label: 'Permissão',
    labelPlural: 'Permissões',
    genderNoun: 'f'
});
MODELS.set('Resource', {
    label: 'Recurso',
    labelPlural: 'Recursos',
    genderNoun: 'm'
});
MODELS.set('ResourceField', {
    label: 'Campo',
    labelPlural: 'Campos',
    genderNoun: 'm'
});
MODELS.set('User', {
    label: 'Usuário',
    labelPlural: 'Usuários',
    genderNoun: 'm'
});
MODELS.set('UserSession', {
    label: 'Sessão do usuário',
    labelPlural: 'Sessões dos usuários',
    genderNoun: 'f'
});
MODELS.set('Concept', {
    label: 'Termo',
    labelPlural: 'Termos',
    genderNoun: 'm'
});
MODELS.set('ConceptChanges', {
    label: 'Histórico de alterações',
    labelPlural: 'Históricos de alterações',
    genderNoun: 'f'
});
MODELS.set('ConceptMedia', {
    label: 'Imagens do termo',
    labelPlural: 'Imagens dos termos',
    genderNoun: 'f'
});
MODELS.set('ReferenceMedia', {
    label: 'PDF da fonte',
    labelPlural: 'PDFs das fontes',
    genderNoun: 'f'
});
MODELS.set('ConceptVariation', {
    label: 'Forma variante do termo',
    labelPlural: 'Formas variantes dos termos',
    genderNoun: 'f'
});
MODELS.set('ConceptTranslation', {
    label: 'Termo equivalente em outro idioma',
    labelPlural: 'Termos equivalentes em outros idiomas',
    genderNoun: 'f'
});
MODELS.set('Language', {
    label: 'Idioma',
    labelPlural: 'Idiomas',
    genderNoun: 'm'
});
MODELS.set('Reference', {
    label: 'Fonte',
    labelPlural: 'Fontes',
    genderNoun: 'f'
});
MODELS.set('WebPage', {
    label: 'Página web',
    labelPlural: 'Páginas web',
    genderNoun: 'f'
});
MODELS.set('Glossary', {
    label: 'Glossário',
    labelPlural: 'Glossários',
    genderNoun: 'm'
});
MODELS.set('Keyword', {
    label: 'Palavra-chave',
    labelPlural: 'Palavras-chave',
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
FIELDS.set('groupId', 'Grupo de permissões');
FIELDS.set('resourceId', 'Recurso do sistema');
FIELDS.set('read', 'Ler');
FIELDS.set('create', 'Criar');
FIELDS.set('update', 'Atualizar');
FIELDS.set('delete', 'Apagar');
FIELDS.set('batch', 'Alterar em lote');
FIELDS.set('resource', 'Recurso do sistema');
FIELDS.set('group', 'Grupo');
FIELDS.set('userId', 'Usuário');
FIELDS.set('user', 'Usuário');
FIELDS.set('originalFilename', 'Nome original');
FIELDS.set('path', 'Caminho no servidor');
FIELDS.set('subtitle', 'Legendas');
FIELDS.set('valueType', 'Tipo de valor do campo');
FIELDS.set('isPublic', 'É público');
FIELDS.set('conceptMedia', 'Imagens');
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
FIELDS.set('isRich', 'É campo rich (html)?');
FIELDS.set('isHierarchical', 'É hierárquico?');
FIELDS.set('required', 'É obrigatório?');
FIELDS.set('hidden', 'É oculto?');
FIELDS.set('disabled', 'É desabilitado?');
FIELDS.set('defaultValue', 'Valor padrão');
FIELDS.set('defaultOptions', 'Opções padrão (separadas por vírgula)');
FIELDS.set('relatedResource', 'Recurso relacionado');
FIELDS.set('relatedResourceId', 'Recurso relacionado');
FIELDS.set('allowCreate', 'Permitir criar?');
FIELDS.set('allowMultiple', 'Permitir múltiplos?');
FIELDS.set(
    'max',
    'Tamanho máximo (em caracteres para string e em itens para array)'
);
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
FIELDS.set('notes', 'Notas');
FIELDS.set('parentId', 'Classificação');
FIELDS.set('changes', 'Histórico de alterações');
FIELDS.set('translations', 'Termos equivalentes em outros idiomas');
FIELDS.set('variations', 'Formas variantes');
FIELDS.set('references', 'Fontes');
FIELDS.set('conceptChanges', 'Histórico de alterações');
FIELDS.set('media', 'Imagens');
FIELDS.set('concepts', 'Ver também');
FIELDS.set('relatedConcepts', 'Ver também');
FIELDS.set('concept', 'Termo');
FIELDS.set('language', 'Idioma');
FIELDS.set('languageId', 'Idioma');
FIELDS.set('code', 'Código do idioma');
FIELDS.set('content', 'Conteúdo');
FIELDS.set('menuName', 'Nome no menu');
FIELDS.set('conceptId', 'Termo');
FIELDS.set('position', 'Posição');
FIELDS.set(
    'oppositeField',
    'Campo oposto (para relacionamentos bidirecionais)'
);
FIELDS.set(
    'oppositeFieldId',
    'Campo oposto (para relacionamentos bidirecionais)'
);
FIELDS.set('relatedOppositeFields', 'Campos opostos relacionados');
FIELDS.set('isRelation', 'É uma tabela de relacionamento?');
FIELDS.set('parent', 'Termo superior');
FIELDS.set('children', 'Termos inferiores');
FIELDS.set('type', 'Tipo');
FIELDS.set('published', 'Publicado');
FIELDS.set('privateNotes', 'Notas internas');
FIELDS.set('glossary', 'Glossário');
FIELDS.set('glossaryId', 'Glossário');
FIELDS.set('glossaries', 'Glossários');
FIELDS.set('keywords', 'Palavras-chave');
FIELDS.set('canBeImported', 'Pode ser importado?');
FIELDS.set('canBeExported', 'Pode ser exportado?');
FIELDS.set('nameRich', 'Nome (html)');

export { MODELS, FIELDS };
