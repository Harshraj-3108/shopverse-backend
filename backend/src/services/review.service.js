// backend/src/services/review.service.js

import { ReviewRepository } from '../repositories/review.repository.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const reviewRepository = new ReviewRepository();

/**
 * Service to orchestrate Product Review operations.
 */
export const reviewService = {
  /**
   * Submit a new product review (Authenticated customer who purchased product).
   * @param {string} userId - User ID
   * @param {Object} reviewData - { productId, rating, comment }
   */
  createReview: async (userId, reviewData) => {
    const { productId, rating, comment } = reviewData;

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
    }

    // 2. Enforce purchase check: user must have a delivered order containing this product
    const purchased = await Order.findOne({
      userId,
      'items.productId': productId,
      status: 'delivered',
    });

    if (!purchased) {
      throw AppError.badRequest(
        'You can only review products that you have purchased and received (delivered).',
        ERROR_CODES.BAD_REQUEST
      );
    }

    // 3. Enforce single review constraint per product per user
    const existingReview = await reviewRepository.findByUserAndProduct(userId, productId);
    if (existingReview) {
      throw AppError.badRequest(
        'You have already submitted a review for this product. Edit your existing review instead.',
        ERROR_CODES.BAD_REQUEST
      );
    }

    // 4. Create review
    const review = await reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
    });

    return review;
  },

  /**
   * Edit an existing review (Author only).
   * @param {string} userId - Requesting user identifier
   * @param {string} reviewId - Review ID
   * @param {Object} updateData - { rating, comment }
   */
  updateReview: async (userId, reviewId, updateData) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw AppError.notFound('Review not found', ERROR_CODES.NOT_FOUND);
    }

    // Author ownership check
    if (review.userId.toString() !== userId.toString()) {
      throw AppError.forbidden('You can only edit your own reviews.', ERROR_CODES.FORBIDDEN);
    }

    if (updateData.rating !== undefined) review.rating = updateData.rating;
    if (updateData.comment !== undefined) review.comment = updateData.comment;

    await review.save(); // save triggers calculates
    return review;
  },

  /**
   * Remove a review (Author or Admin).
   * @param {string} userId - Requesting user ID
   * @param {string} userRole - Requesting user role
   * @param {string} reviewId - Review ID
   */
  deleteReview: async (userId, userRole, reviewId) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw AppError.notFound('Review not found', ERROR_CODES.NOT_FOUND);
    }

    // Auth gate check: Admin or author
    if (userRole !== 'admin' && review.userId.toString() !== userId.toString()) {
      throw AppError.forbidden('You do not have permission to delete this review.', ERROR_CODES.FORBIDDEN);
    }

    // Use findOneAndDelete so the pre/post hooks trigger
    await reviewRepository.model.findOneAndDelete({ _id: reviewId });

    return { id: reviewId, message: 'Review deleted successfully.' };
  },

  /**
   * Fetch reviews of a product.
   * @param {string} productId
   * @param {Object} queryParams - { page, limit }
   */
  getProductReviews: async (productId, queryParams) => {
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found', ERROR_CODES.NOT_FOUND);
    }

    const { page, limit } = queryParams;
    return await reviewRepository.findByProductPaginated(productId, page, limit);
  },
};
