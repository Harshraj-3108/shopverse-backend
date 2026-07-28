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

  /**
   * Advanced product search, filtering, and pagination query.
   * @param {Object} queryFilters - Filter queries (search, categoryId, minPrice, maxPrice)
   * @param {Object} queryOptions - Pagination & sorting rules (page, limit, sort)
   */
  async findProductsAdvanced(queryFilters, queryOptions) {
    const { search, categoryId, minPrice, maxPrice } = queryFilters;
    const { page, limit, sort } = queryOptions;

    // Filter active items only
    const filterQuery = { isActive: true };

    // 1. Text Search matching
    if (search) {
      filterQuery.$text = { $search: search };
    }

    // 2. Category matching
    if (categoryId) {
      filterQuery.categoryId = categoryId;
    }

    // 3. Price boundary filtering (considers standard price or active salePrice)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const minVal = minPrice !== undefined ? minPrice : 0;
      const maxVal = maxPrice !== undefined ? maxPrice : Infinity;

      const salePriceCond = {
        salePrice: { $exists: true, $ne: null, $gte: minVal }
      };
      if (maxVal !== Infinity) {
        salePriceCond.salePrice.$lte = maxVal;
      }

      const standardPriceCond = {
        $or: [
          { salePrice: { $exists: false } },
          { salePrice: null }
        ],
        price: { $gte: minVal }
      };
      if (maxVal !== Infinity) {
        standardPriceCond.price.$lte = maxVal;
      }

      filterQuery.$and = [
        {
          $or: [
            salePriceCond,
            standardPriceCond
          ]
        }
      ];
    }

    // 4. Sorting rules
    let sortQuery = {};
    if (search) {
      sortQuery = { score: { $meta: 'textScore' } };
    }

    switch (sort) {
      case 'price_asc':
        sortQuery.price = 1;
        break;
      case 'price_desc':
        sortQuery.price = -1;
        break;
      case 'newest':
        sortQuery.createdAt = -1;
        break;
      case 'rating':
        sortQuery.averageRating = -1;
        break;
      case 'name_asc':
        sortQuery.name = 1;
        break;
      case 'name_desc':
        sortQuery.name = -1;
        break;
      default:
        if (!search) {
          sortQuery.createdAt = -1;
        }
    }

    const skipVal = (page - 1) * limit;
    const selectProjection = search ? { score: { $meta: 'textScore' } } : {};

    // Parallelize operations to reduce DB network wait-time
    const [totalItems, items] = await Promise.all([
      this.model.countDocuments(filterQuery),
      this.model.find(filterQuery, selectProjection)
        .sort(sortQuery)
        .skip(skipVal)
        .limit(limit)
        .populate('categoryId', 'name slug')
    ]);

    return {
      products: items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    };
  }
}
