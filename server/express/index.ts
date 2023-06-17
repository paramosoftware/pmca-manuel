import { fromNodeMiddleware } from 'h3'
import InvalidCredentialError  from './errors/InvalidCredentialError'
import ServerError from './errors/ServerError'
import UploadError from './errors/UploadError'
import express from 'express'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import auth from './auth'
import categories from './categories'
import users from './users'
import entries from './entries'
import languages from './languages'
import media from './media'
import translations from './translations'
import references from './references'
import upload from './upload'

const app = express();

app.use(cookieParser());
app.use(express.json());


function useApiRoute(app: any, route: string, handler: any) {
  app.use(`/api${route}`, handler);
}

useApiRoute(app, '/auth', auth);
useApiRoute(app, '/categories', categories);
useApiRoute(app, '/users', users);
useApiRoute(app, '/entries', entries);
useApiRoute(app, '/languages', languages);
useApiRoute(app, '/media', media);
useApiRoute(app, '/translations', translations);
useApiRoute(app, '/references', references);
useApiRoute(app, '/upload', upload);


app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});


app.use((err: Error , req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) { 
    res.status(400).json({ error: err.message });
  } else if (err instanceof InvalidCredentialError || err instanceof UploadError || err instanceof ServerError ) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});


export default fromNodeMiddleware(app)