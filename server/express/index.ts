import { fromNodeMiddleware } from 'h3'
import express from 'express'
import categories from './categories'
import entries from './entries'

const app = express();

app.use(express.json());

function useApiRoute(app: any, route: string, handler: any) {
  app.use(`/api${route}`, handler);
}

useApiRoute(app, '/categories', categories);
useApiRoute(app, '/entries', entries);


app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});


export default fromNodeMiddleware(app)