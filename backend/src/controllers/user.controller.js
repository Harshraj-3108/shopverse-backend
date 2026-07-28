// src/controllers/user.controller.js

import { userService } from '../services/user.service.js';

/**
 * Controller routing user profile and address book request logic.
 */
export const userController = {
  /**
   * Fetch authenticated user profile details.
   */
  getProfile: async (req, res, next) => {
    try {
      const result = await userService.getProfile(req.user.id);
      res.status(200).json({
        status: 'success',
        data: {
          user: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update name/phone details for the authenticated user.
   */
  updateProfile: async (req, res, next) => {
    try {
      const result = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully.',
        data: {
          user: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch user's address book.
   */
  getAddresses: async (req, res, next) => {
    try {
      const result = await userService.getAddresses(req.user.id);
      res.status(200).json({
        status: 'success',
        data: {
          addresses: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a new address configuration to user's profiles addresses map.
   */
  addAddress: async (req, res, next) => {
    try {
      const result = await userService.addAddress(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Address added successfully.',
        data: {
          addresses: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update details of an existing address document.
   */
  updateAddress: async (req, res, next) => {
    try {
      const result = await userService.updateAddress(req.user.id, req.params.addressId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Address updated successfully.',
        data: {
          addresses: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove an address document from user's addresses array.
   */
  deleteAddress: async (req, res, next) => {
    try {
      const result = await userService.deleteAddress(req.user.id, req.params.addressId);
      res.status(200).json({
        status: 'success',
        message: 'Address deleted successfully.',
        data: {
          addresses: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
