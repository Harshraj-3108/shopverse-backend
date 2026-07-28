// src/middlewares/error.middleware.js

import { errorHandler } from '../errors/errorHandler.js';
import { env } from '../config/environment.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Express Error Handler middleware.
 * Intercepts all next(error) invocations, logs via winston, and builds formatted responses.
 */
export const errorMiddleware = (err, req, res, next) => {
  // Delegate error logging to central processor
  errorHandler.handleError(err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected server error occurred';
  const details = err.details || null;

  // Build clean API output structure
  const responsePayload = {
    status: 'error',
    statusCode,
    errorCode,
    message,
    ...(details && { details }),
    // Only leak stack details when explicitly in development environment
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(responsePayload);
};
