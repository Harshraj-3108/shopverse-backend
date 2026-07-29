// backend/src/routes/order.routes.js

import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../middlewares/validator.middleware.js';
import {
  placeOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  updateShippingInfoSchema,
  updateDeliveryTimelineSchema,
  adminOrderQuerySchema,
  customerOrderQuerySchema,
} from '../validators/order.validator.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// ===========================================================================
// Customer routes
// ===========================================================================

/**
 * POST /orders
 * Place a new order from cart items.
 */
router.post('/', validate(placeOrderSchema), orderController.placeOrder);

/**
 * GET /orders
 * Get the authenticated customer's order history (paginated).
 */
router.get('/', validateQuery(customerOrderQuerySchema), orderController.getUserOrders);

/**
 * GET /orders/:id/timeline
 * Get the full status timeline for a specific order (ownership-checked).
 * NOTE: Must be declared BEFORE /:id to avoid route conflict.
 */
router.get('/:id/timeline', orderController.getOrderTimeline);

/**
 * GET /orders/:id
 * Get details of a specific order (ownership-checked).
 */
router.get('/:id', orderController.getOrderDetails);

/**
 * PATCH /orders/:id/cancel
 * Customer cancels their own order (only from pending/processing).
 */
router.patch('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder);

// ===========================================================================
// Admin routes  (all require 'admin' role)
// ===========================================================================

/**
 * GET /orders/admin/all
 * Paginated, filtered, searchable list of all orders.
 */
router.get(
  '/admin/all',
  authorize('admin'),
  validateQuery(adminOrderQuerySchema),
  orderController.adminGetAllOrders
);

/**
 * GET /orders/admin/:id
 * Admin view of any specific order.
 */
router.get('/admin/:id', authorize('admin'), orderController.adminGetOrderDetails);

/**
 * PATCH /orders/admin/:id/status
 * Admin moves an order to a new status (transition-validated).
 */
router.patch(
  '/admin/:id/status',
  authorize('admin'),
  validate(updateOrderStatusSchema),
  orderController.adminUpdateOrderStatus
);

/**
 * PATCH /orders/admin/:id/cancel
 * Admin cancels an order and restores stock.
 */
router.patch(
  '/admin/:id/cancel',
  authorize('admin'),
  validate(cancelOrderSchema),
  orderController.adminCancelOrder
);

/**
 * PATCH /orders/admin/:id/shipping
 * Admin attaches/updates courier and tracking information.
 */
router.patch(
  '/admin/:id/shipping',
  authorize('admin'),
  validate(updateShippingInfoSchema),
  orderController.adminUpdateShippingInfo
);

/**
 * PATCH /orders/admin/:id/delivery-timeline
 * Admin updates the estimated delivery date.
 */
router.patch(
  '/admin/:id/delivery-timeline',
  authorize('admin'),
  validate(updateDeliveryTimelineSchema),
  orderController.adminUpdateDeliveryTimeline
);

export default router;
