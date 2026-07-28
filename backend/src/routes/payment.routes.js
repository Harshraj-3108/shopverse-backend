// backend/src/routes/payment.routes.js

import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  initializePaymentSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Public Webhook listener (authenticity checks are done on HMAC signatures)
router.post('/webhook', paymentController.handleWebhook);

// Protected checkout/verify endpoints
router.post('/initialize', protect, validate(initializePaymentSchema), paymentController.initializePayment);
router.post('/verify', protect, validate(verifyPaymentSchema), paymentController.verifyPayment);

export default router;
