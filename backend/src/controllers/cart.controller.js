// backend/src/controllers/cart.controller.js

import { cartService } from '../services/cart.service.js';

/**
 * Controller routing Cart HTTP operations.
 */
export const cartController = {
  /**
   * Fetch current authenticated user's cart.
   */
  getCart: async (req, res, next) => {
    try {
      const result = await cartService.getOrCreateCart(req.user.id);
      res.status(200).json({
        status: 'success',
        data: {
          cart: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a product to the user's cart.
   */
  addToCart: async (req, res, next) => {
    try {
      const result = await cartService.addToCart(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Product added to cart successfully.',
        data: {
          cart: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update the quantity of a product in the cart.
   */
  updateCartItemQuantity: async (req, res, next) => {
    try {
      const result = await cartService.updateCartItemQuantity(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Cart item quantity updated successfully.',
        data: {
          cart: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove a product from the cart.
   */
  removeFromCart: async (req, res, next) => {
    try {
      const result = await cartService.removeFromCart(req.user.id, req.params.productId);
      res.status(200).json({
        status: 'success',
        message: 'Item removed from cart successfully.',
        data: {
          cart: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove all products from the cart.
   */
  clearCart: async (req, res, next) => {
    try {
      const result = await cartService.clearCart(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Cart cleared successfully.',
        data: {
          cart: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
