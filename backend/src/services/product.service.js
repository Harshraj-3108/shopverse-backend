// backend/src/services/product.service.js

import { ProductRepository } from '../repositories/product.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { imageService } from './image.service.js';
import { cacheService, CACHE_KEYS, CACHE_TTL } from './cache.service.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();

/**
 * Service to orchestrate Product CRUD actions, ImageKit updates, and Redis caching.
 */
export const productService = {
  /**
   * Create a new product (Admin only).
   * Invalidates product list and homepage caches.
   * @param {Object} productData - Creation payload
   */
  createProduct: async (productData) => {
    const { name, sku, description, price, salePrice, stockQuantity, categoryId, attributes, isActive } = productData;

    // Check SKU conflicts
    const existingSku = await productRepository.findBySku(sku);
    if (existingSku) {
      throw AppError.conflict(`Product with SKU '${sku}' already exists`, ERROR_CODES.CONFLICT);
    }

    // Verify category exists
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw AppError.notFound('Category reference not found', ERROR_CODES.NOT_FOUND);
    }

    const product = await productRepository.create({
      name,
      sku: sku.toUpperCase(),
      description,
      price,
      salePrice,
      stockQuantity,
      categoryId,
      attributes,
      isActive,
    });

    // Invalidate product listings and homepage caches
    await cacheService.invalidateProducts();

    return product;
  },

  /**
   * Update product properties (Admin only).
   * Invalidates affected product detail and listing caches.
   * @param {string} id - Product identifier
   * @param {Object} updateData - Modifiable attributes
   */
  updateProduct: async (id, updateData) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
    }

    const { sku, categoryId } = updateData;

    // Check SKU conflicts on change
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingSku = await productRepository.findBySku(sku);
      if (existingSku) {
        throw AppError.conflict(`Product with SKU '${sku}' already exists`, ERROR_CODES.CONFLICT);
      }
      product.sku = sku.toUpperCase();
    }

    // Verify category exists on change
    if (categoryId && categoryId.toString() !== product.categoryId.toString()) {
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw AppError.notFound('Category reference not found', ERROR_CODES.NOT_FOUND);
      }
      product.categoryId = categoryId;
    }

    // Apply updates
    const oldSlug = product.slug;
    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.description !== undefined) product.description = updateData.description;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.salePrice !== undefined) product.salePrice = updateData.salePrice;
    if (updateData.stockQuantity !== undefined) product.stockQuantity = updateData.stockQuantity;
    if (updateData.attributes !== undefined) product.attributes = updateData.attributes;
    if (updateData.isActive !== undefined) product.isActive = updateData.isActive;

    await product.save();

    // Invalidate product detail cache (old slug and new slug if changed)
    await cacheService.invalidateProductDetail(oldSlug);
    if (product.slug !== oldSlug) {
      await cacheService.invalidateProductDetail(product.slug);
    }
    await cacheService.invalidateProductById(id);
    await cacheService.invalidateProducts();

    return product;
  },

  /**
   * Delete a product and its associated cloud image assets.
   * Invalidates all product caches.
   * @param {string} id - Product identifier
   */
  deleteProduct: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
    }

    // Delete associated remote cloud image assets from ImageKit
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await imageService.deleteImage(img.fileId);
      }
    }

    const slug = product.slug;
    await productRepository.deleteById(id);

    // Purge all related caches
    await cacheService.invalidateProductDetail(slug);
    await cacheService.invalidateProductById(id);
    await cacheService.invalidateProducts();

    return { id, message: 'Product deleted successfully.' };
  },

  /**
   * Upload and link multiple image files to the target product catalog.
   * Invalidates product detail cache on success.
   * @param {string} productId - Product identifier
   * @param {Array} files - Multer files array
   */
  uploadProductImages: async (productId, files) => {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
    }

    if (!files || files.length === 0) {
      throw AppError.badRequest('No image files uploaded', ERROR_CODES.BAD_REQUEST);
    }

    const uploadedImages = [];
    for (const file of files) {
      const result = await imageService.uploadImage(
        file.buffer,
        `${product.slug}-${Date.now()}-${file.originalname}`
      );
      uploadedImages.push({
        url: result.url,
        fileId: result.fileId,
        isPrimary: false,
      });
    }

    // Mark first uploaded image as primary if none currently exist
    const hasPrimary = product.images.some((img) => img.isPrimary);
    if (!hasPrimary && uploadedImages.length > 0) {
      uploadedImages[0].isPrimary = true;
    }

    product.images.push(...uploadedImages);
    await product.save();

    // Invalidate product detail and listing caches
    await cacheService.invalidateProductDetail(product.slug);
    await cacheService.invalidateProductById(productId);
    await cacheService.invalidateProducts();

    return product.images;
  },

  /**
   * Retrieve paginated catalog list matching query filters.
   * Results are served from Redis cache when available.
   * @param {Object} queryParams
   */
  listProducts: async (queryParams) => {
    const { page, limit, sort, search, categoryId, minPrice, maxPrice } = queryParams;

    const cacheKey = search
      ? CACHE_KEYS.SEARCH(search, page, limit)
      : CACHE_KEYS.PRODUCTS_LIST({ page, limit, sort, categoryId, minPrice, maxPrice });

    const ttl = search ? CACHE_TTL.SEARCH_RESULTS : CACHE_TTL.PRODUCTS_LIST;

    return await cacheService.remember(cacheKey, async () => {
      const filters = { search, categoryId, minPrice, maxPrice };
      const options = { page, limit, sort };
      return await productRepository.findProductsAdvanced(filters, options);
    }, ttl);
  },

  /**
   * Fetch a single active product details using its unique slug value.
   * Result is served from Redis cache when available.
   * @param {string} slug
   */
  getProductBySlug: async (slug) => {
    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(slug);

    return await cacheService.remember(cacheKey, async () => {
      const product = await productRepository.model
        .findOne({ slug, isActive: true })
        .populate('categoryId', 'name slug')
        .lean();

      if (!product) {
        throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
      }

      return product;
    }, CACHE_TTL.PRODUCT_DETAIL);
  },
};
