// backend/src/repositories/review.repository.js

import { BaseRepository } from './base.repository.js';
import { Review } from '../models/Review.js';

/**
 * Repository interface mapping specific queries for Review documents.
 */
export class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  /**
   * Find a single review record mapping user and product coordinates.
   * @param {string} userId
   * @param {string} productId
   * @returns {Promise<Object|null>}
   */
  async findByUserAndProduct(userId, productId) {
    return await this.findOne({ userId, productId });
  }

  /**
   * Fetch reviews of a product using pagination parameters.
   * @param {string} productId - Product ID reference
   * @param {number} page - Page index
   * @param {number} limit - Items limit
   */
  async findByProductPaginated(productId, page, limit) {
    const skipVal = (page - 1) * limit;

    const [totalItems, items] = await Promise.all([
      this.model.countDocuments({ productId }),
      this.model.find({ productId })
        .sort({ createdAt: -1 })
        .skip(skipVal)
        .limit(limit)
        .populate('userId', 'name')
    ]);

    return {
      reviews: items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    };
  }
}
