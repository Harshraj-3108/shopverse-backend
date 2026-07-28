// src/controllers/auth.controller.js

import { authService } from '../services/auth.service.js';

/**
 * Controller mapping auth routing inputs to underlying business services.
 */
export const authController = {
  /**
   * Handle account registration.
   */
  signup: async (req, res, next) => {
    try {
      const result = await authService.signup(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Registration successful! Please check your email to verify your account.',
        data: result,
      });
    } catch (error) {
      next(error); // Forward database or custom errors to errorMiddleware
    }
  },

  /**
   * Handle email verification callback.
   */
  verifyEmail: async (req, res, next) => {
    try {
      const token = req.query.token || req.body.token;
      const result = await authService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully! You can now log in.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user login credentials, issue tokens, and write refresh token to cookies.
   */
  login: async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      // Store refresh token in secure, HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: 'success',
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle access token rotation using a valid refresh token.
   */
  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await authService.refresh(refreshToken);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user logout and clear HTTP-only cookies.
   */
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      await authService.logout(refreshToken);

      // Clear the cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle password recovery requests.
   */
  forgotPassword: async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle password reset submissions.
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
