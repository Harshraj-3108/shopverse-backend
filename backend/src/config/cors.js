// backend/src/config/cors.js

import { env } from './environment.js';

/**
 * CORS configuration factory.
 *
 * Allowed origins:
 *  - In development: localhost variants for React (3000), Next.js (3000/3001),
 *    Vite (5173), and the API server itself.
 *  - In production: reads from CORS_ALLOWED_ORIGINS env variable
 *    (comma-separated list) and always includes the API server origin.
 *
 * Credentials are allowed so that HTTP-only cookies (refresh tokens) are sent
 * cross-origin from the frontend.
 */

const devAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
];

const getAllowedOrigins = () => {
  if (env.NODE_ENV === 'production') {
    const raw = process.env.CORS_ALLOWED_ORIGINS || '';
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return devAllowedOrigins;
};

export const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();

    // Allow server-to-server calls (e.g. Postman, curl) where origin is undefined
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  credentials: true,            // Allow cookies / Authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: [
    'X-Cache',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
  ],
  optionsSuccessStatus: 200,    // Some browsers choke on 204
  maxAge: 86400,                // Pre-flight cache: 24 hours
};
