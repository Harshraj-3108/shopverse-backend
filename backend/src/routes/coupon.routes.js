// backend/src/routes/coupon.routes.js

import express from 'express';
import { couponController } from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
} from '../validators/coupon.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Enforce session checks on all coupon routes
router.use(protect);

// Customer endpoints
router.post('/apply', validate(applyCouponSchema), couponController.applyCoupon);
router.post('/remove', couponController.removeCoupon);

// Admin-only CRUD endpoints
router.use(authorize('admin'));
router.post('/', validate(createCouponSchema), couponController.createCoupon);
router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCouponById);
router.put('/:id', validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
