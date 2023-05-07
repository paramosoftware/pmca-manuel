import { prisma } from '../../prisma'

export default defineEventHandler(async (event) => {
    const { name, definition, notes, references, categoryId  } = await readBody(event);

    const savedEntry = await prisma.entry.create({
        data: {
            name,
            definition: definition === "" ? undefined : definition,
            notes: notes === "" ? undefined : notes,
            references: references === "" ? undefined : references,
            categoryId: categoryId === 0 ? null : parseInt(categoryId)
        }
    }).catch((error) => {
        console.error(error);
    });
    
    return savedEntry;

});
