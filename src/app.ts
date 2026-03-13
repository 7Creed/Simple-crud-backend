import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);

const openapiPath = path.resolve(process.cwd(), 'openapi.yaml');
const openapiSpec = YAML.load(openapiPath);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/openapi.yaml', (_req, res) => {
  res.sendFile(openapiPath);
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Simple CRUD Backend API',
    docs: '/docs',
    health: '/health',
  });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    res
      .status(500)
      .json({ message: 'Internal server error', detail: err.message });
  },
);

export default app;
