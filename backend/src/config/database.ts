import mongoose from 'mongoose';

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/certify';
const DATABASE_URI_KEYS = [
  'MONGODB_URI',
  'MONGO_URI',
  'MONGODB_URL',
  'MONGO_URL',
  'DATABASE_URL',
] as const;

type DatabaseConfig = {
  source: (typeof DATABASE_URI_KEYS)[number] | 'local' | 'missing';
  uri: string;
};

let listenersRegistered = false;
let connectionAttempt: Promise<boolean> | null = null;
let lastConnectionError: string | undefined;

const isMongoUri = (value: string): boolean =>
  /^mongodb(\+srv)?:\/\//i.test(value);

const resolveDatabaseConfig = (): DatabaseConfig => {
  for (const key of DATABASE_URI_KEYS) {
    const value = process.env[key]?.trim();
    if (value && isMongoUri(value)) {
      return { source: key, uri: value };
    }
  }

  return { source: 'local', uri: LOCAL_MONGO_URI };
};

export const getDatabaseStatus = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

export const isDatabaseConfigured = (): boolean => {
  const databaseConfig = resolveDatabaseConfig();
  return (
    databaseConfig.source !== 'local' && databaseConfig.uri !== LOCAL_MONGO_URI
  );
};

export const getDatabaseConfigSource = (): string =>
  isDatabaseConfigured() ? resolveDatabaseConfig().source : 'missing';

export const getDatabaseLastError = (): string | undefined =>
  lastConnectionError;

const isProductionLikeRuntime = (): boolean =>
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);

const sanitizeConnectionError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb$1://***@');
};

const registerDatabaseListeners = (): void => {
  if (listenersRegistered) {
    return;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    lastConnectionError = sanitizeConnectionError(error);
    console.error('[db] MongoDB error:', lastConnectionError);
  });

  listenersRegistered = true;
};

export const connectDatabase = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (connectionAttempt) {
    return connectionAttempt;
  }

  const databaseConfig = resolveDatabaseConfig();

  if (!isDatabaseConfigured() && isProductionLikeRuntime()) {
    lastConnectionError = `No production MongoDB URI found. Set one of: ${DATABASE_URI_KEYS.join(', ')}.`;
    console.warn(`[db] ${lastConnectionError}`);
    return false;
  }

  registerDatabaseListeners();

  connectionAttempt = mongoose
    .connect(databaseConfig.uri, {
      serverSelectionTimeoutMS: isDatabaseConfigured() ? 5000 : 3000,
    })
    .then(() => {
      lastConnectionError = undefined;
      console.log('[db] MongoDB connected successfully');
      return true;
    })
    .catch((error) => {
      lastConnectionError = sanitizeConnectionError(error);
      console.warn('[db] MongoDB connection failed. Server will keep running.');
      console.warn(`[db] Error: ${lastConnectionError}`);
      return false;
    })
    .finally(() => {
      connectionAttempt = null;
    });

  return connectionAttempt;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
