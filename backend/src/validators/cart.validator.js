// backend/src/validators/cart.validator.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for adding a product to the cart.
 */
export const addToCartSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

/**
 * Validation schema for updating item quantity in the cart.
 */
export const updateCartItemSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

/**
 * Validation schema for removing an item from the cart.
 */
export const removeFromCartSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
});
