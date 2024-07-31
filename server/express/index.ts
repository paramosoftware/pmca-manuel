import { fromNodeMiddleware } from 'h3';
import csrfHandler from './auth/csrfHandler';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import auth from './auth';
import admin from './admin';
import dataHandler from './data/dataHandler';
import errorHandler from './error/errorHandler';
import getDataFolderPath from '~/utils/getDataFolderPath';

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
        credentials: true,
        exposedHeaders: ['set-cookie']
    })
);

app.use(csrfHandler);
app.use(dataHandler);

function useApiRoute(app: any, route: string, handler: any) {
    app.use(`/api${route}`, handler);
}

useApiRoute(app, '/auth', auth);
useApiRoute(app, '/admin', admin);

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

app.use('/api/media', express.static(getDataFolderPath('media')));

app.use(errorHandler);

export default fromNodeMiddleware(app);
