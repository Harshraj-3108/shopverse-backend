// backend/src/services/order.service.js

import mongoose from 'mongoose';
import { OrderRepository } from '../repositories/order.repository.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const orderRepository = new OrderRepository();

/**
 * Service to manage Checkout and Order placements using session transactions.
 */
export const orderService = {
  /**
   * Place a new order using cart items.
   * Runs inside a MongoDB session transaction to guarantee atomicity.
   * @param {string} userId - Requesting user identifier
   * @param {Object} checkoutData - { shippingAddress, paymentMode, discount }
   */
  placeOrder: async (userId, checkoutData) => {
    const { shippingAddress, paymentMode, discount = 0 } = checkoutData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch user's cart populated with product details (under transaction session)
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

      // 3. Perform invoice details math calculations
      const subtotal = cart.subtotal;
      const taxRate = 0.18; // 18% GST standard rate
      const tax = Number((subtotal * taxRate).toFixed(2));
      const shippingFee = subtotal > 1500 ? 0 : 50; // Free shipping above 1500
      
      const grandTotal = Number((subtotal - discount + tax + shippingFee).toFixed(2));

      // 4. Generate unique invoice ORD order tracking number
      let orderNumber;
      let isUnique = false;
      while (!isUnique) {
        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.floor(100 + Math.random() * 900).toString();
        orderNumber = `ORD-${timestamp}-${randomStr}`;

        const existing = await orderRepository.model.findOne({ orderNumber }).session(session);
        if (!existing) {
          isUnique = true;
        }
      }

      const orderItems = [];

      // 5. Reserve stock quantities and snapshot descriptions
      for (const item of cart.items) {
        const product = item.productId;

        // Decrement stock atomically (under transaction session)
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stockQuantity: -item.quantity } }
        ).session(session);

        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: item.price,
          name: product.name,
          imageUrl: primaryImage ? primaryImage.url : '',
        });
      }

      // 6. Instantiate new order document
      const order = new orderRepository.model({
        orderNumber,
        userId,
        items: orderItems,
        shippingAddress,
        paymentMode,
        paymentStatus: 'pending', // Online starts pending; COD is pending till delivery
        status: 'pending',
        subtotal,
        discount,
        tax,
        shippingFee,
        grandTotal,
      });

      await order.save({ session });

      // 7. Clear items from shopping cart
      cart.items = [];
      await cart.save({ session });

      // Commit transaction atomically
      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Retrieve details of a specific order (Ownership protected).
   * @param {string} userId - Requesting user ID
   * @param {string} orderId - Order identifier
   */
  getOrderDetails: async (userId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    if (order.userId.toString() !== userId.toString()) {
      throw AppError.forbidden('You do not have access to view this order details.', ERROR_CODES.FORBIDDEN);
    }

    return order;
  },

  /**
   * Fetch authenticated user's orders history.
   * @param {string} userId - User identifier
   */
  getUserOrders: async (userId) => {
    return await orderRepository.findByUserId(userId);
  },
};
