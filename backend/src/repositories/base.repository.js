// src/repositories/base.repository.js

/**
 * Base Repository pattern implementation.
 * Encapsulates core database CRUD operations to minimize code duplication.
 */
export class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('Mongoose Model dependency is required for BaseRepository instantiation.');
    }
    this.model = model;
  }

  /**
   * Create a new document.
   * @param {Object} data - Payload data to insert
   * @returns {Promise<Object>} The created database document
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Find a document by its primary ID.
   * @param {string} id - Document ID
   * @param {Array|string} populateOptions - Paths to populate
   * @returns {Promise<Object|null>} The database document or null
   */
  async findById(id, populateOptions = '') {
    return await this.model.findById(id).populate(populateOptions);
  }

  /**
   * Find a single document matching query criteria.
   * @param {Object} filter - Query filter
   * @param {Array|string} populateOptions - Paths to populate
   * @returns {Promise<Object|null>} The database document or null
   */
  async findOne(filter, populateOptions = '') {
    return await this.model.findOne(filter).populate(populateOptions);
  }

  /**
   * Find multiple documents matching query criteria.
   * @param {Object} filter - Query filter
   * @param {Object} options - Pagination/sort configurations ({ skip, limit, sort })
   * @param {Array|string} populateOptions - Paths to populate
   * @returns {Promise<Array>} List of matching documents
   */
  async find(filter = {}, options = {}, populateOptions = '') {
    const { skip = 0, limit = 100, sort = { createdAt: -1 } } = options;
    return await this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateOptions);
  }

  /**
   * Update a document matching query criteria.
   * @param {string} id - Document ID
   * @param {Object} updateData - Modifications payload
   * @returns {Promise<Object|null>} Updated database document
   */
  async updateById(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a document by its ID.
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Deleted database document
   */
  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Count documents matching query criteria.
   * @param {Object} filter - Query filter
   * @returns {Promise<number>} Count of documents
   */
  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}
