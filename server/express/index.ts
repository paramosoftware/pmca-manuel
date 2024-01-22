import { fromNodeMiddleware } from 'h3'
import csrfHandler from './auth/csrfHandler'
import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import auth from './auth'
import prismaHandler from './prisma/prismaHandler'
import errorHandler from './error/errorHandler'
import getDataFolderPath  from '~/utils/getDataFolderPath'

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
//app.use(csrfHandler);  // TODO: need refactoring based in the new API and auth strategy

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(prismaHandler);

function useApiRoute(app: any, route: string, handler: any) {
  app.use(`/api${route}`, handler);
}

useApiRoute(app, '/auth', auth);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});


app.use('/api/media', express.static(getDataFolderPath('media')));

app.use(errorHandler);

export default fromNodeMiddleware(app)