import { prisma } from '../../prisma'

export default defineEventHandler(async (event) => {

    const { name, description, parentId } = await readBody(event);

    const category = await prisma.category.create({
        data: {
            name,
            description: description ? description : undefined,
            parentId: parentId ? parseInt(parentId) : undefined
        }
    }).catch((error) => {
        console.error(error);
        return error;
    });

    return category;

});
