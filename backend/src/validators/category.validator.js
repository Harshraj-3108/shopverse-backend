// src/validators/category.validator.js

import { z } from 'zod';

// Regex to validate MongoDB ObjectIds
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for creating a category.
 */
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Name too long'),
  description: z.string().trim().max(500, 'Description too long').optional(),
  parentId: z.string().regex(objectIdRegex, 'Invalid parent category ID').nullable().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Validation schema for updating a category.
 */
export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Name too long').optional(),
  description: z.string().trim().max(500, 'Description too long').optional(),
  parentId: z.string().regex(objectIdRegex, 'Invalid parent category ID').nullable().optional(),
  isActive: z.boolean().optional(),
});
