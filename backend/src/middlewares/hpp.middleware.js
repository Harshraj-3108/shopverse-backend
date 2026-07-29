// backend/src/middlewares/hpp.middleware.js

import hppLib from 'hpp';

/**
 * HTTP Parameter Pollution (HPP) protection middleware.
 *
 * HPP attacks submit duplicate query parameters to confuse the application
 * and potentially bypass validation or exploit array handling quirks.
 *
 * Example attack:
 *   GET /products?sort=price_asc&sort=__proto__
 *   → Without HPP protection, req.query.sort becomes ['price_asc', '__proto__']
 *
 * Strategy:
 *   - By default: keeps the LAST value when duplicates exist.
 *   - Whitelist: parameters that are legitimately arrays (e.g. filters)
 *     are excluded from HPP protection.
 *
 * Whitelisted params are those expected to appear multiple times (arrays):
 *   - (none in current API — all params are singular)
 */
export const hppProtection = hppLib({
  // Parameters whitelisted from HPP protection (may legitimately be arrays)
  whitelist: [
    // Example: 'tags', 'categories' if we support multi-value filters in future
  ],
});
