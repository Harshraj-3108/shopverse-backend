// backend/src/controllers/cache.controller.js

import { cacheService } from '../services/cache.service.js';

/**
 * Admin controller for cache management operations.
 * Allows admins to inspect cache stats and manually invalidate caches.
 */
export const cacheController = {
  /**
   * GET /admin/cache/stats
   * Returns Redis memory stats and total key count.
   */
  getCacheStats: async (req, res, next) => {
    try {
      const stats = await cacheService.getStats();
      res.status(200).json({
        status: 'success',
        data: { cache: stats },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /admin/cache/products
   * Manually flush all product-related cache entries.
   */
  invalidateProductCache: async (req, res, next) => {
    try {
      await cacheService.invalidateProducts();
      res.status(200).json({
        status: 'success',
        message: 'Product cache (listings, search, homepage) invalidated successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /admin/cache/categories
   * Manually flush all category-related cache entries.
   */
  invalidateCategoryCache: async (req, res, next) => {
    try {
      await cacheService.invalidateCategories();
      res.status(200).json({
        status: 'success',
        message: 'Category cache invalidated successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /admin/cache/all
   * Flush ALL Redis cache keys (full cache clear).
   * Use with caution in production.
   */
  invalidateAllCache: async (req, res, next) => {
    try {
      await cacheService.delByPattern('*');
      res.status(200).json({
        status: 'success',
        message: 'All cache entries cleared successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
};
