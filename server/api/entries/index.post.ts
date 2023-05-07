import { prisma } from '../../prisma'
import { useNormalizeString } from '../../../composables/useNormalizeString'


export default defineEventHandler(async (event) => {
    const { name, definition, notes, references, categoryId  } = await readBody(event);

    const { normalizeString } = useNormalizeString();

    const savedEntry = await prisma.entry.create({
        data: {
            name,
            code: normalizeString(name),
            definition: definition === "" ? null : definition,
            notes: notes === "" ? null : notes,
            references: references === "" ? null : references,
            categoryId: categoryId === 0 ? null : parseInt(categoryId)
        }
    }).catch((error) => {
        console.error(error);
    });
    
    return savedEntry;

});
