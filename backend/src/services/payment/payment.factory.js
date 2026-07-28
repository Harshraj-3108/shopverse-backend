// backend/src/services/payment/payment.factory.js

import { mockPaymentProvider } from './mockPayment.provider.js';
import { razorpayPaymentProvider } from './razorpayPayment.provider.js';

/**
 * Factory class returning the active Payment Provider depending on configuration.
 */
class PaymentFactory {
  getProvider() {
    const provider = process.env.PAYMENT_PROVIDER || 'mock';

    switch (provider.toLowerCase()) {
      case 'razorpay':
        return razorpayPaymentProvider;
      case 'mock':
      default:
        return mockPaymentProvider;
    }
  }
}

export const paymentFactory = new PaymentFactory();
