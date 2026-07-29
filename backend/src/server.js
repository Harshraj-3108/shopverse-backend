// src/server.js

import app from './app.js';
import { env } from './config/environment.js';
import { connectDB } from './config/db.js';
import { getRedisClient, closeRedis } from './config/redis.js';
import logger from './config/logger.js';

// ─── Startup Sequence ─────────────────────────────────────────────────────────

// 1. Connect to MongoDB
connectDB();

// 2. Initialize Redis client (connection is established lazily on first use,
//    but we start it here so the client is ready before the first request)
getRedisClient();

// 3. Start HTTP server
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
});

// ─── Graceful Shutdown Handler ────────────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  logger.warn(`⚠️ ${signal} received – initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    // Close Redis connection cleanly before exit
    await closeRedis();
    logger.info('Redis connection closed.');

    process.exit(0);
  });

  // Force exit if shutdown takes longer than 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

// ─── Process Event Handlers ───────────────────────────────────────────────────

process.on('unhandledRejection', (err) => {
  logger.error(`❌ Unhandled Promise Rejection: ${err.message}`);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  gracefulShutdown('uncaughtException');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
