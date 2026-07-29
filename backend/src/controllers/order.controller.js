// backend/src/controllers/order.controller.js

import { orderService } from '../services/order.service.js';

/**
 * Controller mapping HTTP requests to Order service operations.
 * Covers both customer-facing and admin-facing order management endpoints.
 */
export const orderController = {
  // =========================================================================
  // Customer endpoints
  // =========================================================================

  /**
   * POST /orders
   * Place a new order from items in the cart.
   */
  placeOrder: async (req, res, next) => {
    try {
      const order = await orderService.placeOrder(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Order placed successfully.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders
   * Get paginated order history for the authenticated customer.
   */
  getUserOrders: async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const result = await orderService.getUserOrders(req.user.id, page, limit);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders/:id
   * Get details of a single order (ownership-checked).
   */
  getOrderDetails: async (req, res, next) => {
    try {
      const order = await orderService.getOrderDetails(req.user.id, req.params.id);
      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders/:id/timeline
   * Get the full timeline of an order (ownership-checked).
   */
  getOrderTimeline: async (req, res, next) => {
    try {
      const timeline = await orderService.getOrderTimeline(req.user.id, req.params.id);
      res.status(200).json({
        status: 'success',
        data: { timeline },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /orders/:id/cancel
   * Customer requests cancellation of their own order.
   */
  cancelOrder: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const order = await orderService.cancelOrder(req.user.id, req.params.id, reason);
      res.status(200).json({
        status: 'success',
        message: 'Order cancelled successfully.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // Admin endpoints
  // =========================================================================

  /**
   * GET /orders/admin/all
   * Paginated, filtered, searchable list of all orders.
   */
  adminGetAllOrders: async (req, res, next) => {
    try {
      const result = await orderService.getAllOrders(req.query);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders/admin/:id
   * Admin view of a specific order (no ownership restriction).
   */
  adminGetOrderDetails: async (req, res, next) => {
    try {
      const order = await orderService.getOrderDetails(req.user.id, req.params.id, true);
      res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /orders/admin/:id/status
   * Admin updates the status of an order (validates transitions).
   */
  adminUpdateOrderStatus: async (req, res, next) => {
    try {
      const { status, description } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status, description);
      res.status(200).json({
        status: 'success',
        message: `Order status updated to '${status}'.`,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /orders/admin/:id/cancel
   * Admin cancels an order with optional reason; restores stock.
   */
  adminCancelOrder: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const order = await orderService.adminCancelOrder(req.params.id, reason);
      res.status(200).json({
        status: 'success',
        message: 'Order cancelled by admin.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /orders/admin/:id/shipping
   * Admin adds or updates courier/tracking information.
   */
  adminUpdateShippingInfo: async (req, res, next) => {
    try {
      const order = await orderService.updateShippingInfo(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Shipping information updated successfully.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /orders/admin/:id/delivery-timeline
   * Admin updates the estimated delivery date.
   */
  adminUpdateDeliveryTimeline: async (req, res, next) => {
    try {
      const { estimatedDelivery } = req.body;
      const order = await orderService.updateDeliveryTimeline(req.params.id, estimatedDelivery);
      res.status(200).json({
        status: 'success',
        message: 'Estimated delivery date updated.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },
};
