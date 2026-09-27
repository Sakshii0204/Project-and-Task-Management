import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskProgressSchema,
  addDependencySchema,
  taskParamSchema,
  taskDependencyParamSchema,
  listTasksQuerySchema,
} from '../validators/task.validator.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Collection and Special Views
router.post(
  '/',
  validate(createTaskSchema),
  taskController.createTask
);

router.get(
  '/',
  validate(listTasksQuerySchema),
  taskController.listTasks
);

router.get(
  '/my',
  validate(listTasksQuerySchema),
  taskController.getMyTasks
);

router.get(
  '/overdue',
  validate(listTasksQuerySchema),
  taskController.getOverdueTasks
);

router.get(
  '/project/:projectId/metrics',
  taskController.getProjectMetrics
);

// Individual Task Endpoints
router.get(
  '/:id',
  validate(taskParamSchema),
  taskController.getTaskById
);

router.patch(
  '/:id',
  validate(updateTaskSchema),
  taskController.updateTask
);

router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus
);

router.patch(
  '/:id/progress',
  validate(updateTaskProgressSchema),
  taskController.updateTaskProgress
);

router.delete(
  '/:id',
  validate(taskParamSchema),
  taskController.deleteTask
);

// Dependencies Endpoints
router.post(
  '/:id/dependencies',
  validate(addDependencySchema),
  taskController.addDependency
);

router.delete(
  '/:id/dependencies/:dependencyId',
  validate(taskDependencyParamSchema),
  taskController.removeDependency
);

export default router;
