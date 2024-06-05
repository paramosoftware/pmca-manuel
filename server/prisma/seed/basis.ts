import { Prisma, PrismaClient } from '@prisma/client';
import {
    MODELS as modelsTranslations,
    FIELDS as fieldsTranslations
} from '~/config/translations';
import LANGUAGES from '~/config/languages';
import getBoolean from '~/utils/getBoolean';
import PrismaService from '../PrismaService';

const prisma = new PrismaClient();
const relatedResources = new Map<string, string>();
const fieldRelations = new Map<
    string,
    { resource: string; a: string; b: string | undefined }
>();
const resourcesConfig = new Map<string, Prisma.ResourceCreateInput>();
const resourcesFieldsMap = new Map<string, Map<string, Prisma.DMMF.Field>>();

async function main() {
    const userService = new PrismaService('user', false);

    await userService.deleteOne('admin');

    const createdUser = await userService.createOne({
        login: 'admin',
        email: 'admin@email.com',
        name: 'Administrador(a)',
        password: 'admin',
        isAdmin: true
    });

    await prisma.resource.deleteMany({});

    // first get the resource config so it can be used to build the fields config
    const resources = Prisma.dmmf.datamodel.models.map((resource) => {
        const resourceConfig = buildResourceConfig(resource);

        resourcesConfig.set(resource.name, resourceConfig);

        return {
            name: resource.name,
            model: resource.name,
            label: resourceConfig.label,
            labelPlural: resourceConfig.labelPlural,
            isAppModel: resourceConfig.isAppModel,
            isPublic: resourceConfig.isPublic,
            isRelation: resourceConfig.isRelation,
            isHierarchical: resourceConfig.isHierarchical,
            genderNoun: resourceConfig.genderNoun,
            fields: resourceConfig.fields
        } as Prisma.ResourceCreateInput & { fields: any[] };
    });

    const parentResourcesMap = new Map<string, string>();

    for (const resource of resources) {
        const parentResource = resources.find(
            (r) => resource.name.startsWith(r.name) && resource.name !== r.name
        );

        if (parentResource) {
            resource.isRelation = true;
            resource.isPublic = parentResource.isPublic;
            resource.isAppModel = parentResource.isAppModel;

            parentResourcesMap.set(resource.name, parentResource.name);

            const resourceConfig = resourcesConfig.get(resource.name);

            if (resourceConfig) {
                resourceConfig.isRelation = true;
                resourceConfig.isPublic = parentResource.isPublic;
                resourceConfig.isAppModel = parentResource.isAppModel;
                resourcesConfig.set(resource.name, resourceConfig);
            }
        }
    }

    for (const resource of resources) {
        resource.fields = buildFieldsConfig(
            resource.name,
            resource.fields,
            resourcesFieldsMap.get(resource.name) as Map<
                string,
                Prisma.DMMF.Field
            >
        );
    }

    const resourceService = new PrismaService('resource', false);
    const createdResources = await resourceService.createMany(resources);

    for (const [resourceName, parentResourceName] of parentResourcesMap) {
        await prisma.resource.update({
            where: { name: resourceName },
            data: {
                parent: {
                    connect: {
                        name: parentResourceName
                    }
                }
            }
        });
    }

    let relatedResourcesCount = 0;
    for (const [fieldResource, relatedResource] of relatedResources) {
        const field = await prisma.resourceField.findFirst({
            where: {
                AND: [
                    { name: fieldResource.split(':')[0] },
                    { resource: { name: fieldResource.split(':')[1] } }
                ]
            }
        });

        if (!field) {
            console.log('Field not found', fieldResource);
            continue;
        }

        await prisma.resourceField.update({
            where: { id: field?.id },
            data: {
                relatedResource: {
                    connect: {
                        name: relatedResource
                    }
                }
            }
        });

        relatedResourcesCount++;
    }

    let fieldRelationsCount = 0;
    for (const [relationName, relation] of fieldRelations) {
        const field = await prisma.resourceField.findFirst({
            where: {
                AND: [
                    { name: relation.a },
                    { resource: { name: relation.resource } }
                ]
            }
        });

        if (!field) {
            console.log('Field not found', relation);
            continue;
        }

        const relatedField = await prisma.resourceField.findFirst({
            where: {
                AND: [
                    { name: relation.b },
                    { resource: { name: relation.resource } }
                ]
            }
        });

        if (!relatedField) {
            console.log('Related field not found', relation);
            continue;
        }

        await prisma.resourceField.update({
            where: { id: field.id },
            data: {
                hidden: true,
                oppositeField: {
                    connect: {
                        id: relatedField.id
                    }
                }
            }
        });

        fieldRelationsCount++;
    }

    for (const [name, code] of LANGUAGES) {
        const where = {
            OR: [{ name: name }, { code: code }, { code: name }, { name: code }]
        };

        const languageService = new PrismaService('language', false);
        const foundLanguage = await languageService.readMany({ where: where });

        if (foundLanguage && foundLanguage.total > 0) {
            if (foundLanguage.items[0].name !== name) {
                await languageService.updateOne(foundLanguage.items[0].id, {
                    name: name
                });
            }

            if (foundLanguage.items[0].code !== code) {
                await languageService.updateOne(foundLanguage.items[0].id, {
                    code: code
                });
            }

            continue;
        }

        const newLanguage = await languageService.createOne({ name, code });
    }

    await prisma.group.deleteMany({});
    await createDefaultGroups(createdUser.id);

    console.log(
        'Found ' +
            fieldRelations.size +
            ' relations and connected ' +
            fieldRelationsCount
    );
    console.log(
        'Found ' +
            relatedResources.size +
            ' related resources and connected ' +
            relatedResourcesCount
    );
    console.log('Created ' + createdResources.length + ' resources');
    console.log('Created user', createdUser);
}

async function createDefaultGroups(userId: string) {
    const resources = await prisma.resource.findMany({
        where: {
            isAppModel: false,
            isRelation: false
        }
    });

    const userPermissions = ['Concept', 'Reference'];
    const editorPermissions = ['Language', 'WebPage'].concat(userPermissions);

    const adminGroup = {
        name: 'Administradores',
        users: [{ id: userId }],
        permissions: [] as any[]
    };

    const editorGroup = {
        name: 'Editores',
        permissions: [] as any[]
    };

    const userGroup = {
        name: 'Cadastradores',
        permissions: [] as any[]
    };

    for (const resource of resources) {
        const permission = {
            read: true,
            create: true,
            update: true,
            delete: true,
            import: false,
            batch: false,
            resourceId: resource.id
        };

        if (editorPermissions.includes(resource.name)) {
            editorGroup.permissions.push(permission);
        }

        if (userPermissions.includes(resource.name)) {
            userGroup.permissions.push(permission);
        }

        const permissionCopy = JSON.parse(JSON.stringify(permission));
        permissionCopy.import = true;
        permissionCopy.batch = true;
        adminGroup.permissions.push(permissionCopy);
    }

    const groups = [adminGroup, editorGroup, userGroup];

    const groupService = new PrismaService('group', false);
    for (const group of groups) {
        let groupCopy = JSON.parse(JSON.stringify(group));
        await groupService.createOne(groupCopy);
    }
}

function buildResourceConfig(resource: Prisma.DMMF.Model) {
    const docConfig = getDocConfig(resource.documentation);

    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    for (const field of resource.fields) {
        if (field.relationName) {
            const relation = fieldRelations.get(field.relationName);
            if (relation) {
                fieldRelations.set(field.relationName, {
                    ...relation,
                    b: field.name
                });
            } else {
                fieldRelations.set(field.relationName, {
                    resource: resource.name,
                    a: field.name,
                    b: undefined
                });
            }
        }
        fieldsMap.set(field.name, field);
    }

    resourcesFieldsMap.set(resource.name, fieldsMap);

    for (const [key, value] of fieldRelations) {
        if (!value.b) {
            fieldRelations.delete(key);
        }
    }

    const resourceConfig = {
        name: resource.name,
        label:
            modelsTranslations.get(resource.name)?.label ||
            docConfig.label ||
            resource.name,
        labelPlural:
            docConfig.labelPlural ||
            modelsTranslations.get(resource.name)?.labelPlural ||
            resource.name,
        isAppModel: docConfig.isAppModel == 'true' || false,
        isPublic: docConfig.isPublic == 'true' || false,
        isRelation: docConfig.isRelation == 'true' || false,
        isHierarchical:
            docConfig.isHierarchical == 'true' || fieldsMap.has('parentId'),
        genderNoun:
            modelsTranslations.get(resource.name)?.genderNoun ||
            docConfig.genderNoun ||
            'n',
        fields: resource.fields
    } as any;

    return resourceConfig;
}

function buildFieldsConfig(
    resource: string,
    fields: Prisma.DMMF.Field[],
    fieldsMap: Map<string, Prisma.DMMF.Field>
) {
    const fieldsConfig = [] as any[];

    for (const field of fields) {
        if (field.name.endsWith('Normalized')) {
            continue;
        }

        const docConfig = getDocConfig(field.documentation);

        const fieldConfig = {
            name: field.name,
            label:
                docConfig.label ||
                fieldsTranslations.get(field.name) ||
                field.name,
            max: docConfig.max || undefined,
            valueType:
                docConfig.valueType ||
                convertPrismaTypeToFieldType(field.type, field.isList),
            uiField:
                docConfig.uiField ||
                convertPrismaTypeToUiField(field, docConfig, fieldsMap).uiField,
            inputType:
                docConfig.inputType ||
                convertPrismaTypeToUiField(field, docConfig, fieldsMap)
                    .inputType ||
                'text',
            isHierarchical:
                docConfig.isHierarchical === 'true' ||
                field.name === 'parentId',
            isRich: docConfig.isRich === 'true',
            required:
                docConfig.required !== undefined
                    ? getBoolean(docConfig.required)
                    : checkFieldRequired(field),
            hidden:
                docConfig.hidden !== undefined
                    ? getBoolean(docConfig.hidden)
                    : checkFieldVisibility(resource, field, fieldsMap),
            disabled:
                docConfig.disabled !== undefined
                    ? getBoolean(docConfig.disabled)
                    : checkFieldVisibility(resource, field, fieldsMap),
            defaultValue: docConfig.defaultValue || undefined,
            defaultOptions: docConfig.defaultOptions || undefined,
            relatedResource:
                docConfig.relatedResource ||
                getRelatedResource(resource, field, fieldsMap),
            oppositeField: undefined,
            position:
                docConfig.position ||
                Array.from(fieldsMap.keys()).indexOf(field.name) + 1,
            includeExport: docConfig.includeExport === 'true',
            allowCreate: docConfig.allowCreate !== 'false',
            allowMultiple: docConfig.allowMultiple !== 'false',
            placeholder: docConfig.placeholder || undefined,
            published: resource === 'Concept',
            isPrivate: docConfig.isPrivate === 'true'
        } as Prisma.ResourceFieldCreateInput & { resource: undefined };

        fieldsConfig.push(fieldConfig);
    }

    return fieldsConfig;
}

function convertPrismaTypeToFieldType(prismaType: string, isList: boolean) {
    if (isList) {
        return 'array';
    }

    switch (prismaType.toLowerCase()) {
        case 'string':
            return 'string';
        case 'int':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'datetime':
            return 'string';
        case 'json':
            return 'string';
        case 'enum':
            return 'string';
        case 'float':
            return 'number';
        case 'decimal':
            return 'number';
        case 'bigint':
            return 'number';
        default:
            return 'object';
    }
}

function convertPrismaTypeToUiField(
    prismaField: Prisma.DMMF.Field,
    docConfig: Record<string, string>,
    fieldsMap: Map<string, Prisma.DMMF.Field>
) {
    const type = convertPrismaTypeToFieldType(
        prismaField.type,
        prismaField.isList
    );
    const name = prismaField.name;

    const fieldOptions = {
        password: { uiField: 'input', inputType: 'password' },
        email: { uiField: 'input', inputType: 'email' },
        date: { uiField: 'input', inputType: 'date' },
        definition: { uiField: 'textarea' },
        description: { uiField: 'textarea' },
        notes: { uiField: 'textarea' },
        query: { uiField: 'textarea' },
        defaultOptions: { uiField: 'textarea' },
        content: { uiField: 'rich' },
        media: { uiField: 'media' },
        boolean: { uiField: 'checkbox' },
        array: { uiField: 'autocomplete' },
        number: { uiField: 'input', inputType: 'number' },
        string: { uiField: 'input', inputType: 'text' },
        object: { uiField: 'select' }
    } as Record<string, { uiField: UIField; inputType?: InputType }>;

    let uiField = 'input';
    let inputType: InputType | undefined = undefined;

    if (fieldOptions[type]) {
        uiField = fieldOptions[type].uiField;
        inputType = fieldOptions[type].inputType;
    }

    if (name.endsWith('Id') || docConfig?.defaultOptions) {
        uiField = 'select';
        const relatedObjectName = name.slice(0, -2);

        if (fieldsMap.has(relatedObjectName)) {
            const relatedField = fieldsMap.get(relatedObjectName);
            if (relatedField?.kind === 'object') {
                // @ts-ignore
                prismaField.kind = 'object';
                // @ts-ignore
                prismaField.type = relatedField.type;
            }
        }
    }

    if (
        prismaField.kind === 'object' &&
        resourcesConfig.has(prismaField.type)
    ) {
        const resourceConfig = resourcesConfig.get(prismaField.type);

        if (resourceConfig?.isRelation) {
            uiField = 'auxiliaryForm';
        }

        if (resourceConfig?.isHierarchical && name.endsWith('Id')) {
            uiField = 'finder';
        }
    }

    if (fieldOptions[name]) {
        uiField = fieldOptions[name].uiField;
        inputType = fieldOptions[name].inputType;
    }

    return { uiField, inputType };
}

function getRelatedResource(
    resource: string,
    field: Prisma.DMMF.Field,
    fieldsMap: Map<string, Prisma.DMMF.Field>
) {
    const relatedResource = fieldsMap.get(field.name);

    if (relatedResource?.kind === 'object') {
        if (relatedResource.relationFromFields) {
            for (const relation of relatedResource.relationFromFields) {
                const relatedField = fieldsMap.get(relation);

                if (relatedField) {
                    relatedResources.set(
                        relatedField.name + ':' + resource,
                        relatedResource.type
                    );
                }
            }
        }

        relatedResources.set(field.name + ':' + resource, relatedResource.type);
    }

    return undefined;
}

function getDocConfig(doc: string | undefined) {
    const docConfig = {} as Record<string, string>;

    if (doc) {
        const documentation = doc
            .split('|')
            .map((v) => v.trim())
            .filter((v) => v);
        for (const doc of documentation) {
            const [key, value] = doc
                .split(':')
                .map((v) => v.trim())
                .filter((v) => v);
            docConfig[key] = value;
        }
    }

    return docConfig;
}

function checkFieldVisibility(
    resource: string,
    field: Prisma.DMMF.Field,
    fieldsMap: Map<string, Prisma.DMMF.Field>
) {
    const postfixes = [
        'id',
        'parent',
        'children',
        'createdAt',
        'updatedAt',
        'Slug',
        'Normalized'
    ];

    return (
        field.isId ||
        field.isUpdatedAt ||
        field.isGenerated ||
        postfixes.some((p) => field.name.endsWith(p)) ||
        fieldsMap.has(field.name + 'Id')
    );
}

function checkFieldRequired(field: Prisma.DMMF.Field) {
    const postfixes = ['id', 'createdAt', 'updatedAt', 'Slug', 'Normalized'];
    return (
        field.isRequired &&
        !field.isId &&
        !field.isUpdatedAt &&
        !field.isGenerated &&
        !field.isList &&
        !postfixes.some((p) => field.name.endsWith(p))
    );
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
