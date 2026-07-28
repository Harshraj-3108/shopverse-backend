// backend/src/validators/product.validator.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for creating a product.
 */
export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(150, 'Name too long'),
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters long').max(50, 'SKU too long'),
  description: z.string().trim().min(1, 'Product description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  salePrice: z.number().min(0, 'Sale price must be a positive number').optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be at least 0'),
  categoryId: z.string().regex(objectIdRegex, 'Invalid category ID'),
  attributes: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
}).refine(data => !data.salePrice || data.salePrice < data.price, {
  message: 'Sale price must be lower than standard price',
  path: ['salePrice']
});

/**
 * Validation schema for updating a product.
 */
export const updateProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(150, 'Name too long').optional(),
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters').optional(),
  description: z.string().trim().min(1, 'Product description is required').optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  salePrice: z.number().min(0, 'Sale price must be positive').optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be at least 0').optional(),
  categoryId: z.string().regex(objectIdRegex, 'Invalid category ID').optional(),
  attributes: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
}).refine(data => {
  if (data.salePrice !== undefined && data.price !== undefined) {
    return data.salePrice < data.price;
  }
  return true;
}, {
  message: 'Sale price must be lower than standard price',
  path: ['salePrice']
});

/**
 * Validation schema for listing products.
 */
export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'name_asc', 'name_desc']).default('newest'),
  search: z.string().trim().optional(),
  categoryId: z.string().regex(objectIdRegex, 'Invalid category ID').optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});
