// backend/src/routes/cart.routes.js

import express from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validators/cart.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Enforce session checks on all cart paths
router.use(protect);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.put('/', validate(updateCartItemSchema), cartController.updateCartItemQuantity);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
