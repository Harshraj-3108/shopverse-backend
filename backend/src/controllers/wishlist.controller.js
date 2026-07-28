// backend/src/controllers/wishlist.controller.js

import { wishlistService } from '../services/wishlist.service.js';

/**
 * Controller routing Wishlist HTTP operations.
 */
export const wishlistController = {
  /**
   * Fetch authenticated user's wishlist.
   */
  getWishlist: async (req, res, next) => {
    try {
      const result = await wishlistService.getWishlist(req.user.id);
      res.status(200).json({
        status: 'success',
        data: {
          wishlist: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a product reference to the wishlist.
   */
  addToWishlist: async (req, res, next) => {
    try {
      const result = await wishlistService.addToWishlist(req.user.id, req.body.productId);
      res.status(200).json({
        status: 'success',
        message: 'Product added to wishlist successfully.',
        data: {
          wishlist: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove a product reference from the wishlist.
   */
  removeFromWishlist: async (req, res, next) => {
    try {
      const result = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
      res.status(200).json({
        status: 'success',
        message: 'Product removed from wishlist successfully.',
        data: {
          wishlist: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Move a product reference from the wishlist into the shopping cart.
   */
  moveToCart: async (req, res, next) => {
    try {
      const result = await wishlistService.moveToCart(req.user.id, req.body.productId);
      res.status(200).json({
        status: 'success',
        message: 'Product moved to cart successfully.',
        data: {
          wishlist: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
