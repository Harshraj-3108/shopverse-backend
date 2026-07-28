// backend/src/services/product.service.js

import { ProductRepository } from '../repositories/product.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { imageService } from './image.service.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();

/**
 * Service to orchestrate Product CRUD actions and ImageKit updates.
 */
export const productService = {
  /**
   * Create a new product.
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

    return await productRepository.create({
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
  },

  /**
   * Update product properties (Admin only).
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
    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.description !== undefined) product.description = updateData.description;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.salePrice !== undefined) product.salePrice = updateData.salePrice;
    if (updateData.stockQuantity !== undefined) product.stockQuantity = updateData.stockQuantity;
    if (updateData.attributes !== undefined) product.attributes = updateData.attributes;
    if (updateData.isActive !== undefined) product.isActive = updateData.isActive;

    await product.save();
    return product;
  },

  /**
   * Delete a product and its associated cloud image assets.
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

    await productRepository.deleteById(id);
    return { id, message: 'Product deleted successfully.' };
  },

  /**
   * Upload and link multiple image files to the target product catalog.
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
      const result = await imageService.uploadImage(file.buffer, `${product.slug}-${Date.now()}-${file.originalname}`);
      uploadedImages.push({
        url: result.url,
        fileId: result.fileId,
        isPrimary: false,
      });
    }

    // Mark first uploaded image as primary if none currently exist
    const hasPrimary = product.images.some(img => img.isPrimary);
    if (!hasPrimary && uploadedImages.length > 0) {
      uploadedImages[0].isPrimary = true;
    }

    product.images.push(...uploadedImages);
    await product.save();

    return product.images;
  },

  /**
   * Retrieve paginated catalog list matching query filters.
   * @param {Object} queryParams
   */
  listProducts: async (queryParams) => {
    const { page, limit, sort, search, categoryId, minPrice, maxPrice } = queryParams;

    const filters = { search, categoryId, minPrice, maxPrice };
    const options = { page, limit, sort };

    return await productRepository.findProductsAdvanced(filters, options);
  },

  /**
   * Fetch a single active product details using its unique slug value.
   * @param {string} slug
   */
  getProductBySlug: async (slug) => {
    const product = await productRepository.model
      .findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug');

    if (!product) {
      throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
    }

    return product;
  },
};
