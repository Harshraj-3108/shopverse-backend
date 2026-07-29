// backend/src/middlewares/cache.middleware.js

import { cacheService } from '../services/cache.service.js';
import logger from '../config/logger.js';

/**
 * Express middleware factory for route-level cache-aside.
 *
 * Usage:
 *   router.get('/products', cacheMiddleware(CACHE_KEYS.PRODUCTS_LIST(req.query), 300), handler)
 *
 * When a cached response exists → returned immediately (cache HIT).
 * On cache MISS → falls through to the next handler, which calls
 *   res.sendCached(data) or the regular res.json(data).
 *
 * @param {Function|string} keyResolver - Either a static key string or
 *   a function (req) => string that computes the key from the request.
 * @param {number} [ttl=300] - Cache TTL in seconds
 */
export const cacheMiddleware = (keyResolver, ttl = 300) => {
  return async (req, res, next) => {
    try {
      const key = typeof keyResolver === 'function' ? keyResolver(req) : keyResolver;

      const cached = await cacheService.get(key);
      if (cached !== null) {
        // Serve from cache – add a header so callers know it's a HIT
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }

      // Cache MISS – intercept res.json to store the response before sending
      res.set('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        // Only cache successful 2xx responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await cacheService.set(key, body, ttl);
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.error(`cacheMiddleware error: ${err.message}`);
      next(); // Always fall through on errors
    }
  };
};
