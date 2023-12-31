
import path from 'path';
import fs from 'fs';
import { Prisma } from '@prisma/client';
import Zip from 'adm-zip';
import { readOneOrManyWithQuery } from './read';
import { OBJECTS } from '~/config';
import { prisma } from '~/server/prisma/prisma';
import { createOneOrMany } from './create';
import { saveMedia } from './media';
import { v4 as uuidv4 } from 'uuid';
import  deleteFolder from '~/utils/deleteFolder';


export async function exportAll() {

    const model = 'entry';
    const fieldsMap = new Map<string, Prisma.DMMF.Field[]>();
    let mediaFiles = new Map<string, string>();

    for (const prismaModel of Prisma.dmmf.datamodel.models) {
        const modelName = prismaModel.name.toLocaleLowerCase();
        if (model === modelName) {
            fieldsMap.set(modelName, prismaModel.fields);
        }
    }

    const pageSize = 200;
    let page = 1;
    const include = OBJECTS['verbete'].includeRelations;

    const data = await readOneOrManyWithQuery(model, { pageSize, page, include });

    if (!data || data.totalCount === 0) {
        return;
    }

    const filePath = path.join(process.cwd(), 'server', 'temp', `${model.toLowerCase()}.json`);
    fs.writeFileSync(filePath, '[');

    for (let i = 0; i < data.totalPages; i++) {
        const data = await readOneOrManyWithQuery(model, { pageSize, page: i + 1, include });

        if (!data) {
            continue;
        }

        for (const item of data.data) {
            const newItem = {} as any;

            newItem.name = item.name;
            newItem.nameSlug = item.nameSlug;
            newItem.definition = item.definition;
            newItem.parent = item.parent?.nameSlug;
            newItem.isCategory = item.isCategory;
            newItem.relatedEntries = item.relatedEntries?.map((entry: Entry) => entry.nameSlug);
            newItem.references = item.references?.map((reference: Reference) => reference.name);
            newItem.variations = item.variations?.map((variation : Variation) => variation.name);
            newItem.translations = item.translations?.map((translation: Translation) => {
                return {
                    language: translation.language?.name,
                    name: translation.name
                }
            });

            if (item.media) {
                for (const media of item.media) {
                    const fileName = media.media?.name;
                    const extension = fileName.split('.').pop();
                    const position = media.position ? media.position : 1;
                    const newFileName = `${item.nameSlug}_${position}.${extension}`;
                    mediaFiles.set(fileName, newFileName);
                }
            }

            const json = JSON.stringify(newItem, null, 2);
            fs.appendFileSync(filePath, json);
            fs.appendFileSync(filePath, ',');
            fs.appendFileSync(filePath, '\n');
        }
    }

    const fd = fs.openSync(filePath, 'r+');
    fs.ftruncateSync(fd, fs.statSync(filePath).size - 2);
    fs.closeSync(fd);
    fs.appendFileSync(filePath, ']');

    const zipPath = path.join(process.cwd(), 'server', 'temp', `export.zip`);
    const zip = new Zip();

    for (const [fileName, newFileName] of mediaFiles) {
        const absoluteFilePath = path.join(process.cwd(), 'public', 'media', fileName);
        if (fs.existsSync(absoluteFilePath)) {
            zip.addLocalFile(absoluteFilePath, 'media', newFileName);
        }
    }

    zip.addLocalFile(filePath);
    zip.writeZip(zipPath);
    fs.unlinkSync(filePath);

    return zipPath;
}


export async function importAll() {

    const exportModel = 'entry';
    const filePath = path.join(process.cwd(), 'server', 'temp', 'export.zip');
    
    const zip = new Zip(filePath);
    zip.extractAllTo(path.join(process.cwd(), 'server', 'temp', 'import'), true);

    const exportFilePath = path.join(process.cwd(), 'server', 'temp', 'import', exportModel + '.json');
    const entries = JSON.parse(fs.readFileSync(exportFilePath, 'utf-8'));
    const languagesMap = new Map<string, number>();
    const parentEntriesMap = new Map<string, string>();
    const entriesRelatedEntriesMap = new Map<string, string[]>();

    await prisma.entry.deleteMany({});
    await prisma.language.deleteMany({});

    for (const entry of entries) {

        if (entry.translations) {
            for (const translation of entry.translations) {
                const languageName = translation.language;
                const languageId = languagesMap.get(languageName);

                if (!languageId) {
                    const newLanguage = await createOneOrMany('language', {
                        name: languageName
                    });
                    languagesMap.set(languageName, newLanguage.id);
                }
            }
        }

        const newEntry = await createOneOrMany('entry', {
            name: entry.name,
            nameSlug: entry.nameSlug,
            definition: entry.definition,
            isCategory: entry.isCategory,
            references: entry.references.map((reference: Reference) => {
                return {
                    name: reference
                }
            }),
            variations: entry.variations.map((variation: Variation) => {
                return {
                    name: variation
                }
            }),
            translations: entry.translations?.map((translation: { name: string; language: string; }) => {
                return {
                    name: translation.name,
                    languageId: languagesMap.get(translation.language)
                }
            })
        });

        if (entry.relatedEntries && entry.relatedEntries.length > 0) {
           entriesRelatedEntriesMap.set(newEntry.nameSlug, entry.relatedEntries);
        }

        if (entry.parent) {
            parentEntriesMap.set(newEntry.nameSlug, entry.parent);
        }
    }


    for (const [entryName, relatedEntries] of entriesRelatedEntriesMap) {
        await prisma.entry.update({
            where: {
                nameSlug: entryName
            },
            data: {
                relatedEntries: {
                    connect: relatedEntries.map((relatedEntryName) => {
                        return {
                            nameSlug: relatedEntryName
                        }
                    })
                }
            }
        });
    }

    for (const [entryName, parentName] of parentEntriesMap) {
        await prisma.entry.update({
            where: {
                nameSlug: entryName
            },
            data: {
                parent: {
                    connect: {
                        nameSlug: parentName
                    }
                }
            }
        });
    }

    const mediaFilePath = path.join(process.cwd(), 'server', 'temp', 'import', 'media');
    const mediaFiles = fs.readdirSync(mediaFilePath);

    for (const mediaFile of mediaFiles) {
        const parts = mediaFile.split('_');

        const extension = parts[1].split('.')[1];
        const fileName = parts[0];
        const position = parts[1].split('.')[0];
        const newFileName = `${uuidv4()}.${extension}`;

        const entry = await prisma.entry.findFirst({
            where: {
                nameSlug: fileName
            }
        });

        if (!entry) {
            continue;
        }

        await saveMedia(entry.id, newFileName, mediaFile, parseInt(position));

        const oldPath = path.join(process.cwd(), 'server', 'temp', 'import', 'media', mediaFile);
        const newPath = path.join(process.cwd(), 'public', 'media', newFileName);
        fs.renameSync(oldPath, newPath);
    }

    const tempPath = path.join(process.cwd(), 'server', 'temp', 'import');
    deleteFolder(tempPath);
    fs.unlinkSync(filePath);
}





