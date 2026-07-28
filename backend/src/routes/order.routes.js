// backend/src/routes/order.routes.js

import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { placeOrderSchema } from '../validators/order.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Enforce session checks on all checkout/order paths
router.use(protect);

router.post('/', validate(placeOrderSchema), orderController.placeOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);

export default router;
