import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import {
  connectDatabase,
  configureCloudinary,
  getDatabaseStatus,
  logRuntimeEnvReadiness,
  swaggerSpec,
} from './config';
import { seedDefaultTemplates } from './services/templateService';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';
import routes from './routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const defaultLocalOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177',
  'http://127.0.0.1:5178',
  'http://127.0.0.1:5179',
  'http://127.0.0.1:5180',
];
const corsOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : defaultLocalOrigins;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const initializeRuntime = async () => {
  try {
    logRuntimeEnvReadiness();
    const isDatabaseConnected = await connectDatabase();
    configureCloudinary();

    if (!isDatabaseConnected) {
      console.warn(
        '⚠️  Skipping default template seed because MongoDB is not connected.'
      );
      return;
    }

    try {
      await seedDefaultTemplates();
    } catch (error) {
      console.error('Failed to seed default templates:', error);
    }
  } catch (error) {
    console.error('Runtime initialization failed:', error);
  }
};

// Start server before external dependency checks so platform healthchecks verify
// the HTTP process itself instead of blocking on MongoDB or seed data.
const start = () => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    void initializeRuntime();
  });

  server.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
};

start();

export default app;
