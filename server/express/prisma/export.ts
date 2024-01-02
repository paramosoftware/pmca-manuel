
import path from 'path';
import fs from 'fs';
import Zip from 'adm-zip';
import { readOneOrManyWithQuery } from './read';
import { OBJECTS } from '~/config';
import { prisma } from '~/server/prisma/prisma';
import { createOneOrMany } from './create';
import { saveMedia } from './media';
import { v4 as uuidv4 } from 'uuid';
import  deleteFolder from '~/utils/deleteFolder';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';


export async function exportAll() {

    const model = 'entry';
    let mediaFiles = new Map<string, string>();

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

export async function exportAllToSkos() {
    const model = 'entry';
 
    const pageSize = 200;
    let page = 1;
    const include = OBJECTS['verbete'].includeRelations;

    const data = await readOneOrManyWithQuery(model, { pageSize, page, include });

    if (!data || data.totalCount === 0) {
        return;
    }

    const resultPath = path.join(process.cwd(), 'server', 'temp', `result.xml`);

    const options = {
        ignoreAttributes: false,
        format: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
        suppressEmptyNode: true
    };

    const xmlBuilder = new XMLBuilder(options);

    fs.writeFileSync(resultPath, '');
    fs.appendFileSync(resultPath, '<?xml version="1.0" encoding="UTF-8"?>');
    fs.appendFileSync(resultPath, '\n');
    fs.appendFileSync(resultPath, '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:skos="http://www.w3.org/2004/02/skos/core#" xmlns:dc="http://purl.org/dc/elements/1.1/">');
    fs.appendFileSync(resultPath, '\n');

    const resourceURI = '#' // TODO: Change this to the correct URI
    const conceptSchemeId = 'A0'; // TODO: Create real concept scheme id

    const referenceNote = buildRdfProperty('referenceNote', 'Bibliographic reference to the concept', 'Reference', 'http://www.w3.org/2004/02/skos/core#editorialNote', resourceURI);
    const isCategory = buildRdfProperty('isCategory', 'Indicates if the concept is a category', 'Is category', 'http://www.w3.org/2004/02/skos/core#editorialNote', resourceURI);
    
    fs.appendFileSync(resultPath, xmlBuilder.build(referenceNote));
    fs.appendFileSync(resultPath, xmlBuilder.build(isCategory));

    const conceptScheme = await buildSkosConceptScheme(model, resourceURI, conceptSchemeId);

    fs.appendFileSync(resultPath, xmlBuilder.build(conceptScheme));

    for (let i = 0; i < data.totalPages; i++) {
        const data = await readOneOrManyWithQuery(model, { pageSize, page: i + 1, include });

        if (!data) {
            continue;
        }

        for (const item of data.data) {
            const concept = buildSkosConcept(item, resourceURI, conceptSchemeId);
            fs.appendFileSync(resultPath, xmlBuilder.build(concept));
        }
    }

    fs.appendFileSync(resultPath, '\n');
    fs.appendFileSync(resultPath, '</rdf:RDF>');
}

export async function importAllFromSkos() {

    const options = {
        ignoreAttributes: false,
        format: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
        suppressEmptyNode: true,
        ignorePiTags: true
    };

    const xmlParser = new XMLParser(options);

    const filePath = path.join(process.cwd(), 'server', 'temp', 'export.xml');
    const xml = fs.readFileSync(filePath, 'utf-8');
    const result = xmlParser.parse(xml);

    const data = result[0]['rdf:RDF'] ?? [];

    const createdEntries = new Map<string, number>();
    const languagesMap = new Map<string, number>();
    const parentEntriesMap = new Map<string, string>();
    const entriesRelatedEntriesMap = new Map<string, string[]>();

    await prisma.entry.deleteMany({});
    await prisma.language.deleteMany({});

    for (const item of data) {

        if (item['skos:Concept']) {

            const entry = {} as any;
            const entryAttributes = item['skos:Concept'];

            const id = item[':@']['@_rdf:about'] ?? undefined;

            if (!id) {
                continue;
            }

            entry.translations = [];
            entry.variations = [];
            entry.references = [];
            entry.name = '';

            for (const attribute of entryAttributes) {

                if (attribute['skos:prefLabel']) {

                    const prefLabel = attribute['skos:prefLabel'][0];
                    const translation = attribute[':@'] && attribute[':@']['@_xml:lang'] ? attribute[':@']['@_xml:lang'] : undefined;

                    if (translation) {
                        const languageId = languagesMap.get(translation);

                        if (!languageId) {

                            const newLanguage = await createOneOrMany('language', { name: translation });
                            languagesMap.set(translation, newLanguage.id);
                            
                            entry.translations.push({
                                languageId: newLanguage.id,
                                name: prefLabel['#text']
                            });
                        }

                        if (entry.name === '') {
                            entry.name = prefLabel['#text'];
                        }

                    } else {
                        entry.name = prefLabel['#text'];
                    }
                }

                if (attribute['skos:definition']) {
                    entry.definition = attribute['skos:definition'][0]['#text'];
                }

                if (attribute['skos:isCategory']) {
                    entry.isCategory = true;
                }

                if (attribute['skos:broader'] && attribute[':@']?.['@_rdf:resource']) {
                    parentEntriesMap.set(id, attribute[':@']['@_rdf:resource']);
                }

                if (attribute['skos:related'] && attribute[':@']?.['@_rdf:resource']) {
                    const relatedEntries = entriesRelatedEntriesMap.get(id) ?? [];
                    relatedEntries.push(attribute[':@']['@_rdf:resource']);
                    entriesRelatedEntriesMap.set(id, relatedEntries);
                }

                if (attribute['skos:referenceNote']) {
                    entry.references.push({
                        name: attribute['skos:referenceNote'][0]['#text']
                    });
                }

                if (attribute['skos:altLabel']) {
                    entry.variations.push({
                        name: attribute['skos:altLabel'][0]['#text']
                    });
                }
            }

            const newEntry = await createOneOrMany('entry', entry);
            createdEntries.set(id, newEntry.id);
        }
    }

    for (const [resourceId, relatedEntries] of entriesRelatedEntriesMap) {
        await prisma.entry.update({
            where: {
                id: createdEntries.get(resourceId)
            },
            data: {
                relatedEntries: {
                    connect: relatedEntries.filter((relatedEntry) => {
                        return createdEntries.get(relatedEntry);
                    }).map((relatedEntry) => {
                        return {
                            id: createdEntries.get(relatedEntry)
                        }
                    })
                }
            }
        });
    }


    for (const [resourceId, parentResourceId] of parentEntriesMap) {

        if (!createdEntries.get(resourceId) || !createdEntries.get(parentResourceId)) {
            continue;
        }

        await prisma.entry.update({
            where: {
                id: createdEntries.get(resourceId)
            },
            data: {
                parent: {
                    connect: {
                        id: createdEntries.get(parentResourceId)
                    }
                }
            }
        });
    }

}

function buildRdfProperty(name: string, comment: string, label: string, subPropertyOf: string, resourceURI: string) {
    return [{
        "rdf:Property": [
            {
                "rdfs:comment": [
                    {
                        "#text": comment
                    }
                ]
            },
            {
                "rdfs:subPropertyOf": "",
                ":@": {
                    "@_rdf:resource": subPropertyOf
                }
            },
            {
                "rdfs:label": [
                    {
                        "#text": label
                    }
                ]
            }
        ],
        ":@": {
            "@_rdf:about": resourceURI + name
        }
    }];
}

function buildSkosConcept(entry: any, resourceURI: string, conceptSchemeId: string) {

    const concept = {} as any;

    concept['skos:Concept'] = [];

    concept[':@'] = {
        "@_rdf:about": resourceURI + entry.id
    };


    concept['skos:Concept'].push({
        "skos:inScheme": [],
        ":@": {
            "@_rdf:resource": resourceURI + conceptSchemeId
        }
    });

    concept['skos:Concept'].push({
        "skos:prefLabel": [
            {
                "#text": entry.name
            }
        ]
    });

    if (entry.translations && entry.translations.length > 0) {
        for (const translation of entry.translations) {
            concept['skos:Concept'].push({
                "skos:prefLabel": [
                    {
                        "#text": translation.name
                    }
                ],
                ":@": {
                    "@_xml:lang": translation.language.code ? translation.language.code : translation.language.name
                }
            });
        }
    }


    if (entry.variations && entry.variations.length > 0) {
        for (const variation of entry.variations) {
            concept['skos:Concept'].push({
                "skos:altLabel": [
                    {
                        "#text": variation.name
                    }
                ]
            });
        }
    }


    if (entry.definition) {
        concept['skos:Concept'].push({
            "skos:definition": [
                {
                    "#text": entry.definition
                }
            ]
        });
    }

    if (entry.references && entry.references.length > 0) {
        for (const reference of entry.references) {
            concept['skos:Concept'].push({
                "skos:referenceNote": [
                    {
                        "#text": reference.name
                    }
                ]
            });
        }
    }

    if (entry.isCategory) {
        concept['skos:Concept'].push({
            "skos:isCategory": ""
        });

        if (!entry.parent) {
            concept['skos:Concept'].push({
                "skos:topConceptOf": "",
                ":@": {
                    "@_rdf:resource": resourceURI + conceptSchemeId,

                }
            });
        } 
    }


    if (entry.relatedEntries && entry.relatedEntries.length > 0) {
        for (const relatedEntry of entry.relatedEntries) {
            concept['skos:Concept'].push({
                "skos:related": "",
                ":@": {
                    "@_rdf:resource": resourceURI + relatedEntry.nameSlug
                }
            });
        }
    }


    if (entry.parent) {
        concept['skos:Concept'].push({
            "skos:broader": "",
            ":@": {
                "@_rdf:resource": resourceURI + entry.parent.nameSlug
            }
        });
    }



    if (entry.children && entry.children.length > 0) {
        for (const child of entry.children) {
            concept['skos:Concept'].push({
                "skos:narrower": "",
                ":@": {
                    "@_rdf:resource": resourceURI + child.nameSlug
                }
            });
        }
    }


    return [concept];
}


async function buildSkosConceptScheme(model: string, resourceURI: string, conceptSchemeId: string) {

    const conceptScheme = {
        "skos:ConceptScheme": [
            {
                "skos:prefLabel": [
                    {
                        "#text": process.env.APP_NAME
                    }
                ]
            },
            {
                "skos:definition": [
                    {
                        "#text": process.env.APP_DESCRIPTION
                    }
                ]
            }
        ],
        ":@": {
            "@_rdf:about": resourceURI + conceptSchemeId
        }
    } as any;


    const where = { isCategory: true, parentId: { isNull: true } };

    const topConcepts = await readOneOrManyWithQuery(model, { pageSize: -1, page: 1, where });

    if (topConcepts && topConcepts.data.length > 0) {
        for (const topConcept of topConcepts.data) {
            conceptScheme['skos:ConceptScheme'].push({
                "skos:hasTopConcept": "",
                ":@": {
                    "@_rdf:resource": resourceURI + topConcept.nameSlug
                }
            });
        }
    }

    return [conceptScheme];
}