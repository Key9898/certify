import mongoose from 'mongoose';

export const getDatabaseStatus = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

const registerDatabaseListeners = (): void => {
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error);
  });
};

export const connectDatabase = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri === 'mongodb://localhost:27017/certify') {
    // Still attempt local connection but warn if it's the placeholder
    const uri = mongoUri || 'mongodb://localhost:27017/certify';
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      registerDatabaseListeners();
      console.log('✅ MongoDB connected successfully');
      return true;
    } catch (error) {
      console.warn(
        '⚠️  MongoDB connection failed. Server will start without DB. Set MONGODB_URI in .env'
      );
      console.warn('   Error:', (error as Error).message);
      // Don't exit — allow the server to start so health check still works.
      return false;
    }
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    registerDatabaseListeners();
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('   Server will keep running so platform healthchecks pass.');
    return false;
  }
};
