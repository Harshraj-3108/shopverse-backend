// src/config/db.js

import mongoose from 'mongoose';
import logger from './logger.js';
import { env } from './environment.js';

let connectionRetryCount = 0;
const MAX_RETRY_LIMIT = 5;
const RETRY_INTERVAL_MS = 5000;

/**
 * Connect to MongoDB with automatic retry configurations.
 */
export const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,             // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,      // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(env.MONGO_URI, options);

    logger.info(`MongoDB connected successfully to host: ${conn.connection.host}`);
    connectionRetryCount = 0; // Reset retry counter on success
  } catch (error) {
    connectionRetryCount++;
    logger.error(`MongoDB connection error (Attempt ${connectionRetryCount}/${MAX_RETRY_LIMIT}): ${error.message}`);
    
    if (connectionRetryCount >= MAX_RETRY_LIMIT) {
      logger.error('❌ Max database connection retries reached. Shutting down application...');
      process.exit(1);
    }

    logger.warn(`Retrying database connection in ${RETRY_INTERVAL_MS / 1000} seconds...`);
    setTimeout(connectDB, RETRY_INTERVAL_MS);
  }
};

// Bind Mongoose connection lifecycle event hooks
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost! Reconnection attempts managed by driver.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection event error: ${err.message}`);
});
