// backend/src/services/payment/payment.service.js

import { Order } from '../../models/Order.js';
import { paymentFactory } from './payment.factory.js';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Service orchestrating payment flow checkouts, verifications, and webhooks.
 */
export const paymentService = {
  /**
   * Initialize a payment session on the active gateway.
   * @param {string} userId - Requesting user ID
   * @param {string} orderId - System Order ID
   */
  initializePayment: async (userId, orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    if (order.userId.toString() !== userId.toString()) {
      throw AppError.forbidden('You do not have access to initialize payment for this order.', ERROR_CODES.FORBIDDEN);
    }

    if (order.paymentStatus === 'paid') {
      throw AppError.badRequest('Order has already been paid.', ERROR_CODES.BAD_REQUEST);
    }

    const provider = paymentFactory.getProvider();

    // Call the provider to create gateway order
    const gatewayRes = await provider.createPaymentOrder(order._id, order.grandTotal, 'INR');

    // Link gateway order ID to the system order document
    order.gatewayOrderId = gatewayRes.gatewayOrderId;
    await order.save();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal,
      gatewayOrderId: gatewayRes.gatewayOrderId,
      paymentMode: order.paymentMode,
      provider: gatewayRes.provider,
    };
  },

  /**
   * Verify checkout signature payloads returned from frontend captures.
   * @param {string} userId - Requesting user ID
   * @param {Object} paymentDetails - { orderId, gatewayPaymentId, signature, gatewayOrderId }
   */
  verifyPayment: async (userId, paymentDetails) => {
    const { orderId, gatewayPaymentId, signature, gatewayOrderId } = paymentDetails;

    const order = await Order.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found.', ERROR_CODES.NOT_FOUND);
    }

    if (order.userId.toString() !== userId.toString()) {
      throw AppError.forbidden('You do not have access to modify this order.', ERROR_CODES.FORBIDDEN);
    }

    const provider = paymentFactory.getProvider();

    const verificationPayload = {
      razorpayOrderId: gatewayOrderId || order.gatewayOrderId,
      razorpayPaymentId: gatewayPaymentId,
      signature,
      gatewayPaymentId,
    };

    const isValid = await provider.verifyPaymentSignature(verificationPayload);

    if (isValid) {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.gatewayPaymentId = gatewayPaymentId;
      order.gatewaySignature = signature;
      await order.save();
      return order;
    } else {
      order.paymentStatus = 'failed';
      order.gatewayPaymentId = gatewayPaymentId;
      order.gatewaySignature = signature;
      await order.save();
      throw AppError.badRequest('Payment verification failed. Invalid signature received.', ERROR_CODES.BAD_REQUEST);
    }
  },

  /**
   * Parse asynchronous webhook events from payment gateway.
   * @param {Object} payload - Event body payload
   * @param {string} signature - Event header signature
   */
  handleWebhook: async (payload, signature) => {
    const provider = paymentFactory.getProvider();
    const eventData = await provider.handleWebhook(payload, signature);

    if (eventData.event === 'payment.captured') {
      const order = await Order.findOne({ gatewayOrderId: eventData.orderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.gatewayPaymentId = eventData.gatewayPaymentId;
        await order.save();
      }
    } else if (eventData.event === 'payment.failed') {
      const order = await Order.findOne({ gatewayOrderId: eventData.orderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        await order.save();
      }
    }

    return { received: true };
  },
};
