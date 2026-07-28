// backend/src/routes/product.routes.js

import express from 'express';
import multer from 'multer';
import { productController } from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from '../validators/product.validator.js';
import { validate, validateQuery } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Multer memory storage configuration for streaming buffer files directly to ImageKit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Max size limit: 5MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

// Public read catalog routes
router.get('/', validateQuery(listProductsQuerySchema), productController.listProducts);
router.get('/slug/:slug', productController.getProductBySlug);

// Guard all product mutations for admin roles
router.use(protect);
router.use(authorize('admin'));

router.post('/', validate(createProductSchema), productController.createProduct);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Upload array route: accepts key name 'images' up to 5 files
router.post('/:id/images', upload.array('images', 5), productController.uploadImages);

export default router;
