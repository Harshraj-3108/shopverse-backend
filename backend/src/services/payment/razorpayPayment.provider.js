// backend/src/services/payment/razorpayPayment.provider.js

import crypto from 'crypto';

/**
 * Razorpay Payment Provider implementing native REST communication (Zero third-party SDK dependencies).
 */
export const razorpayPaymentProvider = {
  /**
   * Create Razorpay Gateway order.
   */
  createPaymentOrder: async (orderId, amount, currency = 'INR') => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured in environment.');
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay accepts amount in sub-units (paise)
        currency,
        receipt: orderId.toString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.description || 'Razorpay order creation failed.');
    }

    return {
      gatewayOrderId: data.id,
      amount,
      currency,
      status: data.status,
      provider: 'razorpay',
    };
  },

  /**
   * Verify Razorpay Payment Signature.
   */
  verifyPaymentSignature: async (paymentDetails) => {
    const { razorpayOrderId, razorpayPaymentId, signature } = paymentDetails;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error('Razorpay credentials secret is missing.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  },

  /**
   * Handle Razorpay Webhook Event payload signatures.
   */
  handleWebhook: async (payload, headerSignature) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && headerSignature) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSig !== headerSignature) {
        throw new Error('Invalid Razorpay webhook signature header check failed.');
      }
    }

    // Parse event payloads
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.notes?.orderId || paymentEntity?.receipt;

    if (event === 'payment.captured') {
      return {
        event: 'payment.captured',
        orderId,
        gatewayPaymentId: paymentEntity.id,
      };
    }

    if (event === 'payment.failed') {
      return {
        event: 'payment.failed',
        orderId,
        reason: paymentEntity?.error_description || 'Captured failed',
      };
    }

    return { event: 'unsupported' };
  },
};
