
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


export async function exportAll() {

    const exportModels = ['category', 'entry'];
    const fieldsMap = new Map<string, Prisma.DMMF.Field[]>();
    let mediaFiles = new Map<string, string>();

    for (const prismaModel of Prisma.dmmf.datamodel.models) {
        const modelName = prismaModel.name.toLocaleLowerCase();
        if (exportModels.includes(modelName)) {
            fieldsMap.set(modelName, prismaModel.fields);
        }
    }
  
    for (const model of exportModels) {
        const pageSize = 200;
        let page = 1;
        const include = OBJECTS[model].includeRelations;

        const data = await readOneOrManyWithQuery(model, { pageSize, page, include });

        if (!data || data.totalCount === 0) {
            continue;
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

                if (model === 'entry') {
                    newItem.name = item.name;
                    newItem.slug = item.nameSlug;
                    newItem.description = item.description;
                    newItem.category = item.category?.name;
                    newItem.relatedEntries = item.relatedEntries?.map((entry) => entry.name);
                    newItem.references = item.references?.map((reference) => reference.name);
                    newItem.variations = item.variations?.map((variation) => variation.name);
                    newItem.translations = item.translations?.map((translation) => {
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
                }

                if (model === 'category') {
                    newItem.name = item.name;
                    newItem.slug = item.nameSlug;
                    newItem.definition = item.definition;
                    newItem.parent = item.parent?.name;
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

    }


    const zipPath = path.join(process.cwd(), 'server', 'temp', 'export.zip');
    const zip = new Zip();


    for (const [fileName, newFileName] of mediaFiles) {
        const absoluteFilePath = path.join(process.cwd(), 'public', 'media', fileName);
        zip.addLocalFile(absoluteFilePath, '', newFileName);        
    }

    for (const model of exportModels) {
        const filePath = path.join(process.cwd(), 'server', 'temp', `${model.toLowerCase()}.json`);
        zip.addLocalFile(filePath, 'media');
    }

    zip.writeZip(zipPath);

    return zipPath;
}


export async function importAll() {

    const filePath = path.join(process.cwd(), 'server', 'temp', 'export.zip');
    
    const zip = new Zip(filePath);
    zip.extractAllTo(path.join(process.cwd(), 'server', 'temp', 'import'), true);
    

    const categoriesFilePath = path.join(process.cwd(), 'server', 'temp', 'import', 'category.json');
    const categories = JSON.parse(fs.readFileSync(categoriesFilePath, 'utf-8'));
    const categoriesMap = new Map<string, number>();
    const categoriesParentMap = new Map<string, string>();


    await prisma.category.deleteMany({});

    for (const category of categories) {
        const newCategory = await createOneOrMany('category', {
            name: category.name,
            definition: category.definition
        });
        
        categoriesMap.set(category.name, newCategory.id);

        if (category.parent) {
            categoriesParentMap.set(category.name, category.parent);
        }
    }

    for (const [categoryName, parentName] of categoriesParentMap) {
        await prisma.category.update({
            where: {
                name: categoryName
            },
            data: {
                parent: {
                    connect: {
                        name: parentName
                    }
                }
            }
        });
    }


    const entriesFilePath = path.join(process.cwd(), 'server', 'temp', 'import', 'entry.json');
    const entries = JSON.parse(fs.readFileSync(entriesFilePath, 'utf-8'));
    const entriesMap = new Map<string, number>();
    const entriesRelatedEntriesMap = new Map<string, string[]>();
    const languagesMap = new Map<string, number>();

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
            nameSlug: entry.slug,
            definition: entry.description,
            categoryId: categoriesMap.get(entry.category),
            references: entry.references.map((reference) => {
                return {
                    name: reference
                }
            }),
            variations: entry.variations.map((variation) => {
                return {
                    name: variation
                }
            }),
            translations: entry.translations?.map((translation) => {
                return {
                    name: translation.name,
                    languageId: languagesMap.get(translation.language)
                }
            })
        });

        entriesMap.set(entry.nameSlug, newEntry.id);

        if (entry.relatedEntries && entry.relatedEntries.length > 0) {
           entriesRelatedEntriesMap.set(entry.name, entry.relatedEntries);
        }

    }


    for (const [entryName, relatedEntries] of entriesRelatedEntriesMap) {
        await prisma.entry.update({
            where: {
                name: entryName
            },
            data: {
                relatedEntries: {
                    connect: relatedEntries.map((relatedEntryName) => {
                        return {
                            name: relatedEntryName
                        }
                    })
                }
            }
        });
    }


    const mediaFilePath = path.join(process.cwd(), 'server', 'temp', 'import');
    const mediaFiles = fs.readdirSync(mediaFilePath);

    for (const mediaFile of mediaFiles) {

        if (mediaFile.endsWith('.json')) {
            continue;
        }

        const parts = mediaFile.split('_');

        const extension = parts[1].split('.')[1];
        const fileName = parts[0];
        const position = parts[1].split('.')[0];
        const newFileName = `${uuidv4()}.${extension}`;

        const entryId = entriesMap.get(fileName)!.toString();

        await saveMedia(entryId, newFileName, mediaFile, parseInt(position));

        const oldPath = path.join(process.cwd(), 'server', 'temp', 'import', mediaFile);
        const newPath = path.join(process.cwd(), 'public', 'media', newFileName);
        fs.renameSync(oldPath, newPath);
    }

    



    
    



}





