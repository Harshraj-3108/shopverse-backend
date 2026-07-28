// src/utils/token.js

import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';

/**
 * Utility helpers to sign and verify JSON Web Tokens (JWT).
 */
export const tokenUtil = {
  /**
   * Generate a short-lived access token.
   * @param {Object} payload - User properties to embed (id, role, email)
   * @returns {string} Signed JWT Access Token
   */
  generateAccessToken: (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
  },

  /**
   * Generate a long-lived refresh token.
   * @param {Object} payload - User properties to embed (id)
   * @returns {string} Signed JWT Refresh Token
   */
  generateRefreshToken: (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  },

  /**
   * Verify an access token.
   * @param {string} token - Signed access JWT
   * @returns {Object} Decoded payload
   */
  verifyAccessToken: (token) => {
    return jwt.verify(token, env.JWT_SECRET);
  },

  /**
   * Verify a refresh token.
   * @param {string} token - Signed refresh JWT
   * @returns {Object} Decoded payload
   */
  verifyRefreshToken: (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  },
};
