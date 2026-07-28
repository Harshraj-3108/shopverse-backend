// backend/src/services/wishlist.service.js

import mongoose from 'mongoose';
import { WishlistRepository } from '../repositories/wishlist.repository.js';
import { Product } from '../models/Product.js';
import { cartService } from './cart.service.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const wishlistRepository = new WishlistRepository();

/**
 * Service to orchestrate Wishlist Management and transactional move-to-cart operations.
 */
export const wishlistService = {
  /**
   * Helper to populate product data fields on wishlist documents.
   * @param {Object} wishlistDoc - Mongoose wishlist document
   */
  populateWishlist: async (wishlistDoc) => {
    return await wishlistDoc.populate(
      'products',
      'name slug sku price salePrice stockQuantity images isActive'
    );
  },

  /**
   * Fetch a user's wishlist, filtering out deleted/deactivated items dynamically.
   * @param {string} userId - User identifier
   */
  getWishlist: async (userId) => {
    let wishlist = await wishlistRepository.model.findOne({ userId });
    if (!wishlist) {
      wishlist = await wishlistRepository.create({ userId, products: [] });
    }

    await wishlistService.populateWishlist(wishlist);

    // Filter inactive or deleted products gracefully
    const activeProducts = wishlist.products.filter(p => p && p.isActive);

    // Asynchronously repair DB references if stale items were filtered out
    if (activeProducts.length !== wishlist.products.length) {
      const activeIds = activeProducts.map(p => p._id);
      await wishlistRepository.model.updateOne(
        { userId },
        { $set: { products: activeIds } }
      );
      wishlist.products = activeProducts;
    }

    return wishlist;
  },

  /**
   * Add a product reference to the wishlist.
   * @param {string} userId - User identifier
   * @param {string} productId - Product identifier
   */
  addToWishlist: async (userId, productId) => {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw AppError.notFound('Product not found or is inactive.', ERROR_CODES.NOT_FOUND);
    }

    let wishlist = await wishlistRepository.model.findOne({ userId });
    if (!wishlist) {
      wishlist = new wishlistRepository.model({ userId, products: [] });
    }

    // Check duplicate favorites items
    const alreadyExists = wishlist.products.some(id => id.toString() === productId);
    if (!alreadyExists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    return await wishlistService.populateWishlist(wishlist);
  },

  /**
   * Remove a product reference from the wishlist.
   * @param {string} userId - User identifier
   * @param {string} productId - Product identifier
   */
  removeFromWishlist: async (userId, productId) => {
    const wishlist = await wishlistRepository.model.findOne({ userId });
    if (!wishlist) {
      throw AppError.notFound('Wishlist not found.', ERROR_CODES.NOT_FOUND);
    }

    const originalLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);

    if (wishlist.products.length === originalLength) {
      throw AppError.notFound('Product not found in wishlist.', ERROR_CODES.NOT_FOUND);
    }

    await wishlist.save();
    return await wishlistService.populateWishlist(wishlist);
  },

  /**
   * Move an item from the wishlist into the shopping cart.
   * Uses MongoDB session transactions to ensure atomicity.
   * @param {string} userId - User identifier
   * @param {string} productId - Product identifier
   */
  moveToCart: async (userId, productId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch wishlist (with session)
      const wishlist = await wishlistRepository.model.findOne({ userId }).session(session);
      if (!wishlist) {
        throw AppError.notFound('Wishlist not found.', ERROR_CODES.NOT_FOUND);
      }

      // Check item presence in wishlist
      const itemIndex = wishlist.products.findIndex(id => id.toString() === productId);
      if (itemIndex === -1) {
        throw AppError.badRequest('Product not found in your wishlist.', ERROR_CODES.BAD_REQUEST);
      }

      // 2. Add to Cart (cartService transaction commits inside its own routine,
      // but by passing the same session, we consolidate it!)
      // Wait, let's execute the cart addition directly in the session or call cartService.addToCart
      // cartService.addToCart handles session creation internally by default,
      // so calling it directly inside this transaction can cause nested transaction conflicts.
      // A cleaner way is to execute cart items updates using the same session here:
      const product = await Product.findById(productId).session(session);
      if (!product || !product.isActive) {
        throw AppError.notFound('Product not found or is inactive.', ERROR_CODES.NOT_FOUND);
      }

      if (product.stockQuantity < 1) {
        throw AppError.badRequest('Insufficient stock to add item to cart.', ERROR_CODES.BAD_REQUEST);
      }

      const CartModel = mongoose.model('Cart');
      let cart = await CartModel.findOne({ userId }).session(session);
      if (!cart) {
        cart = new CartModel({ userId, items: [] });
      }

      const activePrice = product.salePrice !== undefined && product.salePrice !== null 
        ? product.salePrice 
        : product.price;

      const existingCartItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingCartItem) {
        const newQty = existingCartItem.quantity + 1;
        if (product.stockQuantity < newQty) {
          throw AppError.badRequest(
            `Insufficient stock. Available stock: ${product.stockQuantity}, requested: ${newQty}`,
            ERROR_CODES.BAD_REQUEST
          );
        }
        existingCartItem.quantity = newQty;
      } else {
        cart.items.push({
          productId,
          quantity: 1,
          price: activePrice,
        });
      }

      await cart.save({ session });

      // 3. Remove from wishlist and save
      wishlist.products.splice(itemIndex, 1);
      await wishlist.save({ session });

      await session.commitTransaction();

      return await wishlistService.populateWishlist(wishlist);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};
