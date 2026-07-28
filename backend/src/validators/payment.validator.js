// backend/src/validators/payment.validator.js

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for initializing a payment transaction order session.
 */
export const initializePaymentSchema = z.object({
  orderId: z.string().regex(objectIdRegex, 'Invalid order ID'),
});

/**
 * Validation schema for verifying client payment signatures.
 */
export const verifyPaymentSchema = z.object({
  orderId: z.string().regex(objectIdRegex, 'Invalid order ID'),
  gatewayPaymentId: z.string().trim().min(1, 'Gateway payment reference ID is required'),
  signature: z.string().trim().min(1, 'Gateway payment signature is required'),
  gatewayOrderId: z.string().trim().min(1, 'Gateway order tracking ID is required').optional(),
});
