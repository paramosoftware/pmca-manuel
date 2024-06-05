import Zip from 'adm-zip';
import { stringify } from 'csv-stringify';
import ExcelJS from 'exceljs';
import { XMLBuilder } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import QUERIES from '~/config/queries';
import getDataFolderPath from '~/utils/getDataFolderPath';
import { useCamelCase } from '~/utils/useCamelCase';
import PrismaService from './PrismaService';

export const exportData = (function () {
    // TODO: Convert to class
    // TODO: Validate if is public (and set only published in service)

    const resourceURI = '#'; // TODO: Change this to the correct URI
    const conceptSchemeId = 'A0'; // TODO: Create real concept scheme id
    const xmlOptions = {
        ignoreAttributes: false,
        format: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
        suppressEmptyNode: true,
        ignorePiTags: true
    };
    const skosLanguage = 'pt'; // TODO: Make this dynamic
    const pageSize = 200;

    const mediaFiles = new Map<string, string>(); // Keep track of media files to add to zip with old file name and new file name
    const camelCaseMap = new Map<string, string>();
    const labelMap = new Map<string, string>();

    let exportModel: string;
    let include: Include | undefined;
    let where: Where | undefined;
    let labelNormalized: string | undefined;

    async function exportToFormat(
        model: string,
        format: DataTransferFormat,
        addMedia: boolean = false,
        query?: Query,
        template?: string
    ) {
        if (!model || !format) {
            return;
        }

        exportModel = model;
        include = QUERIES.get(model)?.include || '*';
        where = query?.where || undefined;

        await setResourceConfig();

        const filePath = path.join(
            getDataFolderPath('temp'),
            `export-${Date.now()}.${format}`
        );
        const zipPath = path.join(
            getDataFolderPath('temp'),
            `export-${Date.now()}.zip`
        );

        switch (format) {
            case 'xlsx':
                await exportToXlsx(filePath);
                break;
            case 'csv':
                await exportToCsv(filePath);
                break;
            case 'json':
                await exportToJson(filePath);
                break;
            case 'xml':
                if (model === 'Concept') {
                    await exportToSkos(filePath);
                }
                break;
            default:
                console.log('Invalid format');
        }

        if (addMedia) {
            createZip(filePath, zipPath);
            return zipPath;
        } else {
            return filePath;
        }
    }

    function createZip(filePath: string, zipPath: string) {
        const zip = new Zip();

        for (const [fileName, newFileName] of mediaFiles) {
            const absoluteFilePath = path.join(
                getDataFolderPath('media'),
                fileName
            );
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

    async function setResourceConfig() {
        const resourceService = new PrismaService('Resource');

        const resourceConfig = await resourceService.readOne(exportModel, {
            include: {
                fields: {
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });

        labelNormalized = resourceConfig?.labelNormalized;

        if (resourceConfig) {
            for (const field of resourceConfig.fields) {
                if (field.labelNormalized && field.includeExport) {
                    camelCaseMap.set(
                        field.name,
                        useCamelCase().to(field.labelNormalized)
                    );
                    labelMap.set(field.name, field.labelNormalized);
                }
            }
        }
    }

    async function exportToJson(filePath: string) {
        fs.writeFileSync(filePath, '');
        fs.appendFileSync(filePath, '[');

        let totalPages = 1;

        for (let i = 0; i < totalPages; i++) {
            const prismaService = new PrismaService(exportModel);
            const data = await prismaService.readMany({
                pageSize,
                page: i + 1,
                include,
                where
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            for (const item of data.items) {
                const obj = replaceKeys(buildExportItem(item), camelCaseMap);
                fs.appendFileSync(filePath, JSON.stringify(obj, null, 2));
                fs.appendFileSync(filePath, ',');
                addMediaToMap(item.media, item.nameSlug);
            }
        }

        const fd = fs.openSync(filePath, 'r+');
        fs.ftruncateSync(fd, fs.statSync(filePath).size - 1);
        fs.closeSync(fd);
        fs.appendFileSync(filePath, ']');
    }

    async function exportToSkos(filePath: string) {
        fs.writeFileSync(filePath, '');
        fs.appendFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>');
        fs.appendFileSync(filePath, '\n');
        fs.appendFileSync(
            filePath,
            '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:skos="http://www.w3.org/2004/02/skos/core#" xmlns:dc="http://purl.org/dc/elements/1.1/">'
        );
        fs.appendFileSync(filePath, '\n');

        const xmlBuilder = new XMLBuilder(xmlOptions);
        let totalPages = 1;

        addSkosProperties(
            filePath,
            xmlBuilder,
            resourceURI,
            conceptSchemeId,
            exportModel
        );

        for (let i = 0; i < totalPages; i++) {
            const prismaService = new PrismaService(exportModel);
            const data = await prismaService.readMany({
                pageSize,
                page: i + 1,
                include,
                where,
                orderBy: {
                    position: 'asc'
                }
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            for (const item of data.items) {
                const concept = buildSkosConcept(
                    item,
                    resourceURI,
                    conceptSchemeId
                );
                fs.appendFileSync(filePath, xmlBuilder.build(concept));
                addMediaToMap(item.media, item.nameSlug);
            }
        }

        fs.appendFileSync(filePath, '\n');
        fs.appendFileSync(filePath, '</rdf:RDF>');
    }

    async function exportToXlsx(filePath: string) {
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            filename: filePath
        });
        const worksheet = workbook.addWorksheet(labelNormalized ?? exportModel);

        worksheet.columns = getColumns();

        let totalPages = 1;

        for (let i = 0; i < totalPages; i++) {
            const prismaService = new PrismaService(exportModel);
            const data = await prismaService.readMany({
                pageSize,
                page: i + 1,
                include,
                where
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            for (const item of data.items) {
                const obj = buildExportItem(item);
                const keys = Object.keys(obj);

                for (const key of keys) {
                    if (obj[key] instanceof Array) {
                        obj[key] = obj[key].join(';');
                    }
                }

                worksheet.addRow(obj).commit();
                addMediaToMap(item.media, item.nameSlug);
            }
        }

        await workbook.commit();
    }

    async function exportToCsv(filePath: string) {
        fs.writeFileSync(filePath, '');

        const columns = getColumns();

        let totalPages = 1;

        for (let i = 0; i < totalPages; i++) {
            const prismaService = new PrismaService(exportModel);
            const data = await prismaService.readMany({
                pageSize,
                page: i + 1,
                include,
                where
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            const rows = [] as string[];

            for (const item of data.items) {
                const obj = buildExportItem(item);

                const keys = Object.keys(obj);

                for (const key of keys) {
                    if (obj[key] instanceof Array) {
                        obj[key] = obj[key].join(';');
                    }
                }

                addMediaToMap(item.media, item.nameSlug);

                rows.push(obj);
            }

            await new Promise<void>((resolve, reject) => {
                stringify(
                    rows,
                    { header: 0 === i, columns: columns, eof: false },
                    async (err, output) => {
                        if (err) return reject(err);
                        fs.appendFileSync(filePath, output);
                        resolve();
                    }
                );
            });
        }
    }

    async function addSkosProperties(
        filePath: string,
        xmlBuilder: XMLBuilder,
        resourceURI: string,
        conceptSchemeId: string,
        model: string
    ) {
        const referenceNote = buildRdfProperty(
            'referenceNote',
            'Bibliographic reference to the concept',
            'Reference',
            'http://www.w3.org/2004/02/skos/core#editorialNote',
            resourceURI
        );

        fs.appendFileSync(filePath, xmlBuilder.build(referenceNote));

        const conceptScheme = await buildSkosConceptScheme(
            model,
            resourceURI,
            conceptSchemeId
        );

        fs.appendFileSync(filePath, xmlBuilder.build(conceptScheme));
    }

    function buildRdfProperty(
        name: string,
        comment: string,
        label: string,
        subPropertyOf: string,
        resourceURI: string
    ) {
        return [
            {
                'rdf:Property': [
                    {
                        'rdfs:comment': [
                            {
                                '#text': comment
                            }
                        ]
                    },
                    {
                        'rdfs:subPropertyOf': '',
                        ':@': {
                            '@_rdf:resource': subPropertyOf
                        }
                    },
                    {
                        'rdfs:label': [
                            {
                                '#text': label
                            }
                        ]
                    }
                ],
                ':@': {
                    '@_rdf:about': resourceURI + name
                }
            }
        ];
    }

    function buildSkosConcept(
        concept: Concept,
        resourceURI: string,
        conceptSchemeId: string
    ) {
        const newConcept = {} as any;

        newConcept['skos:Concept'] = [];

        newConcept[':@'] = {
            '@_rdf:about': resourceURI + concept.nameSlug
        };

        newConcept['skos:Concept'].push({
            'skos:inScheme': [],
            ':@': {
                '@_rdf:resource': resourceURI + conceptSchemeId
            }
        });

        newConcept['skos:Concept'].push({
            'skos:prefLabel': [
                {
                    '#text': concept.name
                }
            ],
            ':@': {
                '@_xml:lang': skosLanguage
            }
        });

        if (concept.translations && concept.translations.length > 0) {
            for (const translation of concept.translations) {
                newConcept['skos:Concept'].push({
                    'skos:prefLabel': [
                        {
                            '#text': translation.name
                        }
                    ],
                    ':@': {
                        '@_xml:lang': translation?.language?.code
                            ? translation.language.code
                            : translation?.language?.name
                    }
                });
            }
        }

        if (concept.variations && concept.variations.length > 0) {
            for (const variation of concept.variations) {
                newConcept['skos:Concept'].push({
                    'skos:altLabel': [
                        {
                            '#text': variation.name
                        }
                    ],
                    ':@': {
                        '@_xml:lang': skosLanguage
                    }
                });
            }
        }

        if (concept.createdAt) {
            newConcept['skos:Concept'].push({
                'dc:created': [
                    {
                        '#text': concept.createdAt.toISOString()
                    }
                ]
            });
        }

        if (concept.updatedAt) {
            newConcept['skos:Concept'].push({
                'dc:modified': [
                    {
                        '#text': concept.updatedAt.toISOString()
                    }
                ]
            });
        }

        if (concept.definition) {
            newConcept['skos:Concept'].push({
                'skos:definition': [
                    {
                        '#text': concept.definition
                    }
                ],
                ':@': {
                    '@_xml:lang': skosLanguage
                }
            });
        }

        if (concept.notes) {
            newConcept['skos:Concept'].push({
                'skos:scopeNote': [
                    {
                        '#text': concept.notes
                    }
                ],
                ':@': {
                    '@_xml:lang': skosLanguage
                }
            });
        }

        if (concept.references && concept.references.length > 0) {
            for (const reference of concept.references) {
                newConcept['skos:Concept'].push({
                    'skos:referenceNote': [
                        {
                            '#text': reference.name
                        }
                    ],
                    ':@': {
                        '@_xml:lang': skosLanguage
                    }
                });
            }
        }

        if (concept.relatedConcepts && concept.relatedConcepts.length > 0) {
            for (const relatedEntry of concept.relatedConcepts) {
                newConcept['skos:Concept'].push({
                    'skos:related': '',
                    ':@': {
                        '@_rdf:resource': resourceURI + relatedEntry.nameSlug
                    }
                });
            }
        }

        if (concept.concepts && concept.concepts.length > 0) {
            for (const relatedEntry of concept.concepts) {
                newConcept['skos:Concept'].push({
                    'skos:related': '',
                    ':@': {
                        '@_rdf:resource': resourceURI + relatedEntry.nameSlug
                    }
                });
            }
        }

        if (concept.parent) {
            newConcept['skos:Concept'].push({
                'skos:broader': '',
                ':@': {
                    '@_rdf:resource': resourceURI + concept.parent.nameSlug
                }
            });
        } else {
            newConcept['skos:Concept'].push({
                'skos:topConceptOf': '',
                ':@': {
                    '@_rdf:resource': resourceURI + conceptSchemeId
                }
            });
        }

        if (concept.children && concept.children.length > 0) {
            for (const child of concept.children) {
                newConcept['skos:Concept'].push({
                    'skos:narrower': '',
                    ':@': {
                        '@_rdf:resource': resourceURI + child.nameSlug
                    }
                });
            }
        }

        return [newConcept];
    }

    async function buildSkosConceptScheme(
        model: string,
        resourceURI: string,
        conceptSchemeId: string
    ) {
        const conceptScheme = {
            'skos:ConceptScheme': [
                {
                    'skos:prefLabel': [
                        {
                            '#text': process.env.APP_NAME
                        }
                    ],
                    ':@': {
                        '@_xml:lang': skosLanguage
                    }
                },
                {
                    'skos:definition': [
                        {
                            '#text': process.env.APP_DESCRIPTION
                        }
                    ],
                    ':@': {
                        '@_xml:lang': skosLanguage
                    }
                }
            ],
            ':@': {
                '@_rdf:about': resourceURI + conceptSchemeId
            }
        } as any;

        const where = { parentId: { isNull: true } };

        const prismaService = new PrismaService(model);
        const topConcepts = await prismaService.readMany({
            pageSize: -1,
            page: 1,
            where
        });

        if (topConcepts && topConcepts.items.length > 0) {
            for (const topConcept of topConcepts.items) {
                conceptScheme['skos:ConceptScheme'].push({
                    'skos:hasTopConcept': '',
                    ':@': {
                        '@_rdf:resource': resourceURI + topConcept.nameSlug
                    }
                });
            }
        }

        return [conceptScheme];
    }

    function buildExportItem(item: Concept) {
        const newItem = {} as any;

        newItem.id = item.nameSlug;
        newItem.name = item.name;
        newItem.definition = item.definition;
        newItem.notes = item.notes;
        newItem.parent = item.parent?.nameSlug;
        newItem.position = item.position;
        newItem.references =
            item.references?.map((reference: Reference) => reference.name) ??
            [];
        newItem.variations =
            item.variations?.map((variation: Variation) => variation.name) ??
            [];
        newItem.translations =
            item.translations?.map(
                (translation: Translation) =>
                    translation.name +
                    (translation.language
                        ? ` (${translation.language.name})`
                        : '')
            ) ?? [];

        const concepts =
            item.concepts?.map((concept: Concept) => concept.nameSlug) ?? [];
        const relatedConcepts =
            item.relatedConcepts?.map((concept: Concept) => concept.nameSlug) ??
            [];

        newItem.concepts = concepts?.concat(relatedConcepts) ?? [];

        return newItem;
    }

    function addMediaToMap(media: ConceptMedia[], nameSlug: string) {
        if (!media) {
            return;
        }

        for (const mediaItem of media) {
            const fileName = mediaItem.name;
            const extension = fileName.split('.').pop();
            const position = mediaItem.position ? mediaItem.position : 1;
            const newFileName = `${nameSlug}_${position}.${extension}`;

            mediaFiles.set(fileName, newFileName);
        }
    }

    function getColumns() {
        let columns = Array.from(labelMap.keys()).map((key) => ({
            header: labelMap.get(key),
            key: key
        }));

        columns = columns.filter(
            (column, index, self) =>
                index === self.findIndex((c) => c.header === column.header)
        );

        return columns;
    }

    function replaceKeys(obj: any, map: Map<string, string>) {
        const keys = Object.keys(obj);
        const newObj = {} as any;
        for (const key of keys) {
            newObj[map.get(key) ?? key] =
                obj[key] === undefined ? null : obj[key];
        }
        return newObj;
    }

    return {
        exportToFormat
    };
})();
