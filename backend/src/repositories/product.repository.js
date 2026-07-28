// backend/src/repositories/product.repository.js

import { BaseRepository } from './base.repository.js';
import { Product } from '../models/Product.js';

/**
 * Repository interface mapping specific queries for Product documents.
 */
export class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Find a product record by its unique SKU code.
   * @param {string} sku - Product SKU
   * @returns {Promise<Object|null>}
   */
  async findBySku(sku) {
    return await this.findOne({ sku: sku.toUpperCase() });
  }

  /**
   * Find a product record by its unique slug name.
   * @param {string} slug - Product slug
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    return await this.findOne({ slug });
  }
}
