import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri === 'mongodb://localhost:27017/certify') {
    // Still attempt local connection but warn if it's the placeholder
    const uri = mongoUri || 'mongodb://localhost:27017/certify';
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.warn(
        '⚠️  MongoDB connection failed. Server will start without DB. Set MONGODB_URI in .env'
      );
      console.warn('   Error:', (error as Error).message);
      // Don't exit — allow the server to start so health check still works
    }
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error);
  });
};
