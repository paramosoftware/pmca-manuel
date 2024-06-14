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

class PrismaServiceExporter {
    private model: string;
    private prismaService: PrismaService;
    private resourceURI = '#'; // TODO: Change this to the correct URI [PMCA-400]
    private conceptSchemeId = 'A0'; // TODO: Create real concept scheme id [PMCA-401]
    private skosLanguage = 'pt'; // TODO: Make this dynamic [PMCA-402]
    private xmlOptions = {
        ignoreAttributes: false,
        format: true,
        preserveOrder: true,
        allowBooleanAttributes: true,
        suppressEmptyNode: true,
        ignorePiTags: true
    };
    private pageSize = 200;
    private include: Include | undefined;
    private where: Where | undefined;
    private labelNormalized: string | undefined;
    private mediaFiles = new Map<string, string>(); // Keep track of media files to add to zip with old file name and new file name
    private labelMap = new Map<string, string>();
    private camelCaseMap = new Map<string, string>();

    /**
     * Prisma Service Exporter
     * @param prismaService PrismaService instance
     */
    constructor(prismaService: PrismaService) {
        this.prismaService = prismaService;
        this.model = prismaService.getModel();
    }

    async exportToFormat(
        format: DataTransferFormat,
        addMedia: boolean = false,
        query?: Query,
        template?: string
    ) {
        if (!format) {
            return;
        }

        await this.setResourceConfig();
        this.include = QUERIES.get(this.model)?.include || '*';
        this.where = query?.where || undefined;

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
                await this.exportToXlsx(filePath);
                break;
            case 'csv':
                await this.exportToCsv(filePath);
                break;
            case 'json':
                await this.exportToJson(filePath);
                break;
            case 'xml':
                if (this.model === 'Concept') {
                    await this.exportToSkos(filePath);
                }
                break;
            default:
                console.log('Invalid format');
        }

        if (addMedia) {
            this.createZip(filePath, zipPath);
            return zipPath;
        } else {
            return filePath;
        }
    }

    private async createZip(filePath: string, zipPath: string) {
        const zip = new Zip();

        for (const [fileName, newFileName] of this.mediaFiles) {
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

    async setResourceConfig() {
        const resourceService = new PrismaService('Resource');

        const resourceConfig = await resourceService.readOne(this.model, {
            include: {
                fields: {
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });

        this.labelNormalized = resourceConfig?.labelNormalized;

        if (resourceConfig) {
            for (const field of resourceConfig.fields) {
                if (field.labelNormalized && field.includeExport) {
                    this.camelCaseMap.set(
                        field.name,
                        useCamelCase().to(field.labelNormalized)
                    );
                    this.labelMap.set(field.name, field.labelNormalized);
                }
            }
        }
    }

    async exportToJson(filePath: string) {
        fs.writeFileSync(filePath, '');
        fs.appendFileSync(filePath, '[');

        let totalPages = 1;

        for (let i = 0; i < totalPages; i++) {
            const data = await this.prismaService.readMany({
                pageSize: this.pageSize,
                page: i + 1,
                include: this.include,
                where: this.where,
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            for (const item of data.items) {
                const obj = this.replaceKeys(this.buildExportItem(item), this.camelCaseMap);
                fs.appendFileSync(filePath, JSON.stringify(obj, null, 2));
                fs.appendFileSync(filePath, ',');
                this.addMediaToMap(item.media, item.nameSlug);
            }
        }

        const fd = fs.openSync(filePath, 'r+');
        fs.ftruncateSync(fd, fs.statSync(filePath).size - 1);
        fs.closeSync(fd);
        fs.appendFileSync(filePath, ']');
    }

    private async exportToSkos(filePath: string) {
        fs.writeFileSync(filePath, '');
        fs.appendFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>');
        fs.appendFileSync(filePath, '\n');
        fs.appendFileSync(
            filePath,
            '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:skos="http://www.w3.org/2004/02/skos/core#" xmlns:dc="http://purl.org/dc/elements/1.1/">'
        );
        fs.appendFileSync(filePath, '\n');

        const xmlBuilder = new XMLBuilder(this.xmlOptions);
        let totalPages = 1;

        this.addSkosProperties(
            filePath,
            xmlBuilder,
            this.resourceURI,
            this.conceptSchemeId,
            this.model
        );

        for (let i = 0; i < totalPages; i++) {
            const data = await this.prismaService.readMany({
                pageSize: this.pageSize,
                page: i + 1,
                include: this.include,
                where: this.where,
                orderBy: {
                    position: 'asc'
                }
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            for (const item of data.items) {
                const concept = this.buildSkosConcept(
                    item,
                    this.resourceURI,
                    this.conceptSchemeId
                );
                fs.appendFileSync(filePath, xmlBuilder.build(concept));
                this.addMediaToMap(item.media, item.nameSlug);
            }
        }

        fs.appendFileSync(filePath, '\n');
        fs.appendFileSync(filePath, '</rdf:RDF>');
    }

    async exportToXlsx(filePath: string) {
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            filename: filePath
        });
        const worksheet = workbook.addWorksheet(this.labelNormalized ?? this.model);

        worksheet.columns = this.getColumns();

        let totalPages = 1;

        for (let i = 0; i < totalPages; i++) {
            const data = await this.prismaService.readMany({
                pageSize: this.pageSize,
                page: i + 1,
                include: this.include,
                where: this.where
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            for (const item of data.items) {
                const obj = this.buildExportItem(item);
                const keys = Object.keys(obj);

                for (const key of keys) {
                    if (obj[key] instanceof Array) {
                        obj[key] = obj[key].join(';');
                    }
                }

                worksheet.addRow(obj).commit();
                this.addMediaToMap(item.media, item.nameSlug);
            }
        }

        await workbook.commit();
    }

    async exportToCsv(filePath: string) {
        fs.writeFileSync(filePath, '');

        const columns = this.getColumns();

        let totalPages = 1;

        for (let i = 0; i < totalPages; i++) {
            const data = await this.prismaService.readMany({
                pageSize: this.pageSize,
                page: i + 1,
                include: this.include,
                where: this.where,
            });

            if (!data) {
                continue;
            }

            totalPages = data.totalPages;

            const rows = [] as string[];

            for (const item of data.items) {
                const obj = this.buildExportItem(item);

                const keys = Object.keys(obj);

                for (const key of keys) {
                    if (obj[key] instanceof Array) {
                        obj[key] = obj[key].join(';');
                    }
                }

                this.addMediaToMap(item.media, item.nameSlug);

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

    async addSkosProperties(
        filePath: string,
        xmlBuilder: XMLBuilder,
        resourceURI: string,
        conceptSchemeId: string,
        model: string
    ) {
        const referenceNote = this.buildRdfProperty(
            'referenceNote',
            'Bibliographic reference to the concept',
            'Reference',
            'http://www.w3.org/2004/02/skos/core#editorialNote',
            resourceURI
        );

        fs.appendFileSync(filePath, xmlBuilder.build(referenceNote));

        const conceptScheme = await this.buildSkosConceptScheme(
            model,
            resourceURI,
            conceptSchemeId
        );

        fs.appendFileSync(filePath, xmlBuilder.build(conceptScheme));
    }

    private buildRdfProperty(
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

    private buildSkosConcept(
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
                '@_xml:lang': this.skosLanguage
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
                        '@_xml:lang': this.skosLanguage
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
                    '@_xml:lang': this.skosLanguage
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
                    '@_xml:lang': this.skosLanguage
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
                        '@_xml:lang': this.skosLanguage
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

    private async buildSkosConceptScheme(
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
                        '@_xml:lang': this.skosLanguage
                    }
                },
                {
                    'skos:definition': [
                        {
                            '#text': process.env.APP_DESCRIPTION
                        }
                    ],
                    ':@': {
                        '@_xml:lang': this.skosLanguage
                    }
                }
            ],
            ':@': {
                '@_rdf:about': resourceURI + conceptSchemeId
            }
        } as any;

        const where = { parentId: { isNull: true } };

        const topConcepts = await this.prismaService.readMany({
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

    private buildExportItem(item: Concept) {
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

    private addMediaToMap(media: ConceptMedia[], nameSlug: string) {
        if (!media) {
            return;
        }

        for (const mediaItem of media) {
            const fileName = mediaItem.name;
            const extension = fileName.split('.').pop();
            const position = mediaItem.position ? mediaItem.position : 1;
            const newFileName = `${nameSlug}_${position}.${extension}`;

            this.mediaFiles.set(fileName, newFileName);
        }
    }

    private getColumns() {
        let columns = Array.from(this.labelMap.keys()).map((key) => ({
            header: this.labelMap.get(key),
            key: key
        }));

        columns = columns.filter(
            (column, index, self) =>
                index === self.findIndex((c) => c.header === column.header)
        );

        return columns;
    }

    private replaceKeys(obj: any, map: Map<string, string>) {
        const keys = Object.keys(obj);
        const newObj = {} as any;
        for (const key of keys) {
            newObj[map.get(key) ?? key] =
                obj[key] === undefined ? null : obj[key];
        }
        return newObj;
    }
}

export default PrismaServiceExporter;
