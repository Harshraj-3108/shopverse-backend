// backend/src/middlewares/rateLimiter.middleware.js

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../config/redis.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// Helper: build a rate limiter with optional Redis store
// ---------------------------------------------------------------------------

/**
 * Creates an express-rate-limit instance.
 * When Redis is available, uses a distributed RedisStore so limits are
 * shared across all server instances (production-ready).
 * Falls back to in-memory store when Redis is unavailable.
 *
 * @param {Object} options
 * @param {number} options.windowMs   - Time window in milliseconds
 * @param {number} options.max        - Max requests allowed per window
 * @param {string} options.message    - Error message sent on limit breach
 * @param {string} [options.keyPrefix] - Redis key namespace prefix
 */
const createLimiter = ({ windowMs, max, message, keyPrefix = 'rl' }) => {
  const storeOptions = {};

  if (isRedisConnected()) {
    try {
      storeOptions.store = new RedisStore({
        sendCommand: (...args) => getRedisClient().call(...args),
        prefix: `${keyPrefix}:`,
      });
    } catch (err) {
      logger.warn(`Rate limiter: RedisStore init failed, using memory store. ${err.message}`);
    }
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,   // Include RateLimit-* headers in response
    legacyHeaders: false,     // Disable X-RateLimit-* headers
    message: {
      status: 'error',
      statusCode: 429,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message,
    },
    handler: (req, res) => {
      logger.warn(
        `Rate limit exceeded – IP: ${req.ip} | Path: ${req.originalUrl} | Window: ${windowMs / 1000}s`
      );
      res.status(429).json({
        status: 'error',
        statusCode: 429,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message,
      });
    },
    skip: (req) => {
      // Never rate-limit health checks
      return req.path === '/health';
    },
    ...storeOptions,
  });
};

// ---------------------------------------------------------------------------
// Rate limiter instances
// ---------------------------------------------------------------------------

/**
 * Global API rate limiter.
 * Applied to all /api/v1 routes.
 * 200 requests per 15-minute window per IP.
 */
export const globalRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
  keyPrefix: 'rl:global',
});

/**
 * Authentication endpoint rate limiter (brute-force protection).
 * Applied to /auth/login and /auth/signup.
 * 10 attempts per 15-minute window per IP.
 */
export const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  keyPrefix: 'rl:auth',
});

/**
 * Password reset rate limiter (strict brute-force protection).
 * Applied to /auth/forgot-password and /auth/reset-password.
 * 5 attempts per hour per IP.
 */
export const passwordResetRateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset attempts. Please try again after 1 hour.',
  keyPrefix: 'rl:password',
});

/**
 * Search endpoint rate limiter.
 * Applied to public product search (prevents abusive scraping).
 * 60 requests per minute per IP.
 */
export const searchRateLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many search requests. Please slow down.',
  keyPrefix: 'rl:search',
});

/**
 * Admin API rate limiter.
 * Slightly more lenient for admins performing bulk operations.
 * 500 requests per 15 minutes per IP.
 */
export const adminRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Admin API rate limit exceeded. Please try again later.',
  keyPrefix: 'rl:admin',
});
