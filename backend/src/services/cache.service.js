// backend/src/services/cache.service.js

import { getRedisClient, isRedisConnected } from '../config/redis.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// Default TTL constants (seconds)
// ---------------------------------------------------------------------------
export const CACHE_TTL = {
  PRODUCTS_LIST: 300,        // 5 minutes – product listings
  PRODUCT_DETAIL: 600,       // 10 minutes – individual product pages
  CATEGORIES: 900,           // 15 minutes – category tree (changes rarely)
  HOMEPAGE: 180,             // 3 minutes – featured/homepage data
  SEARCH_RESULTS: 120,       // 2 minutes – search results
  USER_SESSION: 3600,        // 1 hour – reserved for future user-context cache
};

// ---------------------------------------------------------------------------
// Cache key namespace prefixes
// ---------------------------------------------------------------------------
export const CACHE_KEYS = {
  // Products
  PRODUCTS_LIST: (params) => `products:list:${JSON.stringify(params)}`,
  PRODUCT_DETAIL: (slug) => `products:detail:${slug}`,
  PRODUCT_BY_ID: (id) => `products:id:${id}`,

  // Categories
  CATEGORIES_ALL: (format) => `categories:all:${format}`,
  CATEGORY_DETAIL: (slug) => `categories:detail:${slug}`,

  // Homepage / featured
  HOMEPAGE: () => `homepage:featured`,

  // Search
  SEARCH: (query, page, limit) => `search:${query}:${page}:${limit}`,
};

// ---------------------------------------------------------------------------
// Core cache service
// ---------------------------------------------------------------------------

/**
 * Central service providing get/set/delete/invalidate operations on Redis.
 * All operations degrade gracefully — if Redis is down, the app continues
 * serving fresh data from MongoDB without crashing.
 */
export const cacheService = {
  /**
   * Retrieve a cached value by key.
   * Returns null on cache miss or Redis unavailability.
   * @param {string} key - Cache key
   * @returns {Promise<any|null>}
   */
  get: async (key) => {
    if (!isRedisConnected()) return null;
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      if (data) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (err) {
      logger.error(`Cache GET error [${key}]: ${err.message}`);
      return null;
    }
  },

  /**
   * Store a value in the cache with an optional TTL.
   * @param {string} key - Cache key
   * @param {any} value - JSON-serializable value
   * @param {number} [ttl] - Time-to-live in seconds (default 300)
   */
  set: async (key, value, ttl = CACHE_TTL.PRODUCTS_LIST) => {
    if (!isRedisConnected()) return;
    try {
      const client = getRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.error(`Cache SET error [${key}]: ${err.message}`);
    }
  },

  /**
   * Delete a specific cache key.
   * @param {string} key - Cache key to remove
   */
  del: async (key) => {
    if (!isRedisConnected()) return;
    try {
      const client = getRedisClient();
      await client.del(key);
      logger.debug(`Cache DEL: ${key}`);
    } catch (err) {
      logger.error(`Cache DEL error [${key}]: ${err.message}`);
    }
  },

  /**
   * Delete all cache keys matching a glob pattern.
   * Uses SCAN to avoid blocking the Redis event loop (production-safe).
   * @param {string} pattern - e.g. 'products:list:*'
   */
  delByPattern: async (pattern) => {
    if (!isRedisConnected()) return;
    try {
      const client = getRedisClient();
      let cursor = '0';
      let deletedCount = 0;

      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      if (deletedCount > 0) {
        logger.debug(`Cache FLUSH pattern "${pattern}": deleted ${deletedCount} key(s)`);
      }
    } catch (err) {
      logger.error(`Cache delByPattern error [${pattern}]: ${err.message}`);
    }
  },

  /**
   * Cache-aside helper: returns cached data or runs the fallback function,
   * caches the result, and returns it.
   *
   * @param {string} key   - Cache key
   * @param {Function} fn  - Async data-fetching fallback function
   * @param {number} ttl   - Cache TTL in seconds
   * @returns {Promise<any>}
   */
  remember: async (key, fn, ttl = CACHE_TTL.PRODUCTS_LIST) => {
    const cached = await cacheService.get(key);
    if (cached !== null) return cached;

    const data = await fn();
    await cacheService.set(key, data, ttl);
    return data;
  },

  // ---------------------------------------------------------------------------
  // Targeted invalidation helpers
  // ---------------------------------------------------------------------------

  /**
   * Invalidate all product-related cache entries.
   * Called after create/update/delete product or image operations.
   */
  invalidateProducts: async () => {
    await cacheService.delByPattern('products:list:*');
    await cacheService.delByPattern('search:*');
    await cacheService.delByPattern('homepage:*');
    logger.debug('Cache invalidated: products, search, homepage');
  },

  /**
   * Invalidate a specific product's detail cache by slug.
   * @param {string} slug
   */
  invalidateProductDetail: async (slug) => {
    await cacheService.del(CACHE_KEYS.PRODUCT_DETAIL(slug));
    logger.debug(`Cache invalidated: product detail [${slug}]`);
  },

  /**
   * Invalidate a specific product detail by its MongoDB _id.
   * @param {string} id
   */
  invalidateProductById: async (id) => {
    await cacheService.del(CACHE_KEYS.PRODUCT_BY_ID(id));
  },

  /**
   * Invalidate all category-related cache entries.
   * Called after create/update/delete category operations.
   */
  invalidateCategories: async () => {
    await cacheService.delByPattern('categories:*');
    // Invalidate homepage too since it may show category data
    await cacheService.delByPattern('homepage:*');
    logger.debug('Cache invalidated: categories, homepage');
  },

  /**
   * Invalidate homepage cache.
   */
  invalidateHomepage: async () => {
    await cacheService.del(CACHE_KEYS.HOMEPAGE());
    logger.debug('Cache invalidated: homepage');
  },

  /**
   * Get current Redis memory info and stats (admin health).
   * @returns {Promise<Object>}
   */
  getStats: async () => {
    if (!isRedisConnected()) {
      return { connected: false, message: 'Redis not connected' };
    }
    try {
      const client = getRedisClient();
      const info = await client.info('memory');
      const dbSize = await client.dbsize();
      return {
        connected: true,
        totalKeys: dbSize,
        memoryInfo: info,
      };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  },
};
