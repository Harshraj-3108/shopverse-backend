import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import logger from './config/logger.js';
import { corsOptions } from './config/cors.js';
import { helmetOptions } from './config/helmet.js';
import { AppError } from './errors/AppError.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { mongoSanitize, xssSanitize } from './middlewares/sanitize.middleware.js';
import { hppProtection } from './middlewares/hpp.middleware.js';
import apiRoutes from './routes/index.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('../swagger.json');


const app = express();

// ─── 1. Security Headers (Helmet) ────────────────────────────────────────────
// Must be first — sets secure HTTP headers before any response can be sent.
// Applies: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.
app.use(helmet(helmetOptions));

// ─── 2. CORS ─────────────────────────────────────────────────────────────────
// Configured whitelist-based CORS with credentials support for cookie-based auth.
app.use(cors(corsOptions));

// ─── 3. Compression ──────────────────────────────────────────────────────────
// Compress all HTTP responses ≥ 1KB (gzip) — reduces payload sizes by 60-80%.
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['accept'] === 'text/event-stream') return false;
      return compression.filter(req, res);
    },
  })
);

// ─── 4. Body Parsing ─────────────────────────────────────────────────────────
// Strict size limits prevent large payload attacks.
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── 5. MongoDB Query Injection Sanitization ─────────────────────────────────
// Removes $ and . from req.body, req.query, req.params to prevent NoSQL injection.
app.use(mongoSanitize);

// ─── 6. XSS Sanitization ─────────────────────────────────────────────────────
// Escapes HTML special characters in request inputs to prevent XSS attacks.
app.use(xssSanitize);

// ─── 7. HTTP Parameter Pollution Protection ───────────────────────────────────
// Keeps only the last value when duplicate query params are submitted.
app.use(hppProtection);

// ─── 8. HTTP Request Logger ───────────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} – IP: ${req.ip}`);
  next();
});

// ─── 9. Global API Rate Limiter ───────────────────────────────────────────────
// Applied to all /api/v1 routes: 200 req / 15 min per IP.
// Individual endpoints have stricter limits (auth, password reset, search).
app.use('/api/v1', globalRateLimiter);

// ─── 10. Standard Health Route ────────────────────────────────────────────────
// Excluded from rate limiting and authentication.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 11. API Docs (development only) ─────────────────────────────────────────
// Interactive Swagger UI at GET /api/v1/docs
// Disabled in production to avoid exposing internal API structure.
if (process.env.NODE_ENV !== 'production') {
  app.use(
    '/api/v1/docs',
    // Override CSP for swagger-ui (it requires inline scripts/styles)
    (req, res, next) => {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
      );
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'ShopVerse API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );
}

// ─── 12. API Routes ───────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── 12. 404 Fallback ────────────────────────────────────────────────────────
app.use('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
});

// ─── 13. Global Error Handler (must be last) ─────────────────────────────────
app.use(errorMiddleware);

export default app;
