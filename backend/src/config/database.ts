import mongoose from 'mongoose';

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/certify';

let listenersRegistered = false;
let connectionAttempt: Promise<boolean> | null = null;
let lastConnectionError: string | undefined;

export const getDatabaseStatus = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

export const isDatabaseConfigured = (): boolean => {
  const mongoUri = process.env.MONGODB_URI;
  return Boolean(mongoUri && mongoUri !== LOCAL_MONGO_URI);
};

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

  const mongoUri = process.env.MONGODB_URI;
  const uri = mongoUri || LOCAL_MONGO_URI;

  if (!isDatabaseConfigured() && isProductionLikeRuntime()) {
    lastConnectionError = 'MONGODB_URI is missing or still set to local dev.';
    console.warn(`[db] ${lastConnectionError}`);
    return false;
  }

  registerDatabaseListeners();

  connectionAttempt = mongoose
    .connect(uri, {
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
