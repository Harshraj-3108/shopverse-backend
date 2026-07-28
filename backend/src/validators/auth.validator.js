// src/validators/auth.validator.js

import { z } from 'zod';

/**
 * Validation schema for auth signup payload.
 */
export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password cannot exceed 50 characters'),
  phone: z.string().trim().optional(),
});

/**
 * Validation schema for auth login payload.
 */
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Validation schema for email verification.
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Validation schema for requesting password reset.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

/**
 * Validation schema for submitting password reset.
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'New password must be at least 6 characters long'),
});
