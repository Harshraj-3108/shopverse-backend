// src/middlewares/validator.middleware.js

import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Express middleware to validate request payloads (body) using Zod.
 * @param {z.ZodSchema} schema - Zod validator schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.format();
      return next(AppError.badRequest('Validation failed', ERROR_CODES.VALIDATION_ERROR, details));
    }
    req.body = result.data; // Assign verified data back
    next();
  };
};

/**
 * Express middleware to validate request query parameters using Zod.
 * @param {z.ZodSchema} schema - Zod validator schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.format();
      return next(AppError.badRequest('Query parameters validation failed', ERROR_CODES.VALIDATION_ERROR, details));
    }
    req.query = result.data; // Assign verified/coerced data back (including default options)
    next();
  };
};
