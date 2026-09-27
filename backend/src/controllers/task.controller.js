import { taskService } from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const taskController = {
  createTask: asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  }),

  listTasks: asyncHandler(async (req, res) => {
    const result = await taskService.listTasks(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: result,
    });
  }),

  getMyTasks: asyncHandler(async (req, res) => {
    const result = await taskService.getMyTasks(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Personal tasks retrieved successfully',
      data: result,
    });
  }),

  getOverdueTasks: asyncHandler(async (req, res) => {
    const result = await taskService.getOverdueTasks(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Overdue tasks retrieved successfully',
      data: result,
    });
  }),

  getTaskById: asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: { task },
    });
  }),

  updateTask: asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  }),

  updateTaskStatus: asyncHandler(async (req, res) => {
    const task = await taskService.updateTaskStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: { task },
    });
  }),

  updateTaskProgress: asyncHandler(async (req, res) => {
    const task = await taskService.updateTaskProgress(
      req.params.id,
      req.body.progress,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Task progress updated successfully',
      data: { task },
    });
  }),

  addDependency: asyncHandler(async (req, res) => {
    const task = await taskService.addDependency(
      req.params.id,
      req.body.dependencyId,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Dependency added to task successfully',
      data: { task },
    });
  }),

  removeDependency: asyncHandler(async (req, res) => {
    const task = await taskService.removeDependency(
      req.params.id,
      req.params.dependencyId,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Dependency removed from task successfully',
      data: { task },
    });
  }),

  deleteTask: asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  }),

  getProjectMetrics: asyncHandler(async (req, res) => {
    const metrics = await taskService.getProjectMetrics(req.params.projectId, req.user);
    res.status(200).json({
      success: true,
      message: 'Project task metrics retrieved successfully',
      data: { metrics },
    });
  }),
};
