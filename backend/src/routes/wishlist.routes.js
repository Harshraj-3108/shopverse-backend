// backend/src/routes/wishlist.routes.js

import express from 'express';
import { wishlistController } from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { wishlistProductSchema } from '../validators/wishlist.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Enforce session checks on all wishlist paths
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/', validate(wishlistProductSchema), wishlistController.addToWishlist);
router.post('/move-to-cart', validate(wishlistProductSchema), wishlistController.moveToCart);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
