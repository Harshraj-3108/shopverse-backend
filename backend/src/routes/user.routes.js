// src/routes/user.routes.js

import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
} from '../validators/user.validator.js';
import { validate } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Apply auth protection globally to all user endpoints
router.use(protect);

router.route('/profile')
  .get(userController.getProfile)
  .patch(validate(updateProfileSchema), userController.updateProfile);

router.route('/addresses')
  .get(userController.getAddresses)
  .post(validate(addressSchema), userController.addAddress);

router.route('/addresses/:addressId')
  .put(validate(updateAddressSchema), userController.updateAddress)
  .delete(userController.deleteAddress);

export default router;
