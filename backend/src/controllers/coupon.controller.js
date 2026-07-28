// backend/src/controllers/coupon.controller.js

import { couponService } from '../services/coupon.service.js';

/**
 * Controller routing Coupon administrative CRUD and cart mutations.
 */
export const couponController = {
  // --- Admin CRUD Handlers ---

  createCoupon: async (req, res, next) => {
    try {
      const result = await couponService.createCoupon(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Coupon created successfully.',
        data: { coupon: result },
      });
    } catch (error) {
      next(error);
    }
  },

  getCoupons: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const result = await couponService.getCoupons(page, limit);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getCouponById: async (req, res, next) => {
    try {
      const result = await couponService.getCouponById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { coupon: result },
      });
    } catch (error) {
      next(error);
    }
  },

  updateCoupon: async (req, res, next) => {
    try {
      const result = await couponService.updateCoupon(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Coupon updated successfully.',
        data: { coupon: result },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteCoupon: async (req, res, next) => {
    try {
      await couponService.deleteCoupon(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Coupon deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  // --- Customer Handlers ---

  applyCoupon: async (req, res, next) => {
    try {
      const result = await couponService.applyCouponToCart(req.user.id, req.body.code);
      res.status(200).json({
        status: 'success',
        message: 'Coupon applied successfully.',
        data: { cart: result },
      });
    } catch (error) {
      next(error);
    }
  },

  removeCoupon: async (req, res, next) => {
    try {
      const result = await couponService.removeCouponFromCart(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Coupon removed successfully.',
        data: { cart: result },
      });
    } catch (error) {
      next(error);
    }
  },
};
