import PrismaService from './PrismaService';
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
import logger from '~/utils/logger';
import { useCamelCase } from '~/utils/useCamelCase';
import { saveMedia } from './media';

// TODO: Memory optimization: reading the whole file at once is not optimal [PMCA-398]
// TODO: Error handling [PMCA-369]
// TODO: Log report (to client and server) [PMCA-396]
// TODO: Transaction (rollback if something goes wrong) [PMCA-397]
class PrismaServiceImporter {
    private model: string;
    private prismaService: PrismaService;
    private processId: string = '';
    private xmlOptions = {
        ignoreAttributes: false,
        format: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
        suppressEmptyNode: true,
        ignorePiTags: true
    };
    private languages = new Map<string, number>();
    private parent = new Map<string, string>();
    private related = new Map<string, string[]>();
    private createdConcepts = new Map<string | number, number>();
    private labelMap = new Map<string, string>();
    private camelCaseMap = new Map<string, string>();
    private totalItems = 0;
    private processedItems = 0;
    private skippedItems = 0;
    private currentProgress = 0;
    private startTime = performance.now();
    private endTime = performance.now();
    private errors = [] as string[];
    private warnings = [] as string[];

    /**
     * Prisma Importer Service
     * @param prismaService PrismaService instance
     */
    constructor(prismaService: PrismaService) {
        this.prismaService = prismaService;
        this.model = prismaService.getModel();
    }

    importFrom(filePath: string, mode: string = 'merge') {
        this.processId = uuidv4();
        this.prismaService.setProgress(this.processId, 0, 'Started');
        this._importFrom(filePath, mode);
        return this.processId;
    }

    private async _importFrom(filePath: string, mode: string = 'merge') {

        try {
            this.startTime = performance.now();
            await this.setResourceConfig();
            const merge = mode === 'merge';
            const overwrite = mode === 'overwrite';

            const startDateTime = new Date();

            if (!fs.existsSync(filePath)) {
                return;
            }

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
                    await this.importFromJson(filePath, merge);
                    break;
                case '.xlsx':
                case '.xls':
                case '.csv':
                    await this.importFromXlsxOrCsv(filePath, merge);
                    break;
                case '.xml':
                case '.rdf':
                    if (this.model === 'Concept') {
                        await this.importFromSkos(filePath, merge);
                        break;
                    } else {
                        this.prismaService.setProgress(
                            this.processId,
                            0,
                            'Importing SKOS is only supported for Concept model.',
                            true,
                            true
                        );
                        return;
                    }
                default:
                    this.prismaService.setProgress(
                        this.processId,
                        0,
                        'Unsupported file format.',
                        true,
                        true
                    );
                    return;
            }

            await this.processRelations(
                this.createdConcepts,
                this.related,
                this.parent
            );

            if (overwrite) {
                await this.prismaService.deleteMany({
                    where: { createdAt: { lte: startDateTime } }
                });
            }

            const mediaPath = path.join(importPath, 'media');

            if (fs.existsSync(mediaPath)) {
                await this.importMediaFromZip(mediaPath);
                deleteFolder(importPath);
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }

            this.prismaService.setProgress(this.processId, 100, 'Finished');
            this.endTime = performance.now();
            this.setImportReport();
        } catch (error) {
            this.prismaService.setProgress(
                this.processId,
                this.currentProgress,
                'Um erro ocorreu durante a importação. Verifique o relatório para mais detalhes.',
                true,
                true
            );

            logger.error(error);
            this.endTime = performance.now();
            // @ts-ignore
            this.errors.push(error.message ?? JSON.stringify(error));
            this.setImportReport();
        }
    }

    async setResourceConfig() {
        const resourceService = new PrismaService('Resource', false);

        const resourceConfig = await resourceService.readOne(this.model, {
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
                    this.labelMap.set(field.name, field.labelNormalized);
                    this.camelCaseMap.set(
                        field.name,
                        useCamelCase().to(field.labelNormalized)
                    );
                }
            }
        }
    }

    async importFromJson(filePath: string, update: boolean = true) {
        let items = [];

        try {
            items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
            return;
        }

        let position = 1;
        this.totalItems = items.length;
        for (const item of items) {
            let oldId =
                item.id ??
                item[this.camelCaseMap.get('name') ?? 'name'] ??
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
                    case this.camelCaseMap.get('name'):
                        concept.name = item[key];
                        break;

                    case this.camelCaseMap.get('definition'):
                        concept.definition = item[key];
                        break;

                    case this.camelCaseMap.get('notes'):
                        concept.notes = item[key];
                        break;

                    case this.camelCaseMap.get('parent'):
                        this.parent.set(oldId, item[key]);
                        break;

                    case this.camelCaseMap.get('relatedConcepts'):
                        this.related.set(oldId, item[key]);
                        break;

                    case this.camelCaseMap.get('translations'):
                        const translations = item[key];
                        for (const translation of translations) {
                            const translationAndLanguage =
                                await this.getTranslationAndLanguage(
                                    translation
                                );

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

                    case this.camelCaseMap.get('references'):
                        // @ts-ignore
                        concept.references = item[key]
                            .filter((reference: string) => reference != '')
                            .map((reference: string) => {
                                return {
                                    name: reference,
                                    nameRich: '<p>' + reference + '</p>'
                                };
                            });
                        break;

                    case this.camelCaseMap.get('variations'):
                        // @ts-ignore
                        concept.variations = item[key]
                            .filter((variation: string) => variation != '')
                            .map((variation: string) => {
                                return {
                                    name: variation
                                };
                            });
                        break;

                    case this.camelCaseMap.get('position'):
                        concept.position = item[key] ?? position;
                        break;
                }
            }

            this.processedItems++;
            position++;
            await this.upsertConcept(oldId, concept, update);
        }
    }

    async importFromXlsxOrCsv(filePath: string, update: boolean = true) {
        const workbook = new ExcelJS.Workbook();

        if (path.extname(filePath) === '.csv') {
            await workbook.csv.readFile(filePath);
        } else {
            await workbook.xlsx.readFile(filePath);
        }

        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return this.createdConcepts;
        }

        const rows = worksheet.getRows(1, worksheet.rowCount);

        if (!rows) {
            return this.createdConcepts;
        }

        const headerRow = rows[0].values as string[];

        this.totalItems = rows.length;
        for (let i = 1; i < rows.length; i++) {
            let oldId = rows[i].getCell(
                headerRow.indexOf(this.labelMap.get('id') ?? 'id')
            ).value as string;

            if (!oldId) {
                oldId = rows[i].getCell(
                    headerRow.indexOf(this.labelMap.get('name') ?? 'name')
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
                    case this.labelMap.get('name'):
                        concept.name = value;
                        break;
                    case this.labelMap.get('definition'):
                        concept.definition = value;
                        break;
                    case this.labelMap.get('notes'):
                        concept.notes = value;
                        break;
                    case this.labelMap.get('parent'):
                        this.parent.set(oldId, value);
                        break;
                    case this.labelMap.get('relatedConcepts'):
                        this.related.set(
                            oldId,
                            value
                                .split(';')
                                .filter(
                                    (relatedConcept) => relatedConcept != ''
                                )
                        );
                        break;
                    case this.labelMap.get('references'):
                        value.split(';').forEach((reference) => {
                            if (reference) {
                                concept.references.push({
                                    name: reference,
                                    nameRich: '<p>' + reference + '</p>'
                                });
                            }
                        });
                        break;
                    case this.labelMap.get('variations'):
                        value.split(';').forEach((variation) => {
                            if (variation) {
                                concept.variations.push({
                                    name: variation
                                });
                            }
                        });
                        break;
                    case this.labelMap.get('translations'):
                        const translations = value.split(';');
                        for (const translation of translations) {
                            const translationAndLanguage =
                                await this.getTranslationAndLanguage(
                                    translation
                                );

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

                    case this.labelMap.get('position'):
                        concept.position = parseNumber(value) ?? i;
                        break;
                }
            }

            this.processedItems++;
            await this.upsertConcept(oldId, concept, update);
        }

        this.prismaService.setProgress(this.processId, 100, 'Finished');
    }

    async importFromSkos(filePath: string, update: boolean = true) {
        const xmlParser = new XMLParser(this.xmlOptions);
        const xml = fs.readFileSync(filePath, 'utf-8');
        const result = xmlParser.parse(xml);
        const data = result[0]['rdf:RDF'] ?? [];

        this.totalItems = data.length;
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
                            if (!this.languages.get(translation)) {
                                const languageId =
                                    await this.upsertLanguage(translation);
                                this.languages.set(translation, languageId);
                            }

                            if (concept.name === '') {
                                concept.name = prefLabel['#text'];
                            } else {
                                concept.translations.push({
                                    name: prefLabel['#text'],
                                    // @ts-ignore
                                    languageId: this.languages.get(translation)
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
                        this.parent.set(
                            oldId,
                            attribute[':@']['@_rdf:resource']
                        );
                    }

                    if (
                        attribute['skos:related'] &&
                        attribute[':@']?.['@_rdf:resource']
                    ) {
                        const relatedConcepts = this.related.get(oldId) ?? [];
                        relatedConcepts.push(attribute[':@']['@_rdf:resource']);
                        this.related.set(oldId, relatedConcepts);
                    }

                    if (attribute['skos:referenceNote']) {
                        // @ts-ignore
                        concept.references.push({
                            name: attribute['skos:referenceNote'][0]['#text'],
                            nameRich:
                                '<p>' +
                                attribute['skos:referenceNote'][0]['#text'] +
                                '</p>'
                        });
                    }

                    if (attribute['skos:altLabel']) {
                        // @ts-ignore
                        concept.variations.push({
                            name: attribute['skos:altLabel'][0]['#text']
                        });
                    }
                }

                this.processedItems++;
                position++;
                await this.upsertConcept(oldId, concept, update);
            }
        }
    }

    async upsertConcept(oldId: string, concept: any, update: boolean = true) {
        let create = !update;

        this.updateProgress(
            this.totalItems,
            this.processedItems,
            concept.name ?? ''
        );

        if (update) {
            const foundConcepts = await this.prismaService.readMany({
                where: { name: concept.name }
            });

            if (foundConcepts && foundConcepts.items.length > 0) {
                const existingConcept = foundConcepts.items[0] as Concept;
                await this.prismaService.updateOne(existingConcept.id, concept);
                this.createdConcepts.set(oldId, existingConcept.id);
            } else {
                create = true;
            }
        }

        if (create) {
            const newConcept = await this.prismaService.createOne(concept);
            this.createdConcepts.set(oldId, newConcept.id);
        }
    }

    async processRelations(
        createdConcepts: Map<string | number, number>,
        related: Map<string, string[]>,
        parent: Map<string, string>
    ) {
        this.prismaService.setProgress(
            this.processId,
            this.currentProgress + 5,
            'Processing relations'
        );

        for (const [oldId, relatedConcepts] of related) {
            // delete relations in other direction in related map to avoid duplicate relations
            for (let relatedConcept of relatedConcepts) {
                relatedConcept = normalizeString(relatedConcept, true);
                const relatedConceptRelations = (
                    this.related.get(relatedConcept) ?? []
                ).map((relatedConcept) => {
                    return normalizeString(relatedConcept, true);
                });
                const index = relatedConceptRelations.indexOf(oldId);
                if (index > -1) {
                    relatedConceptRelations.splice(index, 1);
                    this.related.set(relatedConcept, relatedConceptRelations);
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

        this.prismaService.setProgress(
            this.processId,
            this.currentProgress,
            'All relations processed'
        );
    }

    async upsertLanguage(languageName: any) {
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

    async getTranslationAndLanguage(translation: string) {
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
            // TODO: Log error [PMCA-369]
            return translationAndLanguage;
        }

        if (!this.languages.get(languageName)) {
            const languageId = await this.upsertLanguage(languageName);
            this.languages.set(languageName, languageId);
        }

        const translationName = translation.split('(')[0].trim();

        if (!translationName) {
            return translationAndLanguage;
        }

        return {
            name: translationName,
            languageId: this.languages.get(languageName)
        };
    }

    async importMediaFromZip(mediaPath: string) {
        this.prismaService.setProgress(
            this.processId,
            this.currentProgress + 2,
            'Importing media'
        );

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
                this.createdConcepts.get(oldId) ??
                this.createdConcepts.get('#' + oldId);

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

    private updateProgress(total: number, current: number, itemLabel: string) {
        const progress = Math.round((current / total) * 90);
        this.currentProgress = progress;
        this.prismaService.setProgress(
            this.processId,
            progress,
            'Processing: ' + itemLabel
        );
    }


    private setImportReport() {
        const duration = this.endTime - this.startTime;
        const durationHours = Math.floor(duration / 3600000);
        const durationMinutes = Math.floor((duration % 3600000) / 60000);
        const durationSeconds = Math.floor((duration % 60000) / 1000);

        let durationString = '';

        if (durationHours > 0) {
            durationString += durationHours + 'h ';
        }

        if (durationMinutes > 0) {
            durationString += durationMinutes + 'm ';
        }

        durationString += durationSeconds + 's';
        
        const importReport = {
            totalItems: this.totalItems,
            processedItems: this.processedItems,
            skippedItems: this.skippedItems,
            duration: durationString,
            warnings: this.warnings,
            errors: this.errors
        };

        this.prismaService.setReportProgress(this.processId, importReport);
    }
}

export default PrismaServiceImporter;
