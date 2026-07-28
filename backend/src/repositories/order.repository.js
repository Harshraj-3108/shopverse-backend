// backend/src/repositories/order.repository.js

import { BaseRepository } from './base.repository.js';
import { Order } from '../models/Order.js';

/**
 * Repository interface mapping specific queries for Order documents.
 */
export class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Fetch all orders created by the target user.
   * @param {string} userId - User identifier
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return await this.find({ userId }, { sort: { createdAt: -1 } });
  }

  /**
   * Find an order by its unique tracking order number.
   * @param {string} orderNumber
   * @returns {Promise<Object|null>}
   */
  async findByOrderNumber(orderNumber) {
    return await this.findOne({ orderNumber });
  }
}
