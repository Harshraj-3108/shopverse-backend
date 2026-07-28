// backend/src/repositories/cart.repository.js

import { BaseRepository } from './base.repository.js';
import { Cart } from '../models/Cart.js';

/**
 * Repository interface mapping specific queries for Cart documents.
 */
export class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  /**
   * Fetch a user's cart populated with full product details.
   * @param {string} userId - User identifier
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return await this.model
      .findOne({ userId })
      .populate('items.productId', 'name slug sku price salePrice stockQuantity images isActive');
  }
}
