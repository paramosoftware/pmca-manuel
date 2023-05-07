import { prisma } from '../../prisma';

export default defineEventHandler(async (event) => {

    const { code } = await readBody(event);

    const entry = await prisma.entry.findUnique({
        where: {
            code: code
        },
        include: {
            category: true
        }
    }).catch((error) => {
        console.error(error);
    });

    return entry;
});
