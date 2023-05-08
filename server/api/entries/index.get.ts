import { prisma } from '../../prisma'


export default defineEventHandler(async (event) => {
    
    const entries = await prisma.entry.findMany({
        include: {
            category: true,
            translations: true,
            relatedEntries: true,
            entries: true
        },
        orderBy: {
            name: 'asc'
        }
    })
    .catch((error) => { 
        console.error(error); 
    });

    return entries;
});


