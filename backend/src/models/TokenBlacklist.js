// src/models/TokenBlacklist.js

import mongoose from 'mongoose';

/**
 * TokenBlacklist Mongoose Schema.
 * Used for tracking revoked refresh tokens during logout or session invalidation.
 * Employs a TTL index on expiresAt for automatic deletion.
 */
const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Document self-destructs when current system date exceeds expiresAt
    },
  },
  {
    timestamps: true,
  }
);

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
