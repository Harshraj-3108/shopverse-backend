// backend/src/config/redis.js

import Redis from 'ioredis';
import logger from './logger.js';
import { env } from './environment.js';

// ---------------------------------------------------------------------------
// Redis client singleton
// ---------------------------------------------------------------------------

let redisClient = null;
let isConnected = false;

/**
 * Creates and returns the singleton Redis client.
 * Uses a lazy singleton pattern — safe to call multiple times.
 */
export const getRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis(env.REDIS_URL, {
    // Graceful reconnection strategy
    retryStrategy(times) {
      if (times > 10) {
        logger.error('Redis: Maximum reconnection attempts reached. Giving up.');
        return null; // Stop reconnecting
      }
      const delay = Math.min(times * 200, 3000); // exponential backoff cap at 3s
      logger.warn(`Redis: Reconnecting in ${delay}ms (attempt #${times})...`);
      return delay;
    },
    // Prevent unhandled promise rejections on connection failure
    lazyConnect: false,
    enableOfflineQueue: true,  // Queue commands when temporarily disconnected
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
  });

  redisClient.on('connect', () => {
    isConnected = true;
    logger.info('✅ Redis client connected successfully.');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis client is ready to accept commands.');
  });

  redisClient.on('error', (err) => {
    isConnected = false;
    logger.error(`❌ Redis client error: ${err.message}`);
  });

  redisClient.on('close', () => {
    isConnected = false;
    logger.warn('⚠️ Redis connection closed.');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('⏳ Redis client is reconnecting...');
  });

  return redisClient;
};

/**
 * Returns whether the Redis client is currently connected and ready.
 */
export const isRedisConnected = () => isConnected;

/**
 * Gracefully quit the Redis connection (for server shutdown).
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    logger.info('Redis connection closed gracefully.');
  }
};
