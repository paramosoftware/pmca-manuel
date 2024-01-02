
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
import  parseNumber from '~/utils/parseNumber';
import  getTempPath  from '~/utils/getTempPath';
import  getMediaPath  from '~/utils/getMediaPath';



const resourceURI = '#' // TODO: Change this to the correct URI
const conceptSchemeId = 'A0'; // TODO: Create real concept scheme id
const xmlOptions = {
    ignoreAttributes: false,
    format: true,
    preserveOrder: true,
    allowBooleanAttributes: true,
    suppressEmptyNode: true,
    ignorePiTags: true
};

export async function exportAll(format: 'skos' | 'json', addMedia: boolean = false) {

    const ext = format === 'skos' ? 'xml' : 'json';

    const filePath = path.join(getTempPath(true), `export-${Date.now()}.${ext}`);
    const zipPath = path.join(getTempPath(true), `export-${Date.now()}.zip`);

    openFile(filePath, format);

    const mediaFiles = await processItems(filePath, format);

    closeFile(filePath, format);

    if (addMedia) {
        createZip(mediaFiles, filePath, zipPath);
        return zipPath;
    } else {
        return filePath;
    }
}

function openFile(filePath: string, format: 'skos' | 'json') {
    fs.writeFileSync(filePath, '');

    if (format === 'json') {
        fs.appendFileSync(filePath, '[');
    } else if (format === 'skos') {
        fs.appendFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>');
        fs.appendFileSync(filePath, '\n');
        fs.appendFileSync(filePath, '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:skos="http://www.w3.org/2004/02/skos/core#" xmlns:dc="http://purl.org/dc/elements/1.1/">');
        fs.appendFileSync(filePath, '\n');
    }
}

function closeFile(filePath :string, format: 'skos' | 'json') {
    if (format === 'json') {
        const fd = fs.openSync(filePath, 'r+');
        fs.ftruncateSync(fd, fs.statSync(filePath).size - 1);
        fs.closeSync(fd);
        fs.appendFileSync(filePath, ']');
    } else if (format === 'skos') {
        fs.appendFileSync(filePath, '\n');
        fs.appendFileSync(filePath, '</rdf:RDF>');
    }
}

async function processItems(filePath: string, format: 'skos' | 'json') {

    const include = OBJECTS['verbete'].includeRelations;
    const pageSize = 200;
    const model = 'entry';
    const xmlBuilder = new XMLBuilder(xmlOptions);

    const mediaFiles = new Map<string, string>();
    let totalPages = 1;

    if (format === 'skos') {
        addSkosProperties(filePath, xmlBuilder, resourceURI, conceptSchemeId, model);
    }

    for (let i = 0; i < totalPages; i++) {
        const data = await readOneOrManyWithQuery(model, { pageSize, page: i + 1, include });

        if (!data) {
            continue;
        }

        totalPages = data.totalPages;

        for (const item of data.data) {

            if (format === 'json') {
                const json = buildJsonExport(item);
                fs.appendFileSync(filePath, json);
                fs.appendFileSync(filePath, ',');
            } else if (format === 'skos') {
                const concept = buildSkosConcept(item, resourceURI, conceptSchemeId);
                fs.appendFileSync(filePath, xmlBuilder.build(concept));
            }

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
    }

    return mediaFiles;
}

async function addSkosProperties(filePath: string, xmlBuilder: XMLBuilder, resourceURI: string, conceptSchemeId: string, model: string) {

    const referenceNote = buildRdfProperty('referenceNote', 'Bibliographic reference to the concept', 'Reference', 'http://www.w3.org/2004/02/skos/core#editorialNote', resourceURI);
    const isCategory = buildRdfProperty('isCategory', 'Indicates if the concept is a category', 'Is category', 'http://www.w3.org/2004/02/skos/core#editorialNote', resourceURI);
    
    fs.appendFileSync(filePath, xmlBuilder.build(referenceNote));
    fs.appendFileSync(filePath, xmlBuilder.build(isCategory));

    const conceptScheme = await buildSkosConceptScheme(model, resourceURI, conceptSchemeId);

    fs.appendFileSync(filePath, xmlBuilder.build(conceptScheme));
}

function createZip(mediaFiles: Map<string, string>, filePath: string, zipPath: string) {
    const zip = new Zip();

    for (const [fileName, newFileName] of mediaFiles) {
        const absoluteFilePath = path.join(getMediaPath(true), fileName);
        if (fs.existsSync(absoluteFilePath)) {
            zip.addLocalFile(absoluteFilePath, 'media', newFileName);
        }
    }

    if (fs.existsSync(filePath)) {
        zip.addLocalFile(filePath);
    }

    zip.writeZip(zipPath);
    fs.unlinkSync(filePath);
}

export async function importAll(filePath: string, overwrite: boolean = false) {

    if (!fs.existsSync(filePath)) {
        return;
    }

    let createdEntries: Map<string | number, number> = new Map<string | number, number>();

    const importPath = path.join(getTempPath(true), 'import');

    if (filePath.endsWith('.zip')) {
        const zip = new Zip(filePath);
        zip.extractAllTo(importPath, true);
        const files = fs.readdirSync(importPath);
        filePath = path.join(importPath, files[0]);
    }

    if (overwrite) {
        await prisma.entry.deleteMany({});
    }
       
    if (filePath.endsWith('.json')) {
        createdEntries = await importAllFromJson(filePath);
    } else if (filePath.endsWith('.xml')) {
        createdEntries = await importAllFromSkos(filePath);
    }

    const mediaPath = path.join(importPath, 'media');

    if (fs.existsSync(mediaPath)) {
        await importMediaFromZip(mediaPath, createdEntries);
        deleteFolder(importPath);
    }

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

async function importAllFromJson(filePath: string) {

    const entries = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const createdEntries = new Map<string | number, number>();
    const languages = new Map<string, number>();
    const parent = new Map<string, string>();
    const related = new Map<string, string[]>();

    await prisma.entry.deleteMany({});
    await prisma.language.deleteMany({});

    for (const entry of entries) {

        const oldId = entry.id ?? entry.name;

        if (entry.translations) {
            for (const translation of entry.translations) {
                const languageName = translation.language ?? undefined;
               
                if (!languages.get(languageName)) {
                    const languageId = await upsertLanguage(languageName);
                    languages.set(languageName, languageId);
                }
            }
        }

        if (entry.relatedEntries && entry.relatedEntries.length > 0) {
            related.set(oldId, Array.isArray(entry.relatedEntries) ? entry.relatedEntries : [entry.relatedEntries]);
         }
 
         if (entry.parent) {
            parent.set(oldId, entry.parent);
         }

        const newEntry = await createOneOrMany('entry', {
            name: entry.name,
            definition: entry.definition ?? undefined,
            isCategory: entry.isCategory ?? false,
            references: entry.references?.map((reference: Reference) => {
                return {
                    name: reference
                }
            }),
            variations: entry.variations?.map((variation: Variation) => {
                return {
                    name: variation
                }
            }),
            translations: entry.translations?.map((translation: { name: string; language: string; }) => {
                return {
                    name: translation.name,
                    languageId: languages.get(translation.language)
                }
            })
        });

        createdEntries.set(oldId, newEntry.id);
    }

    await processRelations(createdEntries, related, parent);   

    return createdEntries;
}

async function importMediaFromZip(mediaPath: string, createdEntries: Map<string | number, number>) {
    const mediaFiles = fs.readdirSync(mediaPath);

    for (const mediaFile of mediaFiles) {
        const parts = mediaFile.split('_');

        let ext;
        let oldId;
        let position;

        if (parts.length === 1) {
            ext = parts[0].split('.')[1];
            oldId = parts[0].split('.')[0];
            position = 1;
        } else if (parts.length === 2) {
            ext = parts[1].split('.')[1];
            oldId = parts[0];
            position = parts[1].split('.')[0];
        } else {
            continue;
        }

        const newFileName = `${uuidv4()}.${ext}`;

        const entry = await prisma.entry.findFirst({
            where: {
                id: createdEntries.get(oldId)
            }
        });

        if (!entry) { continue; }

        await saveMedia(entry.id, newFileName, mediaFile, parseNumber(position));

        const oldPath = path.join(mediaPath, mediaFile);
        const newPath = path.join(getMediaPath(true), newFileName);

        fs.renameSync(oldPath, newPath);
    }
}

export async function importAllFromSkos(filePath: string) {

    const xmlParser = new XMLParser(xmlOptions);
    const xml = fs.readFileSync(filePath, 'utf-8');
    const result = xmlParser.parse(xml);
    const data = result[0]['rdf:RDF'] ?? [];

    const languages = new Map<string, number>();
    const parent = new Map<string, string>();
    const related = new Map<string, string[]>();
    const createdEntries = new Map<string | number, number>();

    for (const item of data) {

        if (item['skos:Concept']) {

            const oldId = item[':@']?.['@_rdf:about'] ?? undefined;

            if (!oldId) { continue; }

            const entry = {} as any;
            const entryAttributes = item['skos:Concept'];

            entry.translations = [];
            entry.variations = [];
            entry.references = [];
            entry.name = '';

            for (const attribute of entryAttributes) {

                if (attribute['skos:prefLabel']) {

                    const prefLabel = attribute['skos:prefLabel'][0];
                    const translation = attribute[':@'] && attribute[':@']['@_xml:lang'] ? attribute[':@']['@_xml:lang'] : undefined;

                    if (translation) {

                        if (!languages.get(translation)) {
                            const languageId = await upsertLanguage(translation);
                            languages.set(translation, languageId);
                        }

                        entry.translations.push({
                            name: prefLabel['#text'],
                            languageId: languages.get(translation)
                        });

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
                    parent.set(oldId, attribute[':@']['@_rdf:resource']);
                }

                if (attribute['skos:related'] && attribute[':@']?.['@_rdf:resource']) {
                    const relatedEntries = related.get(oldId) ?? [];
                    relatedEntries.push(attribute[':@']['@_rdf:resource']);
                    related.set(oldId, relatedEntries);
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
            createdEntries.set(oldId, newEntry.id);
        }
    }

    await processRelations(createdEntries, related, parent);

    return createdEntries;
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
        "@_rdf:about": resourceURI + entry.nameSlug
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

function buildJsonExport(item: any) {
    const newItem = {} as any;

    newItem.id = item.nameSlug;
    newItem.name = item.name;
    newItem.definition = item.definition;
    newItem.parent = item.parent?.nameSlug;
    newItem.isCategory = item.isCategory;

    if (item.relatedEntries && item.relatedEntries.length > 0) {
        newItem.relatedEntries = item.relatedEntries.map((entry: Entry) => {
            return entry.nameSlug
        });
    }

    if (item.references && item.references.length > 0) {
        newItem.references = item.references.map((reference: Reference) => {
            return reference.name
        });
    }

    if (item.variations && item.variations.length > 0) {
        newItem.variations = item.variations.map((variation: Variation) => {
            return variation.name
        });
    }

    if (item.translations && item.translations.length > 0) {
        newItem.translations = item.translations.map((translation: Translation) => {
            return {
                language: translation.language?.name,
                name: translation.name
            }
        });
    }

    return JSON.stringify(newItem, null, 2);

}

async function processRelations(createdEntries: Map<string | number, number>, related: Map<string, string[]>, parent: Map<string, string>) {

    for (const [oldId, relatedEntries] of related) {
        await prisma.entry.update({
            where: {
                id: createdEntries.get(oldId)
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


    for (const [entryId, parentResourceId] of parent) {

        if (!createdEntries.get(entryId) || !createdEntries.get(parentResourceId)) {
            continue;
        }

        await prisma.entry.update({
            where: {
                id: createdEntries.get(entryId)
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

async function upsertLanguage(languageName: any) {

    const where = {
        or: [
            { name: languageName },
            { code: languageName }
        ]
    }
    
    const foundLanguage = await readOneOrManyWithQuery('language', { where: where });

    if (foundLanguage && foundLanguage.totalCount > 0) {
        return foundLanguage.data[0].id;
    }

    const newLanguage = await createOneOrMany('language', { name: languageName });

    return newLanguage.id;
}

