import { prisma } from '../../prisma';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;

    const entry = await prisma.entry.findUnique({
        where: {
            // @ts-ignore
            id: parseInt(id)
        },
        include: {
            category: true,
            translations: true,
            relatedEntries: true,
            entries: true
        }
    }).catch((error) => {
        console.error(error);
    });

    return entry;
});