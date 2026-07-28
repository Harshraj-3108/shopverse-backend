// backend/src/controllers/review.controller.js

import { reviewService } from '../services/review.service.js';

/**
 * Controller mapping Review HTTP routing endpoints.
 */
export const reviewController = {
  /**
   * Submit a product review (Authenticated customer).
   */
  createReview: async (req, res, next) => {
    try {
      const result = await reviewService.createReview(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully.',
        data: {
          review: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Edit a submitted review (Author only).
   */
  updateReview: async (req, res, next) => {
    try {
      const result = await reviewService.updateReview(req.user.id, req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Review updated successfully.',
        data: {
          review: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a review (Author or Admin).
   */
  deleteReview: async (req, res, next) => {
    try {
      const result = await reviewService.deleteReview(req.user.id, req.user.role, req.params.id);
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          id: result.id,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Public fetch list of reviews on a product.
   */
  getProductReviews: async (req, res, next) => {
    try {
      const result = await reviewService.getProductReviews(req.params.productId, req.query);
      res.status(200).json({
        status: 'success',
        data: {
          reviews: result.reviews,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
