// src/routes/index.js

import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import reviewRoutes from './review.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import orderRoutes from './order.routes.js';

const router = express.Router();

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);

export default router;
