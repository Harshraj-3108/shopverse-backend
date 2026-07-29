// backend/src/routes/homepage.routes.js

import express from 'express';
import { homepageController } from '../controllers/homepage.controller.js';

const router = express.Router();

/**
 * GET /homepage
 * Aggregated homepage data: newest products, top-rated, featured categories.
 * Cached for 3 minutes in Redis.
 */
router.get('/', homepageController.getHomepageData);

export default router;
