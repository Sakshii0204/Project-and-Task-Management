import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  changeProjectManagerSchema,
  addProjectMemberSchema,
  projectParamSchema,
  projectMemberParamSchema,
  listProjectsQuerySchema,
} from '../validators/project.validator.js';

const router = Router();

// All project endpoints require authentication
router.use(authenticate);

// Project Collection
router.post(
  '/',
  validate(createProjectSchema),
  projectController.createProject
);

router.get(
  '/',
  validate(listProjectsQuerySchema),
  projectController.listProjects
);

// Individual Project Endpoints
router.get(
  '/:id',
  validate(projectParamSchema),
  projectController.getProjectById
);

router.patch(
  '/:id',
  validate(updateProjectSchema),
  projectController.updateProject
);

router.patch(
  '/:id/status',
  validate(updateProjectStatusSchema),
  projectController.updateProjectStatus
);

router.patch(
  '/:id/archive',
  validate(projectParamSchema),
  projectController.archiveProject
);

router.patch(
  '/:id/manager',
  validate(changeProjectManagerSchema),
  projectController.changeManager
);

// Member Management Endpoints
router.post(
  '/:id/members',
  validate(addProjectMemberSchema),
  projectController.addMember
);

router.delete(
  '/:id/members/:userId',
  validate(projectMemberParamSchema),
  projectController.removeMember
);

export default router;
