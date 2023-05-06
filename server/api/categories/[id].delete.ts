import { prisma } from '../../prisma';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;

    const deleteCategory = await prisma.category.delete({
        where: {
            // @ts-ignore
            id: parseInt(id)
        }
    }) 
    .catch((error) => {
        console.error(error);
    });

    return deleteCategory;
});