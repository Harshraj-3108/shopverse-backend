// backend/src/routes/cache.routes.js

import express from 'express';
import { cacheController } from '../controllers/cache.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cache management routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

/**
 * GET /admin/cache/stats
 * View Redis memory and key count statistics.
 */
router.get('/stats', cacheController.getCacheStats);

/**
 * DELETE /admin/cache/products
 * Manually flush all product-related cache entries.
 */
router.delete('/products', cacheController.invalidateProductCache);

/**
 * DELETE /admin/cache/categories
 * Manually flush all category-related cache entries.
 */
router.delete('/categories', cacheController.invalidateCategoryCache);

/**
 * DELETE /admin/cache/all
 * Full Redis cache flush. Use with caution.
 */
router.delete('/all', cacheController.invalidateAllCache);

export default router;
