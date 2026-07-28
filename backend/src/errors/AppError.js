// src/errors/AppError.js

import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Custom operational error wrapper class.
 * Differentiates anticipated error flows (bad requests, not found, validation failures)
 * from server faults.
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Indicates this error is a known operational error, not a bug

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errorCode = ERROR_CODES.BAD_REQUEST, details = null) {
    return new AppError(message, 400, errorCode, details);
  }

  static unauthorized(message, errorCode = ERROR_CODES.UNAUTHORIZED, details = null) {
    return new AppError(message, 401, errorCode, details);
  }

  static forbidden(message, errorCode = ERROR_CODES.FORBIDDEN, details = null) {
    return new AppError(message, 403, errorCode, details);
  }

  static notFound(message, errorCode = ERROR_CODES.NOT_FOUND, details = null) {
    return new AppError(message, 404, errorCode, details);
  }

  static conflict(message, errorCode = ERROR_CODES.CONFLICT, details = null) {
    return new AppError(message, 409, errorCode, details);
  }

  static internal(message, errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR, details = null) {
    return new AppError(message, 500, errorCode, details);
  }
}
