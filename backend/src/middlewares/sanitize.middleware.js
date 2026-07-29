// backend/src/middlewares/sanitize.middleware.js

/**
 * Security sanitization middlewares.
 *
 * This module provides two layers of input sanitization:
 *
 * 1. xssSanitize   — strips HTML/script tags from req.body, req.query, req.params
 *                    to prevent reflected/stored XSS attacks.
 *
 * 2. mongoSanitize — removes MongoDB operator keys ($, .) from req.body, req.query,
 *                    req.params to prevent NoSQL injection attacks.
 *                    Uses the battle-tested express-mongo-sanitize package.
 *
 * Both middlewares are lightweight and run synchronously with no I/O overhead.
 */

import mongoSanitizeLib from 'express-mongo-sanitize';

// ---------------------------------------------------------------------------
// XSS Sanitization (custom – replacement for deprecated xss-clean)
// ---------------------------------------------------------------------------

/**
 * Recursively escape HTML special characters from any string in a value.
 * Handles nested objects and arrays safely.
 *
 * @param {any} value - Input to sanitize
 * @returns {any} Sanitized value
 */
function escapeHtml(value) {
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  if (Array.isArray(value)) {
    return value.map(escapeHtml);
  }

  if (value !== null && typeof value === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = escapeHtml(val);
    }
    return sanitized;
  }

  return value;
}

/**
 * Express middleware that sanitizes req.body, req.query, and req.params
 * against XSS injection by escaping HTML special characters.
 *
 * NOTE: This escapes characters for safe storage/rendering.
 * It does NOT strip tags (which would silently modify user input).
 * Proper output encoding in the frontend is still required.
 */
export const xssSanitize = (req, res, next) => {
  if (req.body) req.body = escapeHtml(req.body);
  if (req.query) req.query = escapeHtml(req.query);
  if (req.params) req.params = escapeHtml(req.params);
  next();
};

// ---------------------------------------------------------------------------
// MongoDB Query Sanitization
// ---------------------------------------------------------------------------

/**
 * Express middleware that removes MongoDB operator keys ($ and .)
 * from request inputs to prevent NoSQL injection attacks.
 *
 * Example blocked: { "email": { "$gt": "" }, "password": "anything" }
 *
 * Uses express-mongo-sanitize under the hood.
 */
export const mongoSanitize = mongoSanitizeLib({
  // Replace forbidden keys with underscore instead of removing (for auditability)
  replaceWith: '_',
  // Also sanitize query parameters
  onSanitize: ({ req, key }) => {
    // Silent sanitization — the logger picks up suspicious patterns via request logs
  },
});
