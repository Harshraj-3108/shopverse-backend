// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import logger from './config/logger.js';
import { AppError } from './errors/AppError.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// ─── Compression ─────────────────────────────────────────────────────────────
// Compress all HTTP responses (gzip) — reduces payload sizes by 60-80%
// Threshold: 1KB (smaller responses don't benefit from compression overhead)
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      // Don't compress Server-Sent Events streams
      if (req.headers['accept'] === 'text/event-stream') return false;
      return compression.filter(req, res);
    },
  })
);

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} – IP: ${req.ip}`);
  next();
});

// ─── Global API Rate Limiter ──────────────────────────────────────────────────
// Applied to all /api/v1 routes: 200 req / 15 min per IP
app.use('/api/v1', globalRateLimiter);

// ─── Standard Health Route ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Test Error Endpoint (dev only) ──────────────────────────────────────────
app.get('/test-error', (req, res, next) => {
  next(
    AppError.badRequest('This is a test validation error!', 'TEST_VALIDATION_ERROR', {
      field: 'test_input',
      issue: 'invalid input',
    })
  );
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── 404 Fallback ────────────────────────────────────────────────────────────
app.use('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
