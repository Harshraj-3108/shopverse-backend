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

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Service orchestrating all Order lifecycle operations.
 */
export const orderService = {
  // =========================================================================
  // Order Placement (checkout flow – pre-existing, preserved)
  // =========================================================================

  /**
   * Place a new order using items in the customer's active cart.
   * Runs inside a MongoDB session transaction to guarantee atomicity.
   *
   * @param {string} userId
   * @param {Object} checkoutData - { shippingAddress, paymentMode, discount }
   */
  placeOrder: async (userId, checkoutData) => {
    const { shippingAddress, paymentMode, discount = 0 } = checkoutData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch populated cart
      const cart = await Cart.findOne({ userId }).populate('items.productId').session(session);
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
        const existing = await orderRepository.model.findOne({ orderNumber }).session(session);
        if (!existing) isUnique = true;
      }

      const orderItems = [];

      // 5. Decrement stock and snapshot product details
      for (const item of cart.items) {
        const product = item.productId;
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stockQuantity: -item.quantity } }
        ).session(session);

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

      await order.save({ session });

      // 7. Record coupon usage atomically
      if (couponDoc) {
        await Coupon.updateOne(
          { _id: couponDoc._id },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: { userId, orderId: order._id, usedAt: new Date() } },
          }
        ).session(session);
      }

      // 8. Clear cart
      cart.items = [];
      cart.couponCode = null;
      cart.discount = 0;
      await cart.save({ session });

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
   * Fetch a specific order, enforcing ownership for non-admin callers.
   * @param {string} userId   - Requesting user ID
   * @param {string} orderId  - Target order ID
   * @param {boolean} isAdmin - Skip ownership check for admin callers
   */
  getOrderDetails: async (userId, orderId, isAdmin = false) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }
    if (!isAdmin && order.userId.toString() !== userId.toString()) {
      throw AppError.forbidden(
        'You do not have permission to view this order.',
        ERROR_CODES.FORBIDDEN
      );
    }
    return order;
  },

  /**
   * Return the timeline array of an order (ownership-checked).
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
   * Only allowed from statuses in CUSTOMER_CANCELLABLE_STATUSES.
   * Restores stock quantities inside a MongoDB transaction.
   *
   * @param {string} userId
   * @param {string} orderId
   * @param {string} [reason] - Optional cancellation reason
   */
  cancelOrder: async (userId, orderId, reason = '') => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderRepository.model.findById(orderId).session(session);
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
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stockQuantity: item.quantity } }
        ).session(session);
      }

      // Append timeline event and update status
      const cancelDescription = reason
        ? `Order cancelled by customer. Reason: ${reason}`
        : STATUS_DESCRIPTIONS[ORDER_STATUSES.CANCELLED];

      const updated = await orderRepository.model.findByIdAndUpdate(
        orderId,
        {
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
        },
        { new: true, runValidators: true, session }
      );

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // =========================================================================
  // Admin – Read operations
  // =========================================================================

  /**
   * Paginated, filtered, searchable list of all orders (admin).
   * @param {Object} filters - { status, paymentStatus, userId, startDate, endDate, search, page, limit }
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

  // =========================================================================
  // Admin – Update order status
  // =========================================================================

  /**
   * Move an order to a new status (admin).
   * Validates the transition, appends a timeline event.
   *
   * @param {string} orderId
   * @param {string} newStatus
   * @param {string} [description]  - Custom timeline description
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
  // Admin – Cancel order (with optional reason, restores stock)
  // =========================================================================

  /**
   * Admin can cancel an order from any non-terminal status.
   * @param {string} orderId
   * @param {string} [reason]
   */
  adminCancelOrder: async (orderId, reason = '') => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderRepository.model.findById(orderId).session(session);
      if (!order) {
        throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
      }

      // Cannot cancel terminal statuses
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
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stockQuantity: item.quantity } }
        ).session(session);
      }

      const cancelDescription = reason
        ? `Order cancelled by admin. Reason: ${reason}`
        : 'Order cancelled by admin.';

      const updated = await orderRepository.model.findByIdAndUpdate(
        orderId,
        {
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
        },
        { new: true, runValidators: true, session }
      );

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // =========================================================================
  // Admin – Update shipping / courier information
  // =========================================================================

  /**
   * Attach or update courier/tracking information on an order.
   * @param {string} orderId
   * @param {Object} shippingData - { trackingId, courier, trackingUrl, estimatedDelivery }
   */
  updateShippingInfo: async (orderId, shippingData) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    // Only shipped/processing orders should have tracking information
    if (
      order.status === ORDER_STATUSES.PENDING ||
      order.status === ORDER_STATUSES.CANCELLED
    ) {
      throw AppError.badRequest(
        `Cannot add tracking information to an order in '${order.status}' status.`,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const updated = await orderRepository.updateShippingInfo(orderId, shippingData);
    return updated;
  },

  // =========================================================================
  // Admin – Update delivery timeline (estimated delivery date)
  // =========================================================================

  /**
   * Update just the estimated delivery date on the shipping info sub-document.
   * @param {string} orderId
   * @param {string} estimatedDelivery - ISO date string
   */
  updateDeliveryTimeline: async (orderId, estimatedDelivery) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }
    if (order.status === ORDER_STATUSES.CANCELLED || order.status === ORDER_STATUSES.DELIVERED) {
      throw AppError.badRequest(
        `Cannot update delivery timeline for an order in '${order.status}' status.`,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const updated = await orderRepository.updateShippingInfo(orderId, {
      estimatedDelivery: new Date(estimatedDelivery),
    });
    return updated;
  },
};
