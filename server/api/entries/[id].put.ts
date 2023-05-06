import { prisma } from '../../prisma'

export default defineEventHandler(async (event) => {
    const { id, name, definition, notes, references, category  } = await readBody(event);

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
            categoryId: category.id === 0 ? undefined : category.id
        }
    }).catch((error) => {
        console.error(error);
    });
    
    return savedEntry;

});