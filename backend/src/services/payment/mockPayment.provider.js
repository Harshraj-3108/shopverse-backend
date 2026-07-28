// backend/src/services/payment/mockPayment.provider.js

import crypto from 'crypto';

/**
 * Mock Payment Provider simulating payment gateway loops.
 */
export const mockPaymentProvider = {
  /**
   * Create a simulated payment checkout order.
   * @param {string} orderId - System Order ID
   * @param {number} amount - Grand total amount
   * @param {string} currency - currency (default INR)
   */
  createPaymentOrder: async (orderId, amount, currency = 'INR') => {
    const gatewayOrderId = 'mock_order_' + crypto.randomBytes(8).toString('hex');
    return {
      gatewayOrderId,
      amount,
      currency,
      status: 'created',
      provider: 'mock',
    };
  },

  /**
   * Verify mock signature verification request.
   * @param {Object} paymentDetails - Verification coordinates
   */
  verifyPaymentSignature: async (paymentDetails) => {
    const { signature, gatewayPaymentId } = paymentDetails;

    // Simulate success/failure based on signature payload value
    if (signature === 'mock_fail_signature' || gatewayPaymentId === 'mock_pay_failed') {
      return false;
    }

    return true;
  },

  /**
   * Mock webhook validation and events dispatcher.
   */
  handleWebhook: async (payload, headerSignature) => {
    // Return mock payment status events
    if (payload.event === 'payment.failed') {
      return {
        event: 'payment.failed',
        orderId: payload.orderId,
        reason: 'Insufficient funds simulated',
      };
    }

    return {
      event: 'payment.captured',
      orderId: payload.orderId,
      gatewayPaymentId: 'mock_pay_captured_' + crypto.randomBytes(6).toString('hex'),
    };
  },
};
