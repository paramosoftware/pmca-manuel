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
import { saveMedia } from './media';
import PrismaService from './PrismaService';

export const importData = (function () {
    // TODO: Convert to class
    // TODO: Memory optimization: reading the whole file at once is not optimal
    // TODO: Error handling
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
    const createdConcepts = new Map<string | number, number>();

    let importModel: string;
    const labelMap = new Map<string, string>();
    const camelCaseMap = new Map<string, string>();

    async function importFrom(
        model: string,
        filePath: string,
        mode: string = 'merge', 
    ) {

        const merge = mode === 'merge';
        const overwrite = mode === 'overwrite';

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
                await importFromJson(filePath, merge);
                break;
            case '.xml':
            case '.rdf':
                await importFromSkos(filePath, merge);
                break;
            case '.xlsx':
            case '.xls':
            case '.csv':
                await importFromXlsxOrCsv(filePath, merge);
                break;
        }

        await processRelations(createdConcepts, related, parent);

        if (overwrite) {
            const prismaService = new PrismaService(model, false);
            await prismaService.deleteMany({
                where: { createdAt: { lte: startDateTime } }
            });
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
        const resourceService = new PrismaService('Resource', false);

        const resourceConfig = await resourceService.readOne(importModel, {
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
                    camelCaseMap.set(
                        field.name,
                        useCamelCase().to(field.labelNormalized)
                    );
                }
            }
        }
    }

    async function importFromJson(filePath: string, update: boolean = true) {
        let items = [];

        try {
            items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
            return;
        }

        let position = 1;
        for (const item of items) {
            let oldId =
                item.id ??
                item[camelCaseMap.get('name') ?? 'name'] ??
                undefined;

            oldId = normalizeString(oldId, true);

            if (!oldId) {
                continue;
            }

            const concept = {} as any;
            concept.translations = [];
            concept.variations = [];
            concept.references = [];

            const keys = Object.keys(item);

            for (const key of keys) {
                switch (key) {
                    case camelCaseMap.get('name'):
                        concept.name = item[key];
                        break;

                    case camelCaseMap.get('definition'):
                        concept.definition = item[key];
                        break;

                    case camelCaseMap.get('notes'):
                        concept.notes = item[key];
                        break;

                    case camelCaseMap.get('parent'):
                        parent.set(oldId, item[key]);
                        break;

                    case camelCaseMap.get('relatedConcepts'):
                        related.set(oldId, item[key]);
                        break;

                    case camelCaseMap.get('translations'):
                        const translations = item[key];
                        for (const translation of translations) {
                            const translationAndLanguage =
                                await getTranslationAndLanguage(translation);

                            if (
                                translationAndLanguage.name &&
                                translationAndLanguage.languageId
                            ) {
                                concept.translations.push(
                                    translationAndLanguage
                                );
                            }
                        }
                        break;

                    case camelCaseMap.get('references'):
                        // @ts-ignore
                        concept.references = item[key]
                            .filter((reference: string) => reference != '')
                            .map((reference: string) => {
                                return {
                                    name: reference,
                                    nameRich: reference
                                };
                            });
                        break;

                    case camelCaseMap.get('variations'):
                        // @ts-ignore
                        concept.variations = item[key]
                            .filter((variation: string) => variation != '')
                            .map((variation: string) => {
                                return {
                                    name: variation
                                };
                            });
                        break;

                    case camelCaseMap.get('position'):
                        concept.position = item[key] ?? position;
                        break;
                }
            }

            position++;
            await upsertConcept(oldId, concept, update);
        }
    }

    async function importFromXlsxOrCsv(filePath: string, update: boolean = true) {
        const workbook = new ExcelJS.Workbook();

        if (path.extname(filePath) === '.csv') {
            await workbook.csv.readFile(filePath);
        } else {
            await workbook.xlsx.readFile(filePath);
        }

        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return createdConcepts;
        }

        const rows = worksheet.getRows(1, worksheet.rowCount);

        if (!rows) {
            return createdConcepts;
        }

        const headerRow = rows[0].values as string[];

        for (let i = 1; i < rows.length; i++) {
            let oldId = rows[i].getCell(
                headerRow.indexOf(labelMap.get('id') ?? 'id')
            ).value as string;

            if (!oldId) {
                oldId = rows[i].getCell(
                    headerRow.indexOf(labelMap.get('name') ?? 'name')
                ).value as string;
            }

            oldId = normalizeString(oldId, true);

            if (!oldId) {
                continue;
            }

            const concept = {} as any;

            concept.translations = [];
            concept.variations = [];
            concept.references = [];
            concept.position = i;

            for (const header of headerRow) {
                const headerIndex = headerRow.indexOf(header);

                if (!header || headerIndex === -1) {
                    continue;
                }

                const value = rows[i].getCell(headerIndex).value as string;

                if (!value) {
                    continue;
                }

                switch (header) {
                    case labelMap.get('name'):
                        concept.name = value;
                        break;
                    case labelMap.get('definition'):
                        concept.definition = value;
                        break;
                    case labelMap.get('notes'):
                        concept.notes = value;
                        break;
                    case labelMap.get('parent'):
                        parent.set(oldId, value);
                        break;
                    case labelMap.get('relatedConcepts'):
                        related.set(
                            oldId,
                            value
                                .split(';')
                                .filter(
                                    (relatedConcept) => relatedConcept != ''
                                )
                        );
                        break;
                    case labelMap.get('references'):
                        value.split(';').forEach((reference) => {
                            if (reference) {
                                concept.references.push({
                                    name: reference,
                                    nameRich: reference
                                });
                            }
                        });
                        break;
                    case labelMap.get('variations'):
                        value.split(';').forEach((variation) => {
                            if (variation) {
                                concept.variations.push({
                                    name: variation
                                });
                            }
                        });
                        break;
                    case labelMap.get('translations'):
                        const translations = value.split(';');
                        for (const translation of translations) {
                            const translationAndLanguage =
                                await getTranslationAndLanguage(translation);

                            if (
                                translationAndLanguage.name &&
                                translationAndLanguage.languageId
                            ) {
                                concept.translations.push(
                                    translationAndLanguage
                                );
                            }
                        }
                        break;

                    case labelMap.get('position'):
                        concept.position = parseNumber(value) ?? i;
                        break;
                }
            }

            await upsertConcept(oldId, concept, update);
        }
    }

    async function importFromSkos(filePath: string, update: boolean = true) {
        const xmlParser = new XMLParser(xmlOptions);
        const xml = fs.readFileSync(filePath, 'utf-8');
        const result = xmlParser.parse(xml);
        const data = result[0]['rdf:RDF'] ?? [];

        let position = 1;
        for (const item of data) {
            if (item['skos:Concept']) {
                let oldId = item[':@']?.['@_rdf:about'] ?? undefined;

                oldId = normalizeString(oldId, true);

                if (!oldId) {
                    continue;
                }

                const concept = {} as Concept;
                const conceptAttributes = item['skos:Concept'];

                concept.translations = [];
                concept.variations = [];
                concept.references = [];
                concept.name = '';
                concept.position = position;

                for (const attribute of conceptAttributes) {
                    if (attribute['skos:prefLabel']) {
                        const prefLabel = attribute['skos:prefLabel'][0];
                        const translation =
                            attribute[':@'] && attribute[':@']['@_xml:lang']
                                ? attribute[':@']['@_xml:lang']
                                : undefined;

                        if (translation) {
                            if (!languages.get(translation)) {
                                const languageId =
                                    await upsertLanguage(translation);
                                languages.set(translation, languageId);
                            }

                            if (concept.name === '') {
                                concept.name = prefLabel['#text'];
                            } else {
                                concept.translations.push({
                                    name: prefLabel['#text'],
                                    // @ts-ignore
                                    languageId: languages.get(translation)
                                });
                            }
                        } else {
                            concept.name = prefLabel['#text'];
                        }
                    }

                    if (attribute['skos:definition']) {
                        concept.definition =
                            attribute['skos:definition'][0]['#text'];
                    }

                    if (attribute['skos:scopeNote']) {
                        concept.notes = attribute['skos:scopeNote'][0]['#text'];
                    }

                    if (
                        attribute['skos:broader'] &&
                        attribute[':@']?.['@_rdf:resource']
                    ) {
                        parent.set(oldId, attribute[':@']['@_rdf:resource']);
                    }

                    if (
                        attribute['skos:related'] &&
                        attribute[':@']?.['@_rdf:resource']
                    ) {
                        const relatedConcepts = related.get(oldId) ?? [];
                        relatedConcepts.push(attribute[':@']['@_rdf:resource']);
                        related.set(oldId, relatedConcepts);
                    }

                    if (attribute['skos:referenceNote']) {
                        // @ts-ignore
                        concept.references.push({
                            name: attribute['skos:referenceNote'][0]['#text'],
                            nameRich: attribute['skos:referenceNote'][0]['#text']
                        });
                    }

                    if (attribute['skos:altLabel']) {
                        // @ts-ignore
                        concept.variations.push({
                            name: attribute['skos:altLabel'][0]['#text']
                        });
                    }
                }

                position++;
                await upsertConcept(oldId, concept, update);
            }
        }
    }


    async function upsertConcept(oldId: string, concept: any, update: boolean = true) {
        const conceptService = new PrismaService('Concept', false);

        let create = !update;

        if (update) {
            const foundConcepts = await conceptService.readMany({
                where: { name: concept.name }
            });

            if (foundConcepts && foundConcepts.items.length > 0) {
                const existingConcept = foundConcepts.items[0] as Concept;
                await conceptService.updateOne(existingConcept.id, concept);
                createdConcepts.set(oldId, existingConcept.id);
            } else {
                create = true;
            }
        }

        if (create) {
            const newConcept = await conceptService.createOne(concept);
            createdConcepts.set(oldId, newConcept.id);
        }
    }


    async function processRelations(
        createdConcepts: Map<string | number, number>,
        related: Map<string, string[]>,
        parent: Map<string, string>
    ) {
        for (const [oldId, relatedConcepts] of related) {
            // delete relations in other direction in related map to avoid duplicate relations
            for (let relatedConcept of relatedConcepts) {
                relatedConcept = normalizeString(relatedConcept, true);
                const relatedConceptRelations = (
                    related.get(relatedConcept) ?? []
                ).map((relatedConcept) => {
                    return normalizeString(relatedConcept, true);
                });
                const index = relatedConceptRelations.indexOf(oldId);
                if (index > -1) {
                    relatedConceptRelations.splice(index, 1);
                    related.set(relatedConcept, relatedConceptRelations);
                }
            }

            await prisma.concept.update({
                where: {
                    id: createdConcepts.get(oldId)
                },
                data: {
                    relatedConcepts: {
                        connect: relatedConcepts
                            .filter((relatedConcept) => {
                                return createdConcepts.get(
                                    normalizeString(relatedConcept, true)
                                );
                            })
                            .map((relatedConcept) => {
                                return {
                                    id: createdConcepts.get(
                                        normalizeString(relatedConcept, true)
                                    )
                                };
                            })
                    }
                }
            });
        }

        for (let [conceptId, parentResourceId] of parent) {
            parentResourceId = normalizeString(parentResourceId, true);

            if (
                !createdConcepts.get(conceptId) ||
                !createdConcepts.get(parentResourceId)
            ) {
                continue;
            }

            await prisma.concept.update({
                where: {
                    id: createdConcepts.get(conceptId)
                },
                data: {
                    parent: {
                        connect: {
                            id: createdConcepts.get(parentResourceId)
                        }
                    }
                }
            });
        }
    }

    async function upsertLanguage(languageName: any) {
        const where = {
            OR: [{ name: languageName }, { code: languageName }]
        };

        const langService = new PrismaService('Language', false);
        const foundLanguage = await langService.readMany({ where: where });

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

        const newLanguage = await langService.createOne({
            name: name,
            code: code
        });
        return newLanguage.id;
    }

    async function getTranslationAndLanguage(translation: string) {
        const translationAndLanguage = {
            name: undefined,
            languageId: undefined
        };

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

            const conceptId =
                createdConcepts.get(oldId) ?? createdConcepts.get('#' + oldId);

            if (conceptId) {
                await saveMedia(
                    conceptId,
                    newFileName,
                    mediaFile,
                    parseNumber(position)
                );
            }

            const oldPath = path.join(mediaPath, mediaFile);
            const newPath = path.join(getDataFolderPath('media'), newFileName);

            fs.renameSync(oldPath, newPath);
        }
    }

    return {
        importFrom
    };
})();
