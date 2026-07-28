// backend/src/controllers/product.controller.js

import { productService } from '../services/product.service.js';

/**
 * Controller routing Product HTTP operations and file upload streams.
 */
export const productController = {
  /**
   * Create a new product entry (Admin only).
   */
  createProduct: async (req, res, next) => {
    try {
      const result = await productService.createProduct(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Product created successfully.',
        data: {
          product: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update details of an existing product (Admin only).
   */
  updateProduct: async (req, res, next) => {
    try {
      const result = await productService.updateProduct(req.params.id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully.',
        data: {
          product: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a product and purge its image attachments (Admin only).
   */
  deleteProduct: async (req, res, next) => {
    try {
      const result = await productService.deleteProduct(req.params.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          id: result.id,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload and bind multiple images to a product details page (Admin only).
   */
  uploadImages: async (req, res, next) => {
    try {
      const result = await productService.uploadProductImages(req.params.id, req.files);

      res.status(200).json({
        status: 'success',
        message: 'Images uploaded and processed successfully.',
        data: {
          images: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Public list and search of product catalogs.
   */
  listProducts: async (req, res, next) => {
    try {
      const result = await productService.listProducts(req.query);
      res.status(200).json({
        status: 'success',
        data: {
          products: result.products,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch single product details using its unique slug value.
   */
  getProductBySlug: async (req, res, next) => {
    try {
      const result = await productService.getProductBySlug(req.params.slug);
      res.status(200).json({
        status: 'success',
        data: {
          product: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
