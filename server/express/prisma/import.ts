import Zip from 'adm-zip';
import ExcelJS from 'exceljs';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import LANGUAGES from '~/config/languages';
import { prisma } from '~/server/prisma/prisma';
import deleteFolder from '~/utils/deleteFolder';
import getDataFolderPath from '~/utils/getDataFolderPath';
import parseNumber from '~/utils/parseNumber';
import normalizeString from '~/utils/normalizeString';
import { useCamelCase } from '~/utils/useCamelCase';
import { createOneOrMany } from './create';
import { deleteOneOrManyWithQuery } from './delete';
import { saveMedia } from './media';
import { readMany, readOne } from './read';



export const importData = function () {

    // TODO: Consider passing down these variables as parameters
    // TODO: Memory optimization: reading the whole file at once is not optimal
    // TODO: Error handling
    // TODO: Allow updating existing entries based on identifier
    // TODO: Log report (to client and server)
    // TODO: Progress bar
    // TODO: Transaction (rollback if something goes wrong)

    const xmlOptions = {
        ignoreAttributes: false,
        format: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
        suppressEmptyNode: true,
        ignorePiTags: true
    };

    const languages = new Map<string, number>();
    const parent = new Map<string, string>();
    const related = new Map<string, string[]>();
    const createdEntries = new Map<string | number, number>();

    let importModel: string;
    const labelMap = new Map<string, string>();
    const camelCaseMap = new Map<string, string>();

    
    async function importFrom(model: string, filePath: string, overwrite: boolean = true) {

        const startDateTime = new Date();
    
        if (!fs.existsSync(filePath)) {
            return;
        }

        importModel = model;

        await setResourceConfig();
    
        const importPath = path.join(getDataFolderPath('temp'), 'import');
        const zipPath = filePath;
    
        if (path.extname(filePath) === '.zip') {
            const zip = new Zip(filePath);
            zip.extractAllTo(importPath, true);
            const files = fs.readdirSync(importPath);
            filePath = path.join(importPath, files[0]);
        }
    
        switch (path.extname(filePath)) {
            case '.json':
                await importFromJson(filePath);
                break;
            case '.xml':
                await importFromSkos(filePath);
                break;
            case '.xlsx':
            case '.xls':
            case '.csv':
                await importFromXlsxOrCsv(filePath);
                break;
        }

        await processRelations(createdEntries, related, parent);

        if (overwrite) {
            await deleteOneOrManyWithQuery(model, { where: { createdAt: { lte: startDateTime } } });
        }

        const mediaPath = path.join(importPath, 'media');
    
        if (fs.existsSync(mediaPath)) {
            await importMediaFromZip(mediaPath);
            deleteFolder(importPath);
        }
    
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

    }

    async function setResourceConfig() {

        const resourceConfig = await readOne('AppResource', importModel, { 
            include: {
                fields: {
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });

        if (resourceConfig) {
            for (const field of resourceConfig.fields) {
                if (field.labelNormalized && field.includeExport) {
                    labelMap.set(field.name, field.labelNormalized);
                    camelCaseMap.set(field.name, useCamelCase().to(field.labelNormalized));
                }
            }
        }
    }
    
    async function importFromJson(filePath: string) {
    
        let items = [];

        try {
            items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
            return;
        }
    
        for (const item of items) {
    
            let oldId = item.id ?? item[camelCaseMap.get('name') ?? 'name'] ?? undefined;

            oldId = normalizeString(oldId, true);

            if (!oldId) { continue; }

            const entry = {} as any;

            entry.translations = [];
            entry.variations = [];
            entry.references = [];

            const keys = Object.keys(item);

            for (const key of keys) {

                switch (key) {

                    case camelCaseMap.get('name'):
                        entry.name = item[key];
                        break;

                    case camelCaseMap.get('definition'):
                        entry.definition = item[key];
                        break;

                    case camelCaseMap.get('notes'):
                        entry.notes = item[key];
                        break;

                    case camelCaseMap.get('parent'):
                        parent.set(oldId, item[key]);
                        break;

                    case camelCaseMap.get('relatedEntries'):
                        related.set(oldId, item[key]);
                        break;

                    case camelCaseMap.get('translations'):
                        const translations = item[key];
                        for (const translation of translations) {

                            const translationAndLanguage = await getTranslationAndLanguage(translation);

                            if (translationAndLanguage.name && translationAndLanguage.languageId) {
                                entry.translations.push(translationAndLanguage);
                            }

                        }
                        break;

                    case camelCaseMap.get('references'):
                        // @ts-ignore
                        entry.references = item[key].filter((reference) => reference != '').map((reference) => {
                            return {
                                name: reference
                            }
                        });
                        break;

                    case camelCaseMap.get('variations'):
                        // @ts-ignore
                        entry.variations = item[key].filter((variation) => variation != '').map((variation) => {
                            return {
                                name: variation
                            }
                        });
                        break;
                }

            }

            const newEntry = await createOneOrMany('entry', entry);
            createdEntries.set(oldId, newEntry.id);
        }
    }
    
    async function importFromXlsxOrCsv(filePath: string) {
    
        const workbook = new ExcelJS.Workbook();
    
        if (path.extname(filePath) === '.csv') {
            await workbook.csv.readFile(filePath);
        } else {
            await workbook.xlsx.readFile(filePath);
        }
    
        const worksheet = workbook.getWorksheet(1);
    
        if (!worksheet) { return createdEntries; }

        const rows = worksheet.getRows(1, worksheet.rowCount);
    
        if (!rows) { return createdEntries; }
    
        const headerRow = rows[0].values as string[];
    
        for (let i = 1; i < rows.length; i++) {
    
            let oldId = rows[i].getCell(headerRow.indexOf(labelMap.get('id') ?? 'id')).value as string;
    
            if (!oldId) {
                oldId = rows[i].getCell(headerRow.indexOf(labelMap.get('name') ?? 'name')).value as string;
            }

            oldId = normalizeString(oldId, true);
    
            if (!oldId) { continue; }
    
            const entry = {} as any;
    
            entry.translations = [];
            entry.variations = [];
            entry.references = [];
    
            for (const header of headerRow) {
                const headerIndex = headerRow.indexOf(header);
    
                if (!header || headerIndex === -1) { continue; }
    
                const value = rows[i].getCell(headerIndex).value as string;
    
                if (!value) { continue; }
    
                switch (header) {
                    case labelMap.get('name'):
                        entry.name = value;
                        break;
                    case labelMap.get('definition'):
                        entry.definition = value;
                        break;
                    case labelMap.get('notes'):
                        entry.notes = value;
                        break;
                    case labelMap.get('parent'):
                        parent.set(oldId, value);
                        break;
                    case labelMap.get('relatedEntries'):
                        related.set(oldId, value.split(';').filter((relatedEntry) => relatedEntry != ''));
                        break;
                    case labelMap.get('references'):
                        value.split(';').forEach((reference) => {
                            if (reference) {
                                entry.references.push({
                                    name: reference
                                });
                            }
                        });
                        break;
                    case labelMap.get('variations'):
                        value.split(';').forEach((variation) => {
                            if (variation) { 
                                entry.variations.push({
                                    name: variation
                                });
                            }
                        });
                        break;
                    case labelMap.get('translations'):
                        const translations = value.split(';');
                        for (const translation of translations) {

                            const translationAndLanguage = await getTranslationAndLanguage(translation);

                            if (translationAndLanguage.name && translationAndLanguage.languageId) {
                                entry.translations.push(translationAndLanguage);
                            }
                        }
                        break;
                }
            }
    
            const newEntry = await createOneOrMany('entry', entry);
            createdEntries.set(oldId, newEntry.id);
        }

    }

    async function importFromSkos(filePath: string) {
    
        const xmlParser = new XMLParser(xmlOptions);
        const xml = fs.readFileSync(filePath, 'utf-8');
        const result = xmlParser.parse(xml);
        const data = result[0]['rdf:RDF'] ?? [];
    
        for (const item of data) {
    
            if (item['skos:Concept']) {
    
                let oldId = item[':@']?.['@_rdf:about'] ?? undefined;

                oldId = normalizeString(oldId, true);
    
                if (!oldId) { continue; }
    
                const entry = {} as Entry;
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

                            if (entry.name === '') {
                                entry.name = prefLabel['#text'];
                            } else {
                                entry.translations.push({
                                    name: prefLabel['#text'],
                                    languageId: languages.get(translation)
                                });
                            }
    
                        } else {
                            entry.name = prefLabel['#text'];
                        }
                    }
    
                    if (attribute['skos:definition']) {
                        entry.definition = attribute['skos:definition'][0]['#text'];
                    }

                    if (attribute['skos:scopeNote']) {
                        entry.notes = attribute['skos:scopeNote'][0]['#text'];
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
                        // @ts-ignore
                        entry.references.push({  
                            name: attribute['skos:referenceNote'][0]['#text']
                        });
                    }
    
                    if (attribute['skos:altLabel']) {
                        // @ts-ignore
                        entry.variations.push({
                            name: attribute['skos:altLabel'][0]['#text']
                        });
                    }
                }
    
                const newEntry = await createOneOrMany('entry', entry);
                createdEntries.set(oldId, newEntry.id);
            }
        }
    }
    
    async function processRelations(createdEntries: Map<string | number, number>, related: Map<string, string[]>, parent: Map<string, string>) {
    
        for (const [oldId, relatedEntries] of related) {
       
            // delete relations in other direction in related map to avoid duplicate relations
            for (let relatedEntry of relatedEntries) {
                relatedEntry = normalizeString(relatedEntry, true);
                const relatedEntryRelations = (related.get(relatedEntry) ?? []).map((relatedEntry) => { return normalizeString(relatedEntry, true); });
                const index = relatedEntryRelations.indexOf(oldId);
                if (index > -1) {
                    relatedEntryRelations.splice(index, 1);
                    related.set(relatedEntry, relatedEntryRelations);
                }
            }

            await prisma.entry.update({
                where: {
                    id: createdEntries.get(oldId)
                },
                data: {
                    relatedEntries: {
                        connect: relatedEntries.filter((relatedEntry) => {
                            return createdEntries.get(normalizeString(relatedEntry, true));
                        }).map((relatedEntry) => {
                            return {
                                id: createdEntries.get(normalizeString(relatedEntry, true))
                            }
                        })
                    }
                }
            });

    
        }
    
    
        for (let [entryId, parentResourceId] of parent) {

            parentResourceId = normalizeString(parentResourceId, true);
    
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
    
        const foundLanguage = await readMany('language', { where: where });
    
        if (foundLanguage && foundLanguage.total > 0) {
            return foundLanguage.items[0].id;
        }

        let code = languageName;
        let name = languageName;

        for (const [NAME, CODE] of LANGUAGES) {
            if (NAME === languageName || CODE === languageName) {
                code = CODE;
                name = NAME;
                break;
            }
        }

        const newLanguage = await createOneOrMany('language', { name: name, code: code });
        return newLanguage.id;
    }

    async function getTranslationAndLanguage(translation: string) {

        const translationAndLanguage = {
            name: undefined,
            languageId: undefined
        }

        if (!translation) {
            return translationAndLanguage;
        }

        let languageName = '';

        if (translation.includes('(')) {
            languageName = translation.split('(')[1].replace(')', '');
        } else {
            // TODO: Log error
            return translationAndLanguage;
        }
       
        
        if (!languages.get(languageName)) {
            const languageId = await upsertLanguage(languageName);
            languages.set(languageName, languageId);
        }

        const translationName = translation.split('(')[0].trim();

        if (!translationName) {
            return translationAndLanguage;
        }

        return {
            name: translationName,
            languageId: languages.get(languageName)
        };
    }

    async function importMediaFromZip(mediaPath: string) {
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

            oldId = normalizeString(oldId, true);
    
            const entryId = createdEntries.get(oldId) ?? createdEntries.get('#' + oldId);

            if (entryId) {
                await saveMedia(entryId, newFileName, mediaFile, parseNumber(position));
            }
    
            const oldPath = path.join(mediaPath, mediaFile);
            const newPath = path.join(getDataFolderPath('media'), newFileName);
    
            fs.renameSync(oldPath, newPath);
        }
    }

    return {
        importFrom
    }

}();



