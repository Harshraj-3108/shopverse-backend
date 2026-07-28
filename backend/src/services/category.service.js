// src/services/category.service.js

import { CategoryRepository } from '../repositories/category.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const categoryRepository = new CategoryRepository();

/**
 * Service to orchestrate category configurations and hierarchy calculations.
 */
export const categoryService = {
  /**
   * Create a new product category.
   * @param {Object} categoryData
   */
  createCategory: async (categoryData) => {
    const { name, description, parentId, isActive } = categoryData;

    // Check parent validity
    if (parentId) {
      const parent = await categoryRepository.findById(parentId);
      if (!parent) {
        throw AppError.notFound('Parent category not found', ERROR_CODES.NOT_FOUND);
      }
    }

    const category = await categoryRepository.create({
      name,
      description,
      parentId: parentId || null,
      isActive,
    });

    return category;
  },

  /**
   * Update category fields.
   * @param {string} id - Target category identifier
   * @param {Object} updateData
   */
  updateCategory: async (id, updateData) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found', ERROR_CODES.NOT_FOUND);
    }

    const { parentId } = updateData;

    if (parentId) {
      if (parentId === id) {
        throw AppError.badRequest('A category cannot be its own parent', ERROR_CODES.BAD_REQUEST);
      }

      // Check parent category existence
      const parent = await categoryRepository.findById(parentId);
      if (!parent) {
        throw AppError.notFound('Parent category not found', ERROR_CODES.NOT_FOUND);
      }

      // Circular references check: ensure parent is not a child of the current category
      let currentParent = parent;
      while (currentParent) {
        if (currentParent.parentId && currentParent.parentId.toString() === id) {
          throw AppError.badRequest('Circular reference detected: Parent category is a descendant of the current category', ERROR_CODES.BAD_REQUEST);
        }
        if (!currentParent.parentId) break;
        currentParent = await categoryRepository.findById(currentParent.parentId);
      }
    }

    // Apply updates
    if (updateData.name !== undefined) category.name = updateData.name;
    if (updateData.description !== undefined) category.description = updateData.description;
    if (updateData.parentId !== undefined) category.parentId = updateData.parentId || null;
    if (updateData.isActive !== undefined) category.isActive = updateData.isActive;

    await category.save(); // Save to trigger pre-save slugify hooks
    return category;
  },

  /**
   * Fetch category detail by its unique slug.
   * @param {string} slug
   */
  getCategoryBySlug: async (slug) => {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw AppError.notFound('Category not found', ERROR_CODES.NOT_FOUND);
    }
    return category;
  },

  /**
   * Get all categories. Optionally constructs a nested tree hierarchy.
   * @param {string} format - format mode (e.g. 'tree' or 'flat')
   */
  getCategories: async (format = 'flat') => {
    const categories = await categoryRepository.find({}, { limit: 1000, sort: { name: 1 } });

    if (format === 'tree') {
      return categoryService.buildTree(categories, null);
    }

    return categories;
  },

  /**
   * Delete a category. Fails if subcategories are referencing this category.
   * @param {string} id - Category identifier
   */
  deleteCategory: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found', ERROR_CODES.NOT_FOUND);
    }

    // Block deletion if active nested subcategories are linked
    const subcategoriesCount = await categoryRepository.count({ parentId: id });
    if (subcategoriesCount > 0) {
      throw AppError.badRequest('Cannot delete category containing subcategories. Relocate or delete children subcategories first.', ERROR_CODES.BAD_REQUEST);
    }

    await categoryRepository.deleteById(id);
    return { id, message: 'Category deleted successfully.' };
  },

  /**
   * Helper to build a nested JSON category tree.
   * @param {Array} categories - Flat list of categories
   * @param {string|null} parentId - Parent filter
   */
  buildTree: (categories, parentId = null) => {
    const tree = [];
    
    categories.forEach(cat => {
      const catParentId = cat.parentId ? cat.parentId.toString() : null;
      const targetParentId = parentId ? parentId.toString() : null;

      if (catParentId === targetParentId) {
        const children = categoryService.buildTree(categories, cat._id);
        const node = {
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          isActive: cat.isActive,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        };

        if (children.length > 0) {
          node.children = children;
        }
        tree.push(node);
      }
    });

    return tree;
  },
};
