import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { listActivitiesQuerySchema } from '../validators/activity.validator.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(listActivitiesQuerySchema),
  activityController.listActivities
);

export default router;
