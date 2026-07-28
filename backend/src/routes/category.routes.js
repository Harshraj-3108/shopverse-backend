// src/routes/category.routes.js

import express from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin restricted mutation routes
router.post('/', protect, authorize('admin'), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', protect, authorize('admin'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

export default router;
