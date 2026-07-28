// backend/src/models/Order.js

import mongoose from 'mongoose';

/**
 * Order Mongoose Schema skeleton.
 * Created early to support purchase check boundaries in Product Reviews (Phase 10).
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up purchase verification checks
orderSchema.index({ userId: 1, 'items.productId': 1, status: 1 });

export const Order = mongoose.model('Order', orderSchema);
