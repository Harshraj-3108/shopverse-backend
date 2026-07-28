// backend/src/validators/order.validator.js

import { z } from 'zod';

/**
 * Validation schema for placing a product order.
 */
export const placeOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().trim().min(1, 'Recipient full name is required'),
    street: z.string().trim().min(1, 'Street address is required'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State/province is required'),
    zipCode: z.string().trim().min(1, 'Postal zip code is required'),
    country: z.string().trim().min(1, 'Country is required'),
    phone: z.string().trim().min(10, 'Recipient phone must be at least 10 digits'),
  }),
  paymentMode: z.enum(['COD', 'ONLINE'], {
    errorMap: () => ({ message: 'Payment mode must be either COD or ONLINE' }),
  }),
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
});
