// backend/src/routes/review.routes.js

import express from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsQuerySchema,
} from '../validators/review.validator.js';
import { validate, validateQuery } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Public route to list reviews
router.get('/product/:productId', validateQuery(listReviewsQuerySchema), reviewController.getProductReviews);

// Protected routes (require user session)
router.use(protect);

router.post('/', validate(createReviewSchema), reviewController.createReview);
router.put('/:id', validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
