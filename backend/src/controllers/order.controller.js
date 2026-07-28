// backend/src/controllers/order.controller.js

import { orderService } from '../services/order.service.js';

/**
 * Controller routing Checkout and Order placement HTTP operations.
 */
export const orderController = {
  /**
   * Place a new order using items from cart.
   */
  placeOrder: async (req, res, next) => {
    try {
      const result = await orderService.placeOrder(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Order placed successfully.',
        data: {
          order: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch details of a single order.
   */
  getOrderDetails: async (req, res, next) => {
    try {
      const result = await orderService.getOrderDetails(req.user.id, req.params.id);
      res.status(200).json({
        status: 'success',
        data: {
          order: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch authenticated user's complete order history.
   */
  getUserOrders: async (req, res, next) => {
    try {
      const result = await orderService.getUserOrders(req.user.id);
      res.status(200).json({
        status: 'success',
        data: {
          orders: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
