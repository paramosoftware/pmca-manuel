import { Prisma, PrismaClient } from '@prisma/client'
import { createOneOrMany } from '../../express/prisma/create';
import { DEFAULT_OPTIONS as fieldsDefaultOptions } from '~/config/fields';
import { MODELS as modelsTranslations, FIELDS as fieldsTranslations } from "~/config/translations";

const prisma = new PrismaClient()

async function main() {

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
  const relatedResources = new Map<string, { resourceName: string, relatedResourceName: string }>();

  const resources = Prisma.dmmf.datamodel.models.map(resource => {
    return {
      name: resource.name,
      label: modelsTranslations.get(resource.name)?.label || resource.name,
      labelPlural: modelsTranslations.get(resource.name)?.labelPlural || resource.name,
      isAppModel: resource.name.toLowerCase().startsWith('app'),
      isPublic: !resource.name.toLowerCase().startsWith('app'),
      genderNoun: modelsTranslations.get(resource.name)?.genderNoun || 'n',
      fields: resource.fields.filter(field => !field.name.endsWith('Normalized'))
      .map(field => {
        return {
          name: field.name,
          label: fieldsTranslations.get(field.name) || field.name,
          valueType: convertPrismaTypeToFieldType(field.type, field.isList),
          uiField: convertPrismaTypeToUiField(field).uiField,
          inputType: convertPrismaTypeToUiField(field).inputType ?? undefined,
          hierarchal: false,
          required: field.isRequired && (!field.isId && !field.isUpdatedAt && !field.isGenerated),
          hidden: checkFieldVisibility(field),
          disabled: checkFieldVisibility(field),
          defaultValue: !field.isId && !field.isUpdatedAt && !field.isGenerated && field.name !== 'createdAt' ? field.default : undefined,
          defaultOptions: fieldsDefaultOptions.get(field.name),
          relatedResource: field.kind.toLowerCase() === 'object' ? relatedResources.set(field.name, { resourceName: resource.name, relatedResourceName: field.type }) : undefined,
          position: Prisma.dmmf.datamodel.models.find(m => m.name === resource.name)?.fields.findIndex(f => f.name === field.name) ?? 1 // Inefficient
        } as Prisma.AppResourceFieldCreateInput
      })
    }
  });


  const createdResources = await createOneOrMany('appResource', resources);

  for (const [fieldName, resource] of relatedResources) {

    const field = await prisma.appResourceField.findFirst({
      where: {
        AND: [
          { name: fieldName },
          { resource: { name: resource.resourceName } }
        ]
      }
    });

    console.log('Found field', field);

    if (field?.id) {

      const createdRelation = await prisma.appResourceField.update({
        where: { id: field?.id },
        data: {
          relatedResource: {
            connect: {
              name: resource.relatedResourceName
            }
          }
        }
      })

      console.log('Created relation', createdRelation);
    }

    console.log("Created resources: ", createdResources.length);
    console.log("Created user: ", createdUser);

  }
}


function checkFieldVisibility(field: Prisma.DMMF.Field) {

  const posfix = ['Slug', 'Normalized', 'createdAt', 'updatedAt', 'Id'];
  
  return field.isId || field.isUpdatedAt || field.isGenerated || posfix.some(p => field.name.endsWith(p));

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


function convertPrismaTypeToUiField(prismaField: Prisma.DMMF.Field) {

  const type = convertPrismaTypeToFieldType(prismaField.type, prismaField.isList);
  const name = prismaField.name.toLowerCase();

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

  if (fieldOptions[name]) {
    uiField = fieldOptions[name].uiField;
    inputType = fieldOptions[name].inputType;
  }

  if (fieldsDefaultOptions.get(prismaField.name)) {
    uiField = 'select';
  }


  return { uiField, inputType };
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
