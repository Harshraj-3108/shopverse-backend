// backend/src/models/Cart.js

import mongoose from 'mongoose';

// Sub-schema mapping cart items
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

// Cart Schema mapping
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    itemCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Dynamically calculate cart totals and product counts
cartSchema.pre('save', function () {
  let computedSubtotal = 0;
  let computedCount = 0;

  this.items.forEach(item => {
    computedSubtotal += item.price * item.quantity;
    computedCount += item.quantity;
  });

  this.subtotal = Number(computedSubtotal.toFixed(2));
  
  // Ensure discount does not exceed subtotal
  this.discount = Math.min(this.discount || 0, this.subtotal);
  this.total = Number((this.subtotal - this.discount).toFixed(2));
  
  this.itemCount = computedCount;
});

export const Cart = mongoose.model('Cart', cartSchema);
