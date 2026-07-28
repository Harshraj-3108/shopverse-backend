// src/validators/user.validator.js

import { z } from 'zod';

/**
 * Validation schema for updating user profile.
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').optional(),
  phone: z.string().trim().min(5, 'Phone must be a valid number').optional(),
});

/**
 * Validation schema for creating a new address.
 */
export const addressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zipCode: z.string().trim().min(1, 'Zip code is required'),
  country: z.string().trim().min(1, 'Country is required'),
  isDefault: z.boolean().default(false),
});

/**
 * Validation schema for updating an existing address.
 */
export const updateAddressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required').optional(),
  city: z.string().trim().min(1, 'City is required').optional(),
  state: z.string().trim().min(1, 'State is required').optional(),
  zipCode: z.string().trim().min(1, 'Zip code is required').optional(),
  country: z.string().trim().min(1, 'Country is required').optional(),
  isDefault: z.boolean().optional(),
});
