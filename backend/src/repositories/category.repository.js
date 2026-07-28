// src/repositories/category.repository.js

import { BaseRepository } from './base.repository.js';
import { Category } from '../models/Category.js';

/**
 * Repository interface mapping specific queries for Category documents.
 */
export class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /**
   * Find all categories matching a parentId reference.
   * @param {string|null} parentId - Parent identifier
   * @returns {Promise<Array>}
   */
  async findByParent(parentId) {
    return await this.find({ parentId });
  }

  /**
   * Find a category by its slug value.
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    return await this.findOne({ slug });
  }
}
