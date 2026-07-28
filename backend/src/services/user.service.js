// src/services/user.service.js

import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const userRepository = new UserRepository();

/**
 * Service orchestrating profile retrievals and address book operations.
 */
export const userService = {
  /**
   * Get user profile details by ID.
   * @param {string} userId - User identifier
   */
  getProfile: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User profile not found', ERROR_CODES.NOT_FOUND);
    }
    
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      isEmailVerified: user.isEmailVerified,
    };
  },

  /**
   * Update profile fields (name, phone).
   * @param {string} userId - User identifier
   * @param {Object} updateData - Modifiable attributes
   */
  updateProfile: async (userId, updateData) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User profile not found', ERROR_CODES.NOT_FOUND);
    }

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;

    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
    };
  },

  /**
   * Get user address book.
   * @param {string} userId - User identifier
   */
  getAddresses: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', ERROR_CODES.NOT_FOUND);
    }
    return user.addresses;
  },

  /**
   * Add a new address to the user's address book.
   * @param {string} userId - User identifier
   * @param {Object} addressData - New address attributes
   */
  addAddress: async (userId, addressData) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', ERROR_CODES.NOT_FOUND);
    }

    // If new address is marked default, set all other addresses to non-default
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Push new subdocument
    user.addresses.push(addressData);
    await user.save();

    return user.addresses;
  },

  /**
   * Update an existing address.
   * @param {string} userId - User identifier
   * @param {string} addressId - Address subdocument identifier
   * @param {Object} addressData - Modifications
   */
  updateAddress: async (userId, addressId, addressData) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', ERROR_CODES.NOT_FOUND);
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw AppError.notFound('Address not found in book', ERROR_CODES.NOT_FOUND);
    }

    // Set other addresses to non-default if this address becomes the default
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update fields
    if (addressData.street !== undefined) address.street = addressData.street;
    if (addressData.city !== undefined) address.city = addressData.city;
    if (addressData.state !== undefined) address.state = addressData.state;
    if (addressData.zipCode !== undefined) address.zipCode = addressData.zipCode;
    if (addressData.country !== undefined) address.country = addressData.country;
    if (addressData.isDefault !== undefined) address.isDefault = addressData.isDefault;

    await user.save();
    return user.addresses;
  },

  /**
   * Delete an address from the book.
   * @param {string} userId - User identifier
   * @param {string} addressId - Address subdocument identifier
   */
  deleteAddress: async (userId, addressId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', ERROR_CODES.NOT_FOUND);
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw AppError.notFound('Address not found in book', ERROR_CODES.NOT_FOUND);
    }

    // Remove address using subdocument pull method
    user.addresses.pull(addressId);
    
    // If we deleted the default address, set the first available address to default
    if (address.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
  },
};
