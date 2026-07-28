// src/services/auth.service.js

import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { emailService } from './email.service.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { tokenUtil } from '../utils/token.js';
import { TokenBlacklist } from '../models/TokenBlacklist.js';

const userRepository = new UserRepository();

/**
 * Service mapping orchestrating authentication business rules.
 */
export const authService = {
  /**
   * Register a new user in the database.
   * Checks for duplicate emails, creates the record, and dispatches the verification token.
   * @param {Object} userData - Request signup payload
   */
  signup: async (userData) => {
    const { name, email, password, phone } = userData;

    // Verify user duplication
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict('Email address is already registered', ERROR_CODES.CONFLICT);
    }

    // Generate cryptographic email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Persist new User document
    const newUser = await userRepository.create({
      name,
      email,
      password,
      phone,
      emailVerificationToken,
    });

    // Send onboarding email (non-blocking thread)
    emailService.sendVerificationEmail(newUser.email, newUser.name, emailVerificationToken);

    // Return sanitized document attributes
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
    };
  },

  /**
   * Verify a user email via token.
   * @param {string} token - Email verification token
   */
  verifyEmail: async (token) => {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw AppError.badRequest('Invalid or expired email verification token', ERROR_CODES.BAD_REQUEST);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return { email: user.email, isEmailVerified: true };
  },

  /**
   * Log in user and generate access and refresh tokens.
   * @param {Object} credentials - email and password
   */
  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password', ERROR_CODES.UNAUTHORIZED);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password', ERROR_CODES.UNAUTHORIZED);
    }

    // Enforce email verification before logging in
    if (!user.isEmailVerified) {
      throw AppError.unauthorized('Please verify your email address before logging in.', ERROR_CODES.UNAUTHORIZED);
    }

    // Generate tokens
    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = tokenUtil.generateAccessToken(payload);
    const refreshToken = tokenUtil.generateRefreshToken({ id: user._id });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  /**
   * Rotate access tokens using a valid refresh token.
   * @param {string} refreshToken
   */
  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw AppError.unauthorized('Refresh token is required', ERROR_CODES.UNAUTHORIZED);
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (isBlacklisted) {
      throw AppError.unauthorized('Session has expired. Please log in again.', ERROR_CODES.UNAUTHORIZED);
    }

    try {
      const decoded = tokenUtil.verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(decoded.id);
      
      if (!user) {
        throw AppError.unauthorized('Invalid session user', ERROR_CODES.UNAUTHORIZED);
      }

      const payload = { id: user._id, email: user.email, role: user.role };
      const newAccessToken = tokenUtil.generateAccessToken(payload);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw AppError.unauthorized('Invalid or expired refresh token', ERROR_CODES.UNAUTHORIZED);
    }
  },

  /**
   * Log out user and blacklist their refresh token.
   * @param {string} refreshToken
   */
  logout: async (refreshToken) => {
    if (!refreshToken) {
      throw AppError.badRequest('Refresh token is required to log out', ERROR_CODES.BAD_REQUEST);
    }

    try {
      const decoded = tokenUtil.verifyRefreshToken(refreshToken);
      const expiresAt = new Date(decoded.exp * 1000);

      // Blacklist token
      await TokenBlacklist.create({
        token: refreshToken,
        expiresAt,
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      // If token is already expired or malformed, we can just say success to the client
      return { message: 'Logged out successfully' };
    }
  },

  /**
   * Generate password recovery token and email reset link.
   * @param {string} email
   */
  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Avoid revealing if email exists to prevent user enumeration
      return { message: 'If the email exists, a password reset link has been dispatched.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send email
    emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return { message: 'If the email exists, a password reset link has been dispatched.' };
  },

  /**
   * Reset user password.
   * @param {string} token
   * @param {string} newPassword
   */
  resetPassword: async (token, newPassword) => {
    const user = await userRepository.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw AppError.badRequest('Password reset token is invalid or has expired', ERROR_CODES.BAD_REQUEST);
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password has been successfully updated' };
  },
};
