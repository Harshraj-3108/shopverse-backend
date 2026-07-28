// backend/src/repositories/wishlist.repository.js

import { BaseRepository } from './base.repository.js';
import { Wishlist } from '../models/Wishlist.js';

/**
 * Repository interface mapping specific queries for Wishlist documents.
 */
export class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
  }

  /**
   * Fetch a user's wishlist populated with product catalog fields.
   * @param {string} userId - User identifier
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return await this.model
      .findOne({ userId })
      .populate('products', 'name slug sku price salePrice stockQuantity images isActive');
  }
}
