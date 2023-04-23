import { prisma } from '../../prisma'


export default defineEventHandler(async (event) => {
    
    const entries = await prisma.entry.findMany({})
    .catch((error) => { 
        console.error(error); 
    });

    return entries;
});


