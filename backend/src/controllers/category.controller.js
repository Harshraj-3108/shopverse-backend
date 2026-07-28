// src/controllers/category.controller.js

import { categoryService } from '../services/category.service.js';

/**
 * Controller mapping Category HTTP routing endpoints.
 */
export const categoryController = {
  /**
   * Create a new category (Admin only).
   */
  createCategory: async (req, res, next) => {
    try {
      const result = await categoryService.createCategory(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Category created successfully.',
        data: {
          category: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update category fields (Admin only).
   */
  updateCategory: async (req, res, next) => {
    try {
      const result = await categoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully.',
        data: {
          category: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch category details using its unique slug (Public).
   */
  getCategoryBySlug: async (req, res, next) => {
    try {
      const result = await categoryService.getCategoryBySlug(req.params.slug);
      res.status(200).json({
        status: 'success',
        data: {
          category: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve list of categories, optionally formatted as a nested tree (Public).
   */
  getCategories: async (req, res, next) => {
    try {
      const format = req.query.format || 'flat';
      const result = await categoryService.getCategories(format);
      res.status(200).json({
        status: 'success',
        data: {
          categories: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove a category (Admin only).
   */
  deleteCategory: async (req, res, next) => {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
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
};
