import mongoose from 'mongoose';
import logger from './logger';
import env from './env';

export async function connectMongo(): Promise<void> {
  const uri = env.mongoUri;
  if (!uri) {
    logger.warn('MONGO_URI not set; skipping MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(uri);
    logger.info({ db: 'mongo', uriMasked: maskMongoUri(uri) }, 'MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection error');
  }
}

function maskMongoUri(uri: string): string {
  try {
    const u = new URL(uri);
    if (u.username) u.username = '***';
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '***';
  }
}

