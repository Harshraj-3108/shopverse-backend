// src/middlewares/auth.middleware.js

import { tokenUtil } from '../utils/token.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Authentication check middleware protecting endpoints.
 * Validates the Authorization bearer token and maps payload to req.user.
 */
export const protect = (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token missing or invalid', ERROR_CODES.UNAUTHORIZED));
    }

    // Verify access token validity
    const decoded = tokenUtil.verifyAccessToken(token);
    req.user = decoded; // Attach payload (id, email, role)
    next();
  } catch (error) {
    let message = 'Not authorized to access this resource';
    if (error.name === 'TokenExpiredError') {
      message = 'Authentication token expired';
    }
    next(AppError.unauthorized(message, ERROR_CODES.UNAUTHORIZED));
  }
};

/**
 * Authorization role gate middleware.
 * Restricts access to routes based on user role.
 * @param {...string} roles - Permitted roles (e.g. 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden('User does not have access permissions for this resource', ERROR_CODES.FORBIDDEN));
    }
    next();
  };
};
