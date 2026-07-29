// backend/src/validators/order.validator.js

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, 'Recipient full name is required'),
  street: z.string().trim().min(1, 'Street address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State/province is required'),
  zipCode: z.string().trim().min(1, 'Postal zip code is required'),
  country: z.string().trim().min(1, 'Country is required'),
  phone: z.string().trim().min(10, 'Recipient phone must be at least 10 digits'),
});

// ---------------------------------------------------------------------------
// Customer – Place order
// ---------------------------------------------------------------------------

/**
 * Validation schema for the place-order request body.
 */
export const placeOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMode: z.enum(['COD', 'ONLINE'], {
    errorMap: () => ({ message: 'Payment mode must be either COD or ONLINE' }),
  }),
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
});

// ---------------------------------------------------------------------------
// Customer – Cancel order
// ---------------------------------------------------------------------------

/**
 * Validation schema for the customer cancel-order request body.
 */
export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(500, 'Cancellation reason cannot exceed 500 characters').optional(),
});

// ---------------------------------------------------------------------------
// Admin – Update order status
// ---------------------------------------------------------------------------

/**
 * Validation schema for admin order status update.
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({
      message: 'Status must be one of: pending, processing, shipped, delivered, cancelled',
    }),
  }),
  description: z
    .string()
    .trim()
    .max(500, 'Status description cannot exceed 500 characters')
    .optional(),
});

// ---------------------------------------------------------------------------
// Admin – Add/update shipping info
// ---------------------------------------------------------------------------

/**
 * Validation schema for adding courier/tracking information to an order.
 */
export const updateShippingInfoSchema = z
  .object({
    trackingId: z.string().trim().min(1, 'Tracking ID is required').optional(),
    courier: z.string().trim().min(1, 'Courier name is required').optional(),
    trackingUrl: z.string().url('Tracking URL must be a valid URL').optional(),
    estimatedDelivery: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        { message: 'Estimated delivery must be a valid date string' }
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one shipping info field must be provided',
  });

// ---------------------------------------------------------------------------
// Admin – Update delivery timeline only
// ---------------------------------------------------------------------------

/**
 * Validation schema for updating just the estimated delivery date.
 */
export const updateDeliveryTimelineSchema = z.object({
  estimatedDelivery: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'estimatedDelivery must be a valid ISO date string',
    }),
});

// ---------------------------------------------------------------------------
// Admin – List orders query filters
// ---------------------------------------------------------------------------

/**
 * Validation schema for admin order list query parameters.
 */
export const adminOrderQuerySchema = z.object({
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  userId: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().trim().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, 'Page must be at least 1')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(100, 'Limit cannot exceed 100')),
});

// ---------------------------------------------------------------------------
// Customer – Get orders query (pagination)
// ---------------------------------------------------------------------------

/**
 * Validation schema for customer order list query parameters.
 */
export const customerOrderQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(50)),
});
