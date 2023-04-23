import { prisma } from '../../prisma'

export default defineEventHandler(async (event) => {
    const { title, content  } = await readBody(event);
    
    const entry = await prisma.entry.create({
        data: {
            title,
            content
        }
    }).catch((error) => {
        console.error(error);
    });
    
    return entry;

});
