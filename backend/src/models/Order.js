// backend/src/models/Order.js

import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

/** Product snapshot embedded inside an order document */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    // Snapshot fields protect historical transaction logs against catalog edits
    name: { type: String, required: true },
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

/** Shipping address snapshot */
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

/**
 * Timeline event sub-schema.
 * Every status change (and key admin actions) are appended here so a
 * customer / admin can see the full history of an order.
 */
const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true,
    },
    description: { type: String, required: true },
    /** Actor who triggered the event: 'customer' | 'admin' | 'system' */
    actor: {
      type: String,
      enum: ['customer', 'admin', 'system'],
      default: 'system',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

/** Courier / shipping information populated by admin after dispatch */
const shippingInfoSchema = new mongoose.Schema(
  {
    trackingId: { type: String, default: null },
    courier: { type: String, default: null },
    trackingUrl: { type: String, default: null },
    estimatedDelivery: { type: Date, default: null },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Main Order schema
// ---------------------------------------------------------------------------

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
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null, index: true },
    tax: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },

    // Payment gateway references
    gatewayOrderId: { type: String, default: null, index: true },
    gatewayPaymentId: { type: String, default: null },
    gatewaySignature: { type: String, default: null },

    // Admin-managed shipping / courier information
    shippingInfo: {
      type: shippingInfoSchema,
      default: () => ({}),
    },

    // Complete audit trail of every status transition
    timeline: {
      type: [timelineEventSchema],
      default: [],
    },

    // Denormalized cancellation reason for quick retrieval
    cancellationReason: { type: String, default: null },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Compound indexes for frequently executed queries
// ---------------------------------------------------------------------------
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Text index for admin order search by order number
orderSchema.index({ orderNumber: 'text' });

export const Order = mongoose.model('Order', orderSchema);
