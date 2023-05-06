import { prisma } from '../../prisma'


export default defineEventHandler(async (event) => {

    const categories = await prisma.category.findMany({
        include: {
            children: true
        }
    }).catch((error) => {
        console.error(error);
    });

    return categories;
});


