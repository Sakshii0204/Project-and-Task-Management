import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { USER_ROLES } from '../models/User.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  mongoIdParamSchema,
} from '../validators/user.validator.js';

const router = Router();

// Protect all user management endpoints with authentication
router.use(authenticate);

// Admin & Project Manager can list team members
router.get(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
  userController.getUsers
);

// Admin only: Create new user
router.post(
  '/',
  authorize(USER_ROLES.ADMIN),
  validate(createUserSchema),
  userController.createUser
);

// Get user by ID: Admin, PM, or self
router.get(
  '/:id',
  validate(mongoIdParamSchema),
  userController.getUserById
);

// Admin only: Update user metadata
router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validate(updateUserSchema),
  userController.updateUser
);

// Admin only: Activate/deactivate user account
router.patch(
  '/:id/status',
  authorize(USER_ROLES.ADMIN),
  validate(updateUserStatusSchema),
  userController.updateUserStatus
);

export default router;
