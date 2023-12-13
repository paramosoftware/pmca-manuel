import { Prisma, PrismaClient } from '@prisma/client'
import { createOneOrMany } from '../../express/prisma/create';


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


  const resources = Prisma.dmmf.datamodel.models.map(resource => {
    return {
      name: resource.name,  // TODO: Change to real name adding comments in schema
      namePlural: resource.name, // TODO: Change to real name
      prismaModel: resource.name,
      isAppModel: resource.name.toLowerCase().startsWith('app'),
      isPublic: !resource.name.toLowerCase().startsWith('app'),
      fields: resource.fields.map(field => { return { name: field.name, prismaField: field.name } })
    }
  })

  const createdResources = await createOneOrMany('appResource', resources);

  console.log("Created user: ", createdUser);
  console.log("Created resources: ", createdResources.length);

}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
