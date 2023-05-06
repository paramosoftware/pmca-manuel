import { prisma } from '../../prisma';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;

    const category = await prisma.category.findUnique({
        where: {
            // @ts-ignore
            id: parseInt(id)
        }
    }).catch((error) => {
        console.error(error);
    });

    return category;
});