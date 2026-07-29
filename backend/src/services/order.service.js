// backend/src/services/order.service.js

import mongoose from 'mongoose';
import { OrderRepository } from '../repositories/order.repository.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { couponService } from './coupon.service.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import {
  VALID_TRANSITIONS,
  CUSTOMER_CANCELLABLE_STATUSES,
  STATUS_DESCRIPTIONS,
  ORDER_STATUSES,
} from '../constants/orderStatus.js';

const orderRepository = new OrderRepository();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Assert that a status transition is permitted by the business rules.
 * Throws AppError.badRequest on invalid transitions.
 */
function assertValidTransition(currentStatus, nextStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.has(nextStatus)) {
    throw AppError.badRequest(
      `Cannot transition order from '${currentStatus}' to '${nextStatus}'.`,
      ERROR_CODES.BAD_REQUEST
    );
  }
}

/**
 * Helper to execute operations in a transaction session if supported (Replica Set / Atlas),
 * or gracefully fallback to non-transactional execution for standalone local MongoDB instances.
 */
async function executeInSession(work) {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    // Fallback if local MongoDB is standalone without replica set
    if (error.message && error.message.includes('Transaction numbers are only allowed')) {
      return await work(null);
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Service orchestrating all Order lifecycle operations.
 */
export const orderService = {
  // =========================================================================
  // Order Placement (checkout flow)
  // =========================================================================

  /**
   * Place a new order using items in the customer's active cart.
   * Runs inside a MongoDB session transaction when supported, or falls back safely.
   *
   * @param {string} userId
   * @param {Object} checkoutData - { shippingAddress, paymentMode, discount }
   */
  placeOrder: async (userId, checkoutData) => {
    const { shippingAddress, paymentMode, discount = 0 } = checkoutData;

    return await executeInSession(async (session) => {
      // 1. Fetch populated cart
      const cartQuery = Cart.findOne({ userId }).populate('items.productId');
      const cart = session ? await cartQuery.session(session) : await cartQuery;

      if (!cart || cart.items.length === 0) {
        throw AppError.badRequest('Your shopping cart is empty.', ERROR_CODES.BAD_REQUEST);
      }

      // 2. Validate product active state and stock quantities
      for (const item of cart.items) {
        const product = item.productId;
        if (!product || !product.isActive) {
          throw AppError.notFound(
            `Product '${product ? product.name : 'Unknown'}' is inactive or no longer available.`,
            ERROR_CODES.NOT_FOUND
          );
        }
        if (product.stockQuantity < item.quantity) {
          throw AppError.badRequest(
            `Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}, requested: ${item.quantity}`,
            ERROR_CODES.BAD_REQUEST
          );
        }
      }

      // 3. Invoice calculations
      const subtotal = cart.subtotal;
      let finalDiscount = 0;
      let couponDoc = null;

      if (cart.couponCode) {
        const validation = await couponService.validateCoupon(cart.couponCode, userId, subtotal);
        finalDiscount = validation.discount;
        couponDoc = validation.coupon;
      }

      const taxRate = 0.18;
      const tax = Number((subtotal * taxRate).toFixed(2));
      const shippingFee = subtotal > 1500 ? 0 : 50;
      const grandTotal = Number((subtotal - finalDiscount + tax + shippingFee).toFixed(2));

      // 4. Generate unique order number
      let orderNumber;
      let isUnique = false;
      while (!isUnique) {
        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.floor(100 + Math.random() * 900).toString();
        orderNumber = `ORD-${timestamp}-${randomStr}`;
        const query = orderRepository.model.findOne({ orderNumber });
        const existing = session ? await query.session(session) : await query;
        if (!existing) isUnique = true;
      }

      const orderItems = [];

      // 5. Decrement stock and snapshot product details
      for (const item of cart.items) {
        const product = item.productId;
        if (session) {
          await Product.updateOne(
            { _id: product._id },
            { $inc: { stockQuantity: -item.quantity } }
          ).session(session);
        } else {
          await Product.updateOne(
            { _id: product._id },
            { $inc: { stockQuantity: -item.quantity } }
          );
        }

        const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: item.price,
          name: product.name,
          imageUrl: primaryImage ? primaryImage.url : '',
        });
      }

      // 6. Create order document with initial timeline event
      const order = new orderRepository.model({
        orderNumber,
        userId,
        items: orderItems,
        shippingAddress,
        paymentMode,
        paymentStatus: 'pending',
        status: ORDER_STATUSES.PENDING,
        subtotal,
        discount: finalDiscount,
        couponCode: cart.couponCode || null,
        tax,
        shippingFee,
        grandTotal,
        timeline: [
          {
            status: ORDER_STATUSES.PENDING,
            description: STATUS_DESCRIPTIONS[ORDER_STATUSES.PENDING],
            actor: 'customer',
            timestamp: new Date(),
          },
        ],
      });

      if (session) {
        await order.save({ session });
      } else {
        await order.save();
      }

      // 7. Record coupon usage
      if (couponDoc) {
        const couponUpdate = {
          $inc: { usedCount: 1 },
          $push: { usedBy: { userId, orderId: order._id, usedAt: new Date() } },
        };
        if (session) {
          await Coupon.updateOne({ _id: couponDoc._id }, couponUpdate).session(session);
        } else {
          await Coupon.updateOne({ _id: couponDoc._id }, couponUpdate);
        }
      }

      // 8. Clear cart
      cart.items = [];
      cart.couponCode = null;
      cart.discount = 0;
      if (session) {
        await cart.save({ session });
      } else {
        await cart.save();
      }

      return order;
    });
  },

  // =========================================================================
  // Customer – Read operations
  // =========================================================================

  /**
   * Paginated order history for the authenticated customer.
   * @param {string} userId
   * @param {number} page
   * @param {number} limit
   */
  getUserOrders: async (userId, page = 1, limit = 10) => {
    const { orders, total } = await orderRepository.findByUserId(userId, page, limit);
    return {
      orders,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  /**
   * Fetch single order by ID with ownership assertion.
   * @param {string} userId
   * @param {string} orderId
   */
  getOrderById: async (userId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    if (order.userId.toString() !== userId.toString()) {
      throw AppError.forbidden(
        'You do not have permission to view this order.',
        ERROR_CODES.FORBIDDEN
      );
    }
    return order;
  },

  /**
   * Fetch order timeline audit trail.
   * @param {string} userId
   * @param {string} orderId
   */
  getOrderTimeline: async (userId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }
    if (order.userId.toString() !== userId.toString()) {
      throw AppError.forbidden(
        'You do not have permission to view this order.',
        ERROR_CODES.FORBIDDEN
      );
    }
    return order.timeline;
  },

  // =========================================================================
  // Customer – Cancel order
  // =========================================================================

  /**
   * Cancel an order on behalf of the customer.
   * Restores stock quantities gracefully on both transactional & standalone MongoDB.
   *
   * @param {string} userId
   * @param {string} orderId
   * @param {string} [reason] - Optional cancellation reason
   */
  cancelOrder: async (userId, orderId, reason = '') => {
    return await executeInSession(async (session) => {
      const query = orderRepository.model.findById(orderId);
      const order = session ? await query.session(session) : await query;

      if (!order) {
        throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
      }
      if (order.userId.toString() !== userId.toString()) {
        throw AppError.forbidden(
          'You do not have permission to cancel this order.',
          ERROR_CODES.FORBIDDEN
        );
      }
      if (!CUSTOMER_CANCELLABLE_STATUSES.has(order.status)) {
        throw AppError.badRequest(
          `Order cannot be cancelled once it is in '${order.status}' status.`,
          ERROR_CODES.BAD_REQUEST
        );
      }

      // Restore stock for every item
      for (const item of order.items) {
        if (session) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stockQuantity: item.quantity } }
          ).session(session);
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stockQuantity: item.quantity } }
          );
        }
      }

      // Append timeline event and update status
      const cancelDescription = reason
        ? `Order cancelled by customer. Reason: ${reason}`
        : STATUS_DESCRIPTIONS[ORDER_STATUSES.CANCELLED];

      const updateData = {
        $push: {
          timeline: {
            status: ORDER_STATUSES.CANCELLED,
            description: cancelDescription,
            actor: 'customer',
            timestamp: new Date(),
          },
        },
        $set: {
          status: ORDER_STATUSES.CANCELLED,
          cancellationReason: reason || null,
        },
      };

      const opts = { new: true, runValidators: true };
      if (session) opts.session = session;

      const updated = await orderRepository.model.findByIdAndUpdate(orderId, updateData, opts);
      return updated;
    });
  },

  // =========================================================================
  // Admin – Read operations
  // =========================================================================

  /**
   * Paginated, filtered, searchable list of all orders (admin).
   * @param {Object} filters
   */
  getAllOrders: async (filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;

    const { orders, total } = await orderRepository.findAllWithFilters({ ...filters, page, limit });
    return {
      orders,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  /**
   * Fetch any order by ID (admin).
   * @param {string} orderId
   */
  getAdminOrderById: async (orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }
    return order;
  },

  // =========================================================================
  // Admin – Update order status
  // =========================================================================

  /**
   * Move an order to a new status (admin).
   * @param {string} orderId
   * @param {string} newStatus
   * @param {string} [description]
   */
  updateOrderStatus: async (orderId, newStatus, description = '') => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    assertValidTransition(order.status, newStatus);
    const timelineDescription = description || STATUS_DESCRIPTIONS[newStatus];

    const updated = await orderRepository.pushTimelineEvent(
      orderId,
      {
        status: newStatus,
        description: timelineDescription,
        actor: 'admin',
      }
    );

    return updated;
  },

  // =========================================================================
  // Admin – Cancel order
  // =========================================================================

  /**
   * Admin can cancel an order from any non-terminal status.
   * @param {string} orderId
   * @param {string} [reason]
   */
  adminCancelOrder: async (orderId, reason = '') => {
    return await executeInSession(async (session) => {
      const query = orderRepository.model.findById(orderId);
      const order = session ? await query.session(session) : await query;

      if (!order) {
        throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
      }

      if (
        order.status === ORDER_STATUSES.DELIVERED ||
        order.status === ORDER_STATUSES.CANCELLED
      ) {
        throw AppError.badRequest(
          `Order is already in '${order.status}' status and cannot be cancelled.`,
          ERROR_CODES.BAD_REQUEST
        );
      }

      // Restore stock
      for (const item of order.items) {
        if (session) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stockQuantity: item.quantity } }
          ).session(session);
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stockQuantity: item.quantity } }
          );
        }
      }

      const cancelDescription = reason
        ? `Order cancelled by admin. Reason: ${reason}`
        : 'Order cancelled by admin.';

      const updateData = {
        $push: {
          timeline: {
            status: ORDER_STATUSES.CANCELLED,
            description: cancelDescription,
            actor: 'admin',
            timestamp: new Date(),
          },
        },
        $set: {
          status: ORDER_STATUSES.CANCELLED,
          cancellationReason: reason || null,
        },
      };

      const opts = { new: true, runValidators: true };
      if (session) opts.session = session;

      const updated = await orderRepository.model.findByIdAndUpdate(orderId, updateData, opts);
      return updated;
    });
  },

  // =========================================================================
  // Admin – Shipping and tracking updates
  // =========================================================================

  /**
   * Attach/update shipping tracking details for an order (admin).
   * @param {string} orderId
   * @param {Object} shippingInfo - { trackingId, courier, trackingUrl, estimatedDelivery }
   */
  updateShippingInfo: async (orderId, shippingInfo) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    if (order.status !== ORDER_STATUSES.SHIPPED) {
      throw AppError.badRequest(
        `Shipping tracking details can only be added when order is in 'shipped' status. Current: '${order.status}'`,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const updated = await orderRepository.updateShipping(orderId, shippingInfo);
    return updated;
  },

  /**
   * Update estimated delivery date on an order's shipping info (admin).
   * @param {string} orderId
   * @param {string|Date} estimatedDelivery
   */
  updateDeliveryTimeline: async (orderId, estimatedDelivery) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    const updated = await orderRepository.updateDeliveryDate(orderId, estimatedDelivery);
    return updated;
  },
};
