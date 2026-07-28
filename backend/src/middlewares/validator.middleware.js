// src/middlewares/validator.middleware.js

import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Express middleware to validate request payloads using Zod.
 * If validation fails, forwards an AppError containing errors map to error handler.
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
