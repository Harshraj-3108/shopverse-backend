// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import { AppError } from './errors/AppError.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Global Request Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging Middleware using Winston
app.use((req, res, next) => {
  logger.info(`Incoming Request - Method: ${req.method} | URL: ${req.originalUrl} | IP: ${req.ip}`);
  next();
});

// Standard Application Health Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mock endpoint to test the Error Handling Pipeline
app.get('/test-error', (req, res, next) => {
  next(AppError.badRequest('This is a test validation error!', 'TEST_VALIDATION_ERROR', { field: 'test_input', issue: 'invalid input' }));
});

// Mount Centralized API Routes
app.use('/api/v1', apiRoutes);

// Fallback for 404 Route Not Found errors forwarding to error handler
app.use('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
});

// Global Error Handler Middleware (MUST be registered last)
app.use(errorMiddleware);

export default app;


