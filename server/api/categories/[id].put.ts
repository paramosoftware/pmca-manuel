import { prisma } from '../../prisma';

export default defineEventHandler(async (event) => {
    
    const { id, name, description, parentId } = await readBody(event);

    const category = await prisma.category.update({
        where: {
            // @ts-ignore
            id: parseInt(id)
        },
        data: {
            name,
            description: description === '' ? null : description,
            parentId: parentId == 0 ? null : parseInt(parentId)
        }
    }).catch((error) => {
        return error;
    });


    return category;
});