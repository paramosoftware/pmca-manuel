import { prisma } from '../../prisma'


export default defineEventHandler(async (event) => {

    const categories = await prisma.category.findMany({
        include: {
            children: true,
            entries: true
        },
        orderBy: {
            name: 'asc'
        }
    }).catch((error) => {
        console.error(error);
    });

    return categories;
});


