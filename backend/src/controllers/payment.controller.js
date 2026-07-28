// backend/src/controllers/payment.controller.js

import { paymentService } from '../services/payment/payment.service.js';

/**
 * Controller routing Payment operations.
 */
export const paymentController = {
  /**
   * Register a transaction session for payment checkout.
   */
  initializePayment: async (req, res, next) => {
    try {
      const result = await paymentService.initializePayment(req.user.id, req.body.orderId);
      res.status(200).json({
        status: 'success',
        message: 'Payment initialized successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify verification signature payloads returned from frontend captures.
   */
  verifyPayment: async (req, res, next) => {
    try {
      const result = await paymentService.verifyPayment(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully.',
        data: {
          order: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Asynchronously receive payment gateway webhooks notifications.
   */
  handleWebhook: async (req, res, next) => {
    try {
      const signature = req.headers['x-razorpay-signature'] || req.headers['x-payment-signature'];
      const result = await paymentService.handleWebhook(req.body, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
