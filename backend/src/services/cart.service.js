// backend/src/services/cart.service.js

import mongoose from 'mongoose';
import { CartRepository } from '../repositories/cart.repository.js';
import { Product } from '../models/Product.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const cartRepository = new CartRepository();

/**
 * Service to orchestrate Cart Management logic and stock validations.
 */
export const cartService = {
  /**
   * Helper to populate product data fields on cart documents.
   * @param {Object} cartDoc - Mongoose cart document
   */
  populateCart: async (cartDoc) => {
    return await cartDoc.populate(
      'items.productId',
      'name slug sku price salePrice stockQuantity images isActive'
    );
  },

  /**
   * Fetch or initialize a user's cart.
   * @param {string} userId - User identifier
   */
  getOrCreateCart: async (userId) => {
    let cart = await cartRepository.model.findOne({ userId });
    if (!cart) {
      cart = await cartRepository.create({ userId, items: [] });
    }
    return await cartService.populateCart(cart);
  },

  /**
   * Add a product item to the user's cart.
   * Uses MongoDB session transactions to ensure write consistency.
   * @param {string} userId - User identifier
   * @param {Object} itemData - { productId, quantity }
   */
  addToCart: async (userId, itemData) => {
    const { productId, quantity } = itemData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch user's cart (with session)
      let cart = await cartRepository.model.findOne({ userId }).session(session);
      if (!cart) {
        cart = new cartRepository.model({ userId, items: [] });
      }

      // 2. Fetch product (with session)
      const product = await Product.findById(productId).session(session);
      if (!product || !product.isActive) {
        throw AppError.notFound('Product not found or is inactive', ERROR_CODES.NOT_FOUND);
      }

      // 3. Enforce single item initial stock check
      if (product.stockQuantity <= 0) {
        throw AppError.badRequest('Product is out of stock.', ERROR_CODES.BAD_REQUEST);
      }

      const activePrice = product.salePrice !== undefined && product.salePrice !== null 
        ? product.salePrice 
        : product.price;

      // 4. Verify duplication check
      const existingItem = cart.items.find(item => item.productId.toString() === productId);

      if (existingItem) {
        const targetQuantity = existingItem.quantity + quantity;
        
        // Validate aggregated quantity stock constraints
        if (product.stockQuantity < targetQuantity) {
          throw AppError.badRequest(
            `Insufficient stock. Available stock: ${product.stockQuantity}, requested: ${targetQuantity}`,
            ERROR_CODES.BAD_REQUEST
          );
        }

        existingItem.quantity = targetQuantity;
        existingItem.price = activePrice; // Update to current active price
      } else {
        // Validate initial requested quantity
        if (product.stockQuantity < quantity) {
          throw AppError.badRequest(
            `Insufficient stock. Available stock: ${product.stockQuantity}, requested: ${quantity}`,
            ERROR_CODES.BAD_REQUEST
          );
        }

        cart.items.push({
          productId,
          quantity,
          price: activePrice,
        });
      }

      await cart.save({ session });
      await session.commitTransaction();

      // Return fully populated cart response
      return await cartService.populateCart(cart);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Update the quantity of a specific item inside the cart.
   * @param {string} userId - User identifier
   * @param {Object} itemData - { productId, quantity }
   */
  updateCartItemQuantity: async (userId, itemData) => {
    const { productId, quantity } = itemData;

    const cart = await cartRepository.model.findOne({ userId });
    if (!cart) {
      throw AppError.notFound('Cart not found.', ERROR_CODES.NOT_FOUND);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw AppError.notFound('Product not found or is inactive', ERROR_CODES.NOT_FOUND);
    }

    // Validate stock constraints
    if (product.stockQuantity < quantity) {
      throw AppError.badRequest(
        `Insufficient stock. Available stock: ${product.stockQuantity}, requested: ${quantity}`,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (!existingItem) {
      throw AppError.notFound('Product not found in your cart.', ERROR_CODES.NOT_FOUND);
    }

    existingItem.quantity = quantity;
    existingItem.price = product.salePrice !== undefined && product.salePrice !== null 
      ? product.salePrice 
      : product.price;

    await cart.save();
    return await cartService.populateCart(cart);
  },

  /**
   * Remove an item from the user's cart.
   * @param {string} userId - User identifier
   * @param {string} productId - Product ID
   */
  removeFromCart: async (userId, productId) => {
    const cart = await cartRepository.model.findOne({ userId });
    if (!cart) {
      throw AppError.notFound('Cart not found.', ERROR_CODES.NOT_FOUND);
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    if (cart.items.length === originalLength) {
      throw AppError.notFound('Product not found in your cart.', ERROR_CODES.NOT_FOUND);
    }

    await cart.save();
    return await cartService.populateCart(cart);
  },

  /**
   * Clear all items in the user's cart.
   * @param {string} userId - User identifier
   */
  clearCart: async (userId) => {
    const cart = await cartRepository.model.findOne({ userId });
    if (!cart) {
      throw AppError.notFound('Cart not found.', ERROR_CODES.NOT_FOUND);
    }

    cart.items = [];
    await cart.save();
    return await cartService.populateCart(cart);
  },
};
