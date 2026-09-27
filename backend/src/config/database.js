import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (customUri) => {
  if (isConnected) return;

  const uri = customUri || env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[MongoDB] Disconnected successfully');
};
