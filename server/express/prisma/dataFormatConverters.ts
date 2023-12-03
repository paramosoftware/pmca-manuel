
import express from 'express';
import path from 'path';
import { stringify } from 'csv-stringify';
import getTempPath from '~/utils/getTempPath';
import fs from 'fs';
import ExcelJS from 'exceljs';


export async function convertToFormatAndSend(data: any, format: string, res: express.Response, next: express.NextFunction) {

    if (data.data) {
        data = data.data;
    }

    const filePath = path.join(getTempPath(), `${Date.now()}.${format}`);
    fs.writeFileSync(filePath, '');
  
    switch (format.toLowerCase()) {
        case 'csv':
            await convertToCsv(data, filePath);
            break; 
        case 'xlsx' || 'xls':
            await convertToXlsx(data, filePath);
            break;
        case 'json':
            await convertToJson(data, filePath);
            break;
        default:
            return next();
    }
    
    res.contentType(path.extname(filePath));
    res.sendFile(filePath);

    setTimeout(() => {
        fs.unlinkSync(filePath);
    }, 1000 * 60 * 5);

}

async function convertToJson(data: any, filePath: string) {

    if (!Array.isArray(data)) {
        data = [data];
    }

    fs.writeFileSync(filePath, JSON.stringify(data));

    return filePath;
}

async function convertToCsv(data: any, filePath: string) {

    if (!Array.isArray(data)) {
        data = [data];
    }

    await new Promise((resolve, reject) => {

        const stringifier = stringify({ header: true, columns: Object.keys(data[0]) });
        const writer = fs.createWriteStream(filePath);

        stringifier.pipe(writer);

        for (const item of data) {
            stringifier.write(item);
        }
        
        stringifier.on('error', reject);
        writer.on('error', reject);
        writer.on('finish', resolve);

        stringifier.end();

    });

    return filePath;
}

async function convertToXlsx(data: any, filePath: string) {

    if (!Array.isArray(data)) {
        data = [data];
    }

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: filePath });
    const worksheet = workbook.addWorksheet('My Sheet');

    worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

    for (const item of data) {
        worksheet.addRow(item).commit();
    }

    await workbook.commit();

    return filePath;
}













