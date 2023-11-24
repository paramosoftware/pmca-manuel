import { fromNodeMiddleware } from 'h3'
import csrfHandler from './auth/csrfHandler'
import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import auth from './auth'
import upload from './upload'
import prismaHandler from './prisma/prismaHandler'
import errorHandler from './error/errorHandler'

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
//app.use(csrfHandler);  // TODO: need refactoring based in the new API and auth strategy
app.use(prismaHandler);

function useApiRoute(app: any, route: string, handler: any) {
  app.use(`/api${route}`, handler);
}

useApiRoute(app, '/auth', auth);
useApiRoute(app, '/upload', upload);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});


app.use(errorHandler);

export default fromNodeMiddleware(app)