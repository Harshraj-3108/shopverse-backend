// backend/src/controllers/homepage.controller.js

import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../services/cache.service.js';

/**
 * Controller for homepage / featured data endpoint.
 * Aggregates newest products, featured categories, and top-rated products
 * into a single cached response to minimize round trips on the landing page.
 */
export const homepageController = {
  /**
   * GET /homepage
   * Returns aggregated homepage data:
   *  - 8 newest products
   *  - 8 top-rated products
   *  - All active root-level categories
   */
  getHomepageData: async (req, res, next) => {
    try {
      const cacheKey = CACHE_KEYS.HOMEPAGE();

      const data = await cacheService.remember(
        cacheKey,
        async () => {
          const [newestProducts, topRatedProducts, featuredCategories] = await Promise.all([
            // 8 newest active products
            Product.find({ isActive: true })
              .sort({ createdAt: -1 })
              .limit(8)
              .populate('categoryId', 'name slug')
              .lean(),

            // 8 highest-rated active products
            Product.find({ isActive: true, reviewsCount: { $gt: 0 } })
              .sort({ averageRating: -1, reviewsCount: -1 })
              .limit(8)
              .populate('categoryId', 'name slug')
              .lean(),

            // All active root categories (no parent)
            Category.find({ isActive: true, parentId: null })
              .sort({ name: 1 })
              .lean(),
          ]);

          return {
            newestProducts,
            topRatedProducts,
            featuredCategories,
          };
        },
        CACHE_TTL.HOMEPAGE
      );

      res.set('X-Cache', 'HIT');
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
