import { fromNodeMiddleware } from 'h3'
import InvalidCredentialError  from './errors/InvalidCredentialError'
import express from 'express'
import cookieParser from 'cookie-parser'
import auth from './auth'
import categories from './categories'
import entries from './entries'

const app = express();


app.use(cookieParser());
app.use(express.json());


function useApiRoute(app: any, route: string, handler: any) {
  app.use(`/api${route}`, handler);
}

useApiRoute(app, '/auth', auth);
useApiRoute(app, '/categories', categories);
useApiRoute(app, '/entries', entries);


app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});



app.use((err: Error , req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof InvalidCredentialError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});


export default fromNodeMiddleware(app)