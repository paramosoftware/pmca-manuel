import { fromNodeMiddleware } from 'h3'
import InvalidCredentialError  from './errors/InvalidCredentialError'
import ApiValidationError from './errors/ApiValidationError'
import csrf from './middleware/csrf'
import ServerError from './errors/ServerError'
import UploadError from './errors/UploadError'
import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import multer from 'multer'
import auth from './auth'
import upload from './upload'
import { PrismaClientKnownRequestError} from '@prisma/client/runtime/library.js'
import prismaRequestHandler from './prismaRequestHandler'

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(prismaRequestHandler);
app.use(csrf);

function useApiRoute(app: any, route: string, handler: any) {
  app.use(`/api${route}`, handler);
}

useApiRoute(app, '/auth', auth);
useApiRoute(app, '/upload', upload);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // TODO: Create log file
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  };

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(400).json({
        message: 'unique',
        field: err.meta.target[0]
      });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  } else if (err instanceof InvalidCredentialError || err instanceof UploadError || err instanceof ServerError || err instanceof ApiValidationError) {
    res.status(err.statusCode).json({ error: { type: err.name, message: err.message } });
  } else {
    res.status(500).json({ error: true ? err : 'An unexpected error occurred' });
  }
});


export default fromNodeMiddleware(app)