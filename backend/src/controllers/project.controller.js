import { projectService } from '../services/project.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const projectController = {
  createProject: asyncHandler(async (req, res) => {
    const project = await projectService.createProject(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  }),

  listProjects: asyncHandler(async (req, res) => {
    const result = await projectService.listProjectsForUser(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: result,
    });
  }),

  getProjectById: asyncHandler(async (req, res) => {
    const project = await projectService.getProjectByIdForUser(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: { project },
    });
  }),

  updateProject: asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  }),

  updateProjectStatus: asyncHandler(async (req, res) => {
    const project = await projectService.updateProjectStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: { project },
    });
  }),

  archiveProject: asyncHandler(async (req, res) => {
    const project = await projectService.archiveProject(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Project archived successfully',
      data: { project },
    });
  }),

  addMember: asyncHandler(async (req, res) => {
    const project = await projectService.addProjectMember(
      req.params.id,
      req.body.userId,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Member added to project successfully',
      data: { project },
    });
  }),

  removeMember: asyncHandler(async (req, res) => {
    const project = await projectService.removeProjectMember(
      req.params.id,
      req.params.userId,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Member removed from project successfully',
      data: { project },
    });
  }),

  changeManager: asyncHandler(async (req, res) => {
    const project = await projectService.changeProjectManager(
      req.params.id,
      req.body.manager,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Project manager updated successfully',
      data: { project },
    });
  }),
};
