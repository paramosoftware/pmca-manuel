import { prisma } from '../../prisma'

export default defineEventHandler(async (event) => {
    const { id, name, definition, notes, references, categoryId  } = await readBody(event);

    const savedEntry = await prisma.entry.update({
        where: {
            // @ts-ignore
            id: parseInt(id)
        },
        data: {
            name,
            definition: definition === "" ? undefined : definition,
            notes: notes === "" ? undefined : notes,
            references: references === "" ? undefined : references,
            categoryId: categoryId === 0 ? undefined : parseInt(categoryId)
        }
    }).catch((error) => {
        console.error(error);
    });
    
    return savedEntry;

});