import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import {
  connectDatabase,
  configureCloudinary,
  getDatabaseStatus,
  isAuth0Configured,
  isDatabaseConfigured,
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
const configuredDatabaseRetryInterval = Number(
  process.env.DATABASE_RETRY_INTERVAL_MS
);
const DATABASE_RETRY_INTERVAL_MS =
  Number.isFinite(configuredDatabaseRetryInterval) &&
  configuredDatabaseRetryInterval > 0
    ? configuredDatabaseRetryInterval
    : 15_000;
let databaseRetryTimer: NodeJS.Timeout | undefined;
let defaultTemplatesSeeded = false;
const defaultProductionOrigins = ['https://certify-ecru-phi.vercel.app'];
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
const normalizeOrigin = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
};

const parseOrigins = (value?: string): string[] =>
  value
    ? value
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter((origin): origin is string => Boolean(origin))
    : [];

const corsOrigins = new Set([
  ...defaultProductionOrigins,
  ...defaultLocalOrigins,
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CORS_ORIGINS),
]);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      callback(null, corsOrigins.has(normalizeOrigin(origin) || origin));
    },
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
  const database = getDatabaseStatus();

  res.json({
    status: 'ok',
    authConfigured: isAuth0Configured(),
    database,
    databaseConfigured: isDatabaseConfigured(),
    databaseRetrying: database !== 'connected' && Boolean(databaseRetryTimer),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const stopDatabaseRetry = (): void => {
  if (!databaseRetryTimer) {
    return;
  }

  clearInterval(databaseRetryTimer);
  databaseRetryTimer = undefined;
};

const seedDefaultTemplatesOnce = async (): Promise<void> => {
  if (defaultTemplatesSeeded) {
    return;
  }

  try {
    await seedDefaultTemplates();
    defaultTemplatesSeeded = true;
  } catch (error) {
    console.error('Failed to seed default templates:', error);
  }
};

const retryDatabaseConnection = async (): Promise<void> => {
  if (getDatabaseStatus() === 'connected') {
    stopDatabaseRetry();
    await seedDefaultTemplatesOnce();
    return;
  }

  const isDatabaseConnected = await connectDatabase();
  if (!isDatabaseConnected) {
    return;
  }

  stopDatabaseRetry();
  await seedDefaultTemplatesOnce();
};

const startDatabaseRetry = (): void => {
  if (databaseRetryTimer || !isDatabaseConfigured()) {
    return;
  }

  console.warn(
    `[db] MongoDB is not connected yet. Retrying every ${DATABASE_RETRY_INTERVAL_MS}ms.`
  );

  databaseRetryTimer = setInterval(() => {
    void retryDatabaseConnection();
  }, DATABASE_RETRY_INTERVAL_MS);
  databaseRetryTimer.unref?.();
};

const initializeRuntime = async () => {
  try {
    logRuntimeEnvReadiness();
    configureCloudinary();
    const isDatabaseConnected = await connectDatabase();

    if (!isDatabaseConnected) {
      if (!isDatabaseConfigured()) {
        console.warn(
          '[db] Default template seed is waiting for a production MONGODB_URI.'
        );
        return;
      }

      console.warn(
        '[db] Default template seed is waiting for MongoDB connection.'
      );
      startDatabaseRetry();
      return;
    }

    await seedDefaultTemplatesOnce();
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
