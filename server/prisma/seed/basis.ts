import { Prisma, PrismaClient } from '@prisma/client'
import { createOneOrMany } from '../../express/prisma/create';
import { MODELS as modelsTranslations, FIELDS as fieldsTranslations } from "~/config/translations";

const prisma = new PrismaClient()
const relatedResources = new Map<string, string>();
const fieldRelations = new Map<string, { resource: string,  a: string, b: string | undefined }>();
const resourcesConfig = new Map<string, Prisma.AppResourceCreateInput>();
const resourcesFieldsMap = new Map<string, Map<string, Prisma.DMMF.Field>>();

async function main() {

  await prisma.appUser.deleteMany({ where: { login: 'admin' } });

  const createdUser = await createOneOrMany('appUser', {
    login: 'admin',
    email: 'admin@email.com',
    name: 'Admin',
    restricted: {
      password: 'admin',
      isAdmin: true
    }
  });

   await prisma.appResource.deleteMany({});

  // first get the resource config so it can be used to build the fields config
  const resources = Prisma.dmmf.datamodel.models.map(resource => {
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
    } as Prisma.AppResourceCreateInput & { fields: any[] };
  });


  for (const resource of resources) {
    resource.isRelation = resources.some(r => resource.name.startsWith(r.name) && resource.name !== r.name);

    // if config is changed, update it
    if (resource.isRelation) {
      resource.isPublic = false;
      const resourceConfig = resourcesConfig.get(resource.name);
      if (resourceConfig) {
        resourceConfig.isRelation = true;
        resourceConfig.isPublic = false;
        resourcesConfig.set(resource.name, resourceConfig);
      }
    }
  }


  // add categories resource that is not in the datamodel
  const categoriesFields = ['name', 'definition', 'parentId', "isCategory"];
  let categoryResource = {} as Prisma.AppResourceCreateInput & { fields: any[] };

  for (const resource of resources) {
    // now all info is available to build the fields config
    resource.fields = buildFieldsConfig(resource.name, resource.fields, resourcesFieldsMap.get(resource.name) as Map<string, Prisma.DMMF.Field>);

    if (resource.name === 'Entry') {
      categoryResource = JSON.parse(JSON.stringify({ ...resource }));
      categoryResource.name = 'Category';
      categoryResource.label = 'Categoria';
      categoryResource.labelPlural = 'Categorias';
      categoryResource.fields = categoryResource.fields
        .filter(field => categoriesFields.includes(field.name))
        .map(field => {
          if (field.name === 'parentId') {
            field.label = 'Hierarquia';
          }

          if (field.name === 'isCategory') {
            field.defaultValue = 'true';
          }

          return field;
        });
    }

    relatedResources.set('parentId:Category', 'Entry');
  }

  resources.push(categoryResource as Prisma.AppResourceCreateInput & { fields: any[] });

  const createdResources = await createOneOrMany('appResource', resources);

  let relatedResourcesCount = 0;
  for (const [fieldResource, relatedResource] of relatedResources) {
    const field = await prisma.appResourceField.findFirst({
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

    await prisma.appResourceField.update({
      where: { id: field?.id },
      data: {
        relatedResource: {
          connect: {
            name: relatedResource
          }
        }
      }
    })

    relatedResourcesCount++;
  }

  let fieldRelationsCount = 0;
  for (const [relationName, relation] of fieldRelations) {

    const field = await prisma.appResourceField.findFirst({
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

    const relatedField = await prisma.appResourceField.findFirst({
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

    await prisma.appResourceField.update({
      where: { id: field.id },
      data: {
        hidden: true,
        oppositeField: {
          connect: {
            id: relatedField.id
          }
        }
      }
    })

    fieldRelationsCount++;
  }

  console.log('Found ' + fieldRelations.size + ' relations and connected ' + fieldRelationsCount);
  console.log('Found ' + relatedResources.size + ' related resources and connected ' + relatedResourcesCount);
  console.log('Created ' + createdResources.length + ' resources');
  console.log('Created user', createdUser);

}

function buildResourceConfig(resource: Prisma.DMMF.Model) {

    const docConfig = getDocConfig(resource.documentation);

    const fieldsMap = new Map<string, Prisma.DMMF.Field>();

    for (const field of resource.fields) {
      if (field.relationName) {
        const relation = fieldRelations.get(field.relationName);
        if (relation) {
          fieldRelations.set(field.relationName, { ...relation, b: field.name });
        } else {
          fieldRelations.set(field.relationName, { resource: resource.name, a: field.name, b: undefined });
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
      label: modelsTranslations.get(resource.name)?.label || docConfig.label || resource.name,
      labelPlural: modelsTranslations.get(resource.name)?.labelPlural || docConfig.labelPlural || resource.name,
      isAppModel: docConfig.isAppModel == 'true' || resource.name.toLowerCase().startsWith('app'),
      isPublic:   docConfig.isPublic == 'true' || !resource.name.toLowerCase().startsWith('app'),
      isRelation: docConfig.isRelation == 'true' || false,
      isHierarchical: docConfig.isHierarchical == 'true' || fieldsMap.has('parentId'),
      genderNoun: modelsTranslations.get(resource.name)?.genderNoun || docConfig.genderNoun || 'n',
      fields: resource.fields 
    } as any;

    return resourceConfig;
}

function buildFieldsConfig(resource: string, fields: Prisma.DMMF.Field[], fieldsMap: Map<string, Prisma.DMMF.Field>) {

  const fieldsConfig = [] as any[];

  for (const field of fields) {

    if (field.name.endsWith('Normalized')) {
      continue;
    }

    const docConfig = getDocConfig(field.documentation);

    const fieldConfig = {
      name: field.name,
      label: fieldsTranslations.get(field.name) || docConfig.label || field.name,
      valueType: docConfig.valueType || convertPrismaTypeToFieldType(field.type, field.isList),
      uiField: docConfig.uiField || convertPrismaTypeToUiField(field, docConfig, fieldsMap).uiField,
      inputType: docConfig.inputType || convertPrismaTypeToUiField(field, docConfig, fieldsMap).inputType || 'text',
      isHierarchical: docConfig.isHierarchical === 'true' || field.name === 'parentId',
      isRich: docConfig.isRich === 'true' || false,
      required: docConfig.required === 'true' || checkFieldRequired(field),
      hidden: docConfig.hidden === 'true' || checkFieldVisibility(resource, field, fieldsMap),
      disabled: docConfig.disabled === 'true' || checkFieldVisibility(resource, field, fieldsMap),
      defaultValue: docConfig.defaultValue || undefined,
      defaultOptions: docConfig.defaultOptions || undefined,
      relatedResource: docConfig.relatedResource || getRelatedResource(resource, field, fieldsMap),
      oppositeField: undefined,
      position: docConfig.position || Array.from(fieldsMap.keys()).indexOf(field.name) + 1,
    } as Prisma.AppResourceFieldCreateInput & { resource: undefined };

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

function convertPrismaTypeToUiField(prismaField: Prisma.DMMF.Field, docConfig: Record<string, string>, fieldsMap: Map<string, Prisma.DMMF.Field>) {

  const type = convertPrismaTypeToFieldType(prismaField.type, prismaField.isList);
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
    object: { uiField: 'select' },
  } as Record<string, { uiField: UIField, inputType?: InputType }>;

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
        prismaField.kind = 'object';
        prismaField.type = relatedField.type;
      }
    }
  }

  if (prismaField.kind === 'object' && resourcesConfig.has(prismaField.type)) {

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

function getRelatedResource(resource: string, field: Prisma.DMMF.Field, fieldsMap: Map<string, Prisma.DMMF.Field>) {

  const relatedResource = fieldsMap.get(field.name);

  if (relatedResource?.kind === 'object') {
    if (relatedResource.relationFromFields)  {

      for (const relation of relatedResource.relationFromFields) {

        const relatedField = fieldsMap.get(relation);

        if (relatedField) {
          relatedResources.set(relatedField.name + ':' + resource,  relatedResource.type );
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
      const documentation = doc.split('|').map(v => v.trim()).filter(v => v);
      for (const doc of documentation) {
        const [key, value] = doc.split(':').map(v => v.trim()).filter(v => v);
        docConfig[key] = value;
      }
    }
  
    return docConfig;
}

function checkFieldVisibility(resource: string, field: Prisma.DMMF.Field, fieldsMap: Map<string, Prisma.DMMF.Field>) {

  const postfixes = ['id', 'parent', 'children', 'createdAt', 'updatedAt', 'Slug', 'Normalized'];
  
  return field.isId || field.isUpdatedAt || field.isGenerated || postfixes.some(p => field.name.endsWith(p)) || fieldsMap.has(field.name + 'Id');

}


function checkFieldRequired(field: Prisma.DMMF.Field) {
  const postfixes = ['id', 'createdAt', 'updatedAt', 'Slug', 'Normalized'];
  return field.isRequired && !field.isId && !field.isUpdatedAt && !field.isGenerated && !field.isList && !postfixes.some(p => field.name.endsWith(p));
  
}


main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
