// backend/src/validators/review.validator.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for submitting a review.
 */
export const createReviewSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().max(1000, 'Comment too long').optional(),
});

/**
 * Validation schema for updating a review.
 */
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  comment: z.string().trim().max(1000, 'Comment too long').optional(),
});

/**
 * Validation schema for listing reviews.
 */
export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
