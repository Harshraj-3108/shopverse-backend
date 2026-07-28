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

const router = express.Router();

// Public routes for authorization
router.post('/signup', validate(signupSchema), authController.signup);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
