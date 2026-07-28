// backend/src/models/Order.js

import mongoose from 'mongoose';

// Sub-schema mapping product snaps inside the order document
const orderItemSchema = new mongoose.Schema(
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
    // Snapshot fields to protect historical transaction logs against catalog edits
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

// Sub-schema mapping shipping address snapshots
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

// Order Schema mapping
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ['COD', 'ONLINE'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up user order history queries
orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
