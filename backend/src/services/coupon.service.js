// backend/src/services/coupon.service.js

import { CouponRepository } from '../repositories/coupon.repository.js';
import { Cart } from '../models/Cart.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const couponRepository = new CouponRepository();

/**
 * Service orchestrating Coupon administration CRUD and customer application/verification flows.
 */
export const couponService = {
  // --- Admin CRUD Operations ---

  createCoupon: async (couponData) => {
    const existing = await couponRepository.findByCode(couponData.code);
    if (existing) {
      throw AppError.conflict('Coupon code already exists.', ERROR_CODES.CONFLICT);
    }
    return await couponRepository.create({
      ...couponData,
      code: couponData.code.toUpperCase(),
    });
  },

  getCoupons: async (page = 1, limit = 10) => {
    const skipVal = (page - 1) * limit;
    const [totalItems, coupons] = await Promise.all([
      couponRepository.model.countDocuments(),
      couponRepository.model.find().skip(skipVal).limit(limit).sort({ createdAt: -1 }),
    ]);

    return {
      coupons,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  },

  getCouponById: async (couponId) => {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.', ERROR_CODES.NOT_FOUND);
    }
    return coupon;
  },

  updateCoupon: async (couponId, updateData) => {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.', ERROR_CODES.NOT_FOUND);
    }

    if (updateData.code) {
      const codeUpper = updateData.code.toUpperCase();
      if (codeUpper !== coupon.code) {
        const existing = await couponRepository.findByCode(codeUpper);
        if (existing) {
          throw AppError.conflict('Coupon code already exists.', ERROR_CODES.CONFLICT);
        }
        updateData.code = codeUpper;
      }
    }

    return await couponRepository.update(couponId, updateData);
  },

  deleteCoupon: async (couponId) => {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
      throw AppError.notFound('Coupon not found.', ERROR_CODES.NOT_FOUND);
    }
    await couponRepository.delete(couponId);
    return { success: true };
  },

  // --- Customer Operations ---

  /**
   * Validate a coupon against order constraints.
   * @param {string} code - Upper-case code
   * @param {string} userId - User identifier
   * @param {number} subtotal - Subtotal amount
   */
  validateCoupon: async (code, userId, subtotal) => {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) {
      throw AppError.notFound('Invalid or inactive coupon code.', ERROR_CODES.NOT_FOUND);
    }

    // Expiry check
    if (coupon.expiryDate < new Date()) {
      throw AppError.badRequest('Coupon has expired.', ERROR_CODES.BAD_REQUEST);
    }

    // Min Order Value check
    if (subtotal < coupon.minOrderValue) {
      throw AppError.badRequest(
        `Minimum order value of ${coupon.minOrderValue} required to apply this coupon.`,
        ERROR_CODES.BAD_REQUEST
      );
    }

    // Overall usage limit check
    if (coupon.usedCount >= coupon.usageLimit) {
      throw AppError.badRequest('Coupon usage limit reached.', ERROR_CODES.BAD_REQUEST);
    }

    // Per-user usage limit check
    const userUsage = coupon.usedBy.filter(u => u.userId.toString() === userId.toString()).length;
    if (userUsage >= coupon.perUserLimit) {
      throw AppError.badRequest('You have reached the usage limit for this coupon.', ERROR_CODES.BAD_REQUEST);
    }

    // Math calculations
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount !== undefined && coupon.maxDiscount !== null) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return {
      coupon,
      discount: Number(discountAmount.toFixed(2)),
    };
  },

  /**
   * Apply coupon to a user's shopping cart.
   * @param {string} userId - User identifier
   * @param {string} code - Coupon code
   */
  applyCouponToCart: async (userId, code) => {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw AppError.badRequest('Your shopping cart is empty.', ERROR_CODES.BAD_REQUEST);
    }

    // Run verification logic
    const { discount } = await couponService.validateCoupon(code, userId, cart.subtotal);

    cart.couponCode = code.toUpperCase();
    cart.discount = discount;
    await cart.save();

    return await cart.populate(
      'items.productId',
      'name slug sku price salePrice stockQuantity images isActive'
    );
  },

  /**
   * Remove coupon from user's shopping cart.
   * @param {string} userId - User identifier
   */
  removeCouponFromCart: async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw AppError.notFound('Cart not found.', ERROR_CODES.NOT_FOUND);
    }

    cart.couponCode = null;
    cart.discount = 0;
    await cart.save();

    return await cart.populate(
      'items.productId',
      'name slug sku price salePrice stockQuantity images isActive'
    );
  },
};
