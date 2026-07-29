// backend/src/config/helmet.js

/**
 * Helmet configuration for comprehensive HTTP security headers.
 *
 * Headers applied:
 *  - Content-Security-Policy (CSP)         – prevents XSS injection
 *  - X-Content-Type-Options: nosniff       – prevents MIME sniffing
 *  - X-Frame-Options: DENY                 – prevents clickjacking
 *  - X-XSS-Protection: 0                  – disables legacy XSS filter (CSP is better)
 *  - Strict-Transport-Security (HSTS)      – forces HTTPS
 *  - Referrer-Policy                       – controls referrer leakage
 *  - Permissions-Policy                    – restricts browser features
 *  - Cross-Origin-Opener-Policy
 *  - Cross-Origin-Resource-Policy
 */
export const helmetOptions = {
  // Content-Security-Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles (Swagger UI)
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // HTTP Strict Transport Security (HSTS)
  // Forces HTTPS for 1 year; included in browser preload lists
  strictTransportSecurity: {
    maxAge: 31536000,        // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // Referrer policy — prevents leaking full URL in referrer header
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-Content-Type-Options: nosniff — prevents MIME type sniffing
  noSniff: true,

  // X-Frame-Options: DENY — prevents clickjacking
  frameguard: { action: 'deny' },

  // Disable X-Powered-By header (remove Express fingerprint)
  hidePoweredBy: true,

  // DNS prefetch control
  dnsPrefetchControl: { allow: false },

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'same-origin' },
};
