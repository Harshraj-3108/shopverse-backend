// backend/src/models/Wishlist.js

import mongoose from 'mongoose';

/**
 * Wishlist Mongoose Schema.
 * Maps user key favorites products references.
 */
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
