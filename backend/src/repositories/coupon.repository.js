// backend/src/repositories/coupon.repository.js

import { BaseRepository } from './base.repository.js';
import { Coupon } from '../models/Coupon.js';

/**
 * Repository interface mapping specific queries for Coupon documents.
 */
export class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }

  /**
   * Look up a coupon using its uppercase code coordinates.
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  async findByCode(code) {
    return await this.findOne({ code: code.toUpperCase() });
  }
}
