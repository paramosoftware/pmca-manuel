import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/prisma';
import fs from 'fs';
import useMedia from '../../composables/useMedia';
import sanitizeHtml from 'sanitize-html'


function prepareRequestBodyForPrisma(data: any, create: boolean = false, addNormalizedField: boolean = true) {
    
    let transformedData = {...data};
    
    Object.keys(transformedData).forEach(key => {

        if (getNormalizedFields().includes(key)) {
            transformedData[key] = sanitizeHtml(transformedData[key]);
        }

        if (addNormalizedField) {
            transformedData = addNormalizedFields(key, transformedData);
        }

        if (key === 'slug') {
            transformedData[key] = normalizeString(transformedData['name'], true);
        }

        if (!create && key === 'id') {
            transformedData[key] = undefined;
        }

        if (key.endsWith('Id')) {

            transformedData[key] = parseInt(transformedData[key]);

        } else if (Array.isArray(transformedData[key])) {

            transformedData[key] = create ? {
                connect: mapIds(transformedData[key])
            } : {
                set: mapIds(transformedData[key])
            };

        } else if (typeof transformedData[key] === 'object' && transformedData[key] !== null) {

            transformedData[key] = create ? {
                connect: {
                    id: parseInt(transformedData[key].id)
                }
            } : {
                set: {
                    id: parseInt(transformedData[key].id)
                }
            };
        }

    });

    return replaceEmptyWithNull(transformedData);
}

function mapIds(values: any[]) {
    return values.map((value) => { return { id: parseInt(value.id) } });
}

function replaceEmptyWithNull(obj: any) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        newObj[key] = value === "" ? null : value;
        newObj[key] = value === 0 ? null : value;
        if (key === 'id') {
            newObj[key] = value === 0 ? undefined : value;
        }
    }
    return newObj;
}

function addNormalizedFields(key: string, data: any) {

    const normalizedFields = getNormalizedFields();

    if (normalizedFields.includes(key)) {
        data[`${key}Normalized`] = normalizeString(data[key]);
    }

    return data;
}

function normalizeString(str: string, slug: boolean = false) {
    if (str === null || typeof str !== 'string') {
        return str;
    }

    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    str = sanitizeHtml(str, {
        allowedTags: [],
        allowedAttributes: {}
    });

    if (slug) {
        str = str.replace(/\s/g, '-');
    }

    return str;
}

async function getUserFromToken(token: string) {
    const decodedToken: any = jwt.decode(token);

    if (!decodedToken) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            email: decodedToken.email
        },
    });

    return user;
}

async function deleteMedia(entryMedia: Array<EntryMedia>) {

    const mediaIds: number[] = [];
    const relationsIds: number[] = [];

    entryMedia.forEach((media: EntryMedia) => {

        if (!media.media) {
            return;
        }

        const mediaPath = useMedia().mediaPath + '/' + media.media.name;
        
        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        mediaIds.push(media.mediaId);
        relationsIds.push(media.id);
    });

    const transaction = await prisma.$transaction([
        prisma.media.deleteMany({
            where: {
                id: {
                    in: mediaIds
                }
            }
        })
    ]);

    return transaction;

}

function getNormalizedFields() {
    return ['name', 'definition', 'notes', 'content'];
}
    
export { prepareRequestBodyForPrisma, replaceEmptyWithNull, normalizeString, getUserFromToken, deleteMedia};