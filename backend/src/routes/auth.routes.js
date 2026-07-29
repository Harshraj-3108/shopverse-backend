// src/routes/auth.routes.js

import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
  authRateLimiter,
  passwordResetRateLimiter,
} from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

// Public routes for authorization
// Auth endpoints are protected against brute-force with dedicated rate limiters
router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', passwordResetRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
