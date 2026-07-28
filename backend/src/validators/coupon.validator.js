// backend/src/validators/coupon.validator.js

import { z } from 'zod';

/**
 * Validation schema for admin coupon creations.
 */
export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(20).toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0, 'Value cannot be negative'),
  minOrderValue: z.number().min(0, 'Minimum order value cannot be negative').optional().default(0),
  maxDiscount: z.number().min(0, 'Maximum discount cannot be negative').optional(),
  expiryDate: z.coerce.date().refine(val => val > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  usageLimit: z.number().int().min(1, 'Usage limit must be at least 1'),
  perUserLimit: z.number().int().min(1, 'Per user limit must be at least 1').optional().default(1),
  isActive: z.boolean().optional().default(true),
});

/**
 * Validation schema for updating coupon.
 */
export const updateCouponSchema = createCouponSchema.partial();

/**
 * Validation schema for applying a coupon code.
 */
export const applyCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code is required').toUpperCase(),
});
