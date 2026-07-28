// backend/src/validators/wishlist.validator.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for modifying wishlist items.
 */
export const wishlistProductSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
});
