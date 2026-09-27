import mongoose from 'mongoose';
import { taskRepository } from '../repositories/task.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { activityService } from './activity.service.js';
import { ACTIVITY_ACTIONS, ACTIVITY_ENTITIES } from '../models/Activity.js';
import { ApiError } from '../utils/ApiError.js';
import { USER_ROLES, USER_STATUS } from '../models/User.js';
import { TASK_STATUS } from '../models/Task.js';

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const taskService = {
  async createTask(taskData, user) {
    // 1. RBAC check: Team Members cannot create tasks
    if (user.role === USER_ROLES.TEAM_MEMBER) {
      throw ApiError.forbidden('Team members are not permitted to create tasks');
    }

    // 2. Validate Project existence and state
    const project = await projectRepository.findById(taskData.project);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    if (project.status === 'ARCHIVED') {
      throw ApiError.badRequest('Cannot add tasks to an archived project');
    }

    // Project Manager can only create tasks in projects they manage
    if (
      user.role === USER_ROLES.PROJECT_MANAGER &&
      !project.manager.equals(user._id)
    ) {
      throw ApiError.forbidden('Project Managers can only create tasks in projects they manage');
    }

    // 3. Validate Assignee
    const assignee = await userRepository.findById(taskData.assignee);
    if (!assignee) {
      throw ApiError.badRequest('Assigned user not found');
    }
    if (assignee.status !== USER_STATUS.ACTIVE) {
      throw ApiError.badRequest('Assigned user account is inactive');
    }

    // Assignee must belong to the project (members or manager)
    const isMember = project.members.some((m) => m.toString() === assignee._id.toString());
    const isManager = project.manager.toString() === assignee._id.toString();
    if (!isMember && !isManager) {
      throw ApiError.badRequest('Assignee must be an assigned member of this project');
    }

    // 4. Validate Dependencies
    const cleanDependencies = [];
    if (Array.isArray(taskData.dependencies) && taskData.dependencies.length > 0) {
      const depSet = new Set(taskData.dependencies.map((d) => d.toString()));
      for (const depId of depSet) {
        const depTask = await taskRepository.findById(depId);
        if (!depTask) {
          throw ApiError.badRequest(`Prerequisite dependency task ${depId} does not exist`);
        }
        if (depTask.project.toString() !== project._id.toString()) {
          throw ApiError.badRequest('Dependency tasks must belong to the exact same project');
        }
        cleanDependencies.push(depTask._id);
      }
    }

    // 5. Status & Progress Consistency
    let status = taskData.status || TASK_STATUS.TODO;
    let progress = Number(taskData.progress) || 0;
    let completedAt = null;

    if (status === TASK_STATUS.COMPLETED || progress === 100) {
      // Check if blocked by dependencies before completing
      if (cleanDependencies.length > 0) {
        const depTasks = await taskRepository.list({ _id: { $in: cleanDependencies } });
        const hasUnresolved = depTasks.some((d) => d.status !== TASK_STATUS.COMPLETED);
        if (hasUnresolved) {
          throw ApiError.badRequest(
            'Cannot complete task while blocking prerequisite dependencies remain incomplete'
          );
        }
      }
      status = TASK_STATUS.COMPLETED;
      progress = 100;
      completedAt = new Date();
    }

    // 6. Create Task
    const created = await taskRepository.create({
      ...taskData,
      project: project._id,
      assignee: assignee._id,
      createdBy: user._id,
      dependencies: cleanDependencies,
      status,
      progress,
      completedAt,
    });

    const populated = await taskRepository.findByIdWithDetails(created._id);

    await activityService.logActivity({
      actor: user._id,
      action: ACTIVITY_ACTIONS.TASK_CREATED,
      entityType: ACTIVITY_ENTITIES.TASK,
      entityId: populated._id,
      project: project._id,
      description: `${user.name} created task "${populated.title}" and assigned to ${assignee.name}`,
      metadata: { taskId: populated._id, priority: populated.priority },
    });

    return populated;
  },

  async listTasks(user, query = {}) {
    const {
      project,
      assignee,
      status,
      priority,
      search,
      overdue,
      page = 1,
      limit = 20,
      sort = 'dueDate',
    } = query;

    const filter = {};

    // 1. Role-based scoping of visible projects
    if (user.role === USER_ROLES.ADMIN) {
      // Admin sees all
    } else if (user.role === USER_ROLES.PROJECT_MANAGER) {
      // PM sees tasks in projects they manage or are members of
      const accessibleProjects = await projectRepository.list(
        { $or: [{ manager: user._id }, { members: user._id }] },
        { limit: 1000 }
      );
      const projectIds = accessibleProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    } else {
      // Team members see tasks in projects they are members of
      const memberProjects = await projectRepository.list(
        { members: user._id },
        { limit: 1000 }
      );
      const projectIds = memberProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    // 2. Explicit Project filter
    if (project) {
      if (filter.project && filter.project.$in) {
        // Intersect requested project with accessible projects
        const requestedId = new mongoose.Types.ObjectId(project);
        const hasAccess = filter.project.$in.some((id) => id.equals(requestedId));
        if (!hasAccess) {
          return { tasks: [], pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 1 } };
        }
      }
      filter.project = project;
    }

    // 3. Assignee filter
    if (assignee) {
      filter.assignee = assignee;
    }

    // 4. Status filter
    if (status) {
      filter.status = status.toUpperCase().replace(' ', '_');
    }

    // 5. Priority filter
    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    // 6. Overdue filter
    if (overdue) {
      filter.status = { $ne: TASK_STATUS.COMPLETED };
      filter.dueDate = { $lt: new Date() };
    }

    // 7. Search filter
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      taskRepository.list(filter, { skip, limit, sort }),
      taskRepository.count(filter),
    ]);

    // Decorate each task with derived `isBlocked`
    const decoratedTasks = tasks.map((t) => {
      const plain = t.toJSON();
      const blockingDeps = Array.isArray(t.dependencies)
        ? t.dependencies.filter((d) => d && d.status !== TASK_STATUS.COMPLETED)
        : [];
      plain.isBlocked = blockingDeps.length > 0;
      plain.blockingDependencies = blockingDeps;
      return plain;
    });

    return {
      tasks: decoratedTasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getTaskById(taskId, user) {
    const task = await taskRepository.findByIdWithDetails(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const project = task.project;
    if (!project) {
      throw ApiError.notFound('Associated project not found');
    }

    // Resource Authorization
    if (user.role === USER_ROLES.ADMIN) {
      // Allowed
    } else if (user.role === USER_ROLES.PROJECT_MANAGER) {
      const isManager = project.manager && project.manager.toString() === user._id.toString();
      const isMember = project.members && project.members.some((m) => m.toString() === user._id.toString());
      if (!isManager && !isMember) {
        throw ApiError.forbidden('Access denied. You do not have permission to view this task.');
      }
    } else {
      const isMember = project.members && project.members.some((m) => m.toString() === user._id.toString());
      if (!isMember) {
        throw ApiError.forbidden('Access denied. You do not belong to the project of this task.');
      }
    }

    const plain = task.toJSON();
    const blockingDeps = Array.isArray(task.dependencies)
      ? task.dependencies.filter((d) => d && d.status !== TASK_STATUS.COMPLETED)
      : [];
    plain.isBlocked = blockingDeps.length > 0;
    plain.blockingDependencies = blockingDeps;
    return plain;
  },

  async updateTask(taskId, updates, user) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw ApiError.notFound('Associated project not found');
    }

    // 1. Authorization check
    const isManager = project.manager.equals(user._id);
    const isAssignee = task.assignee.equals(user._id);

    if (user.role === USER_ROLES.ADMIN || (user.role === USER_ROLES.PROJECT_MANAGER && isManager)) {
      // Full administrative permissions on this task
    } else if (user.role === USER_ROLES.TEAM_MEMBER && isAssignee) {
      // Team members can ONLY update status and progress
      const allowedKeys = ['status', 'progress'];
      const attemptedKeys = Object.keys(updates);
      const invalidKeys = attemptedKeys.filter((k) => !allowedKeys.includes(k));
      if (invalidKeys.length > 0) {
        throw ApiError.forbidden(
          'Team members can only update status and progress of their own assigned tasks'
        );
      }
    } else {
      throw ApiError.forbidden('Access denied. You do not have permission to update this task');
    }

    // 2. Validate Assignee if updating
    if (updates.assignee && updates.assignee.toString() !== task.assignee.toString()) {
      const newAssignee = await userRepository.findById(updates.assignee);
      if (!newAssignee) {
        throw ApiError.badRequest('Assigned user not found');
      }
      if (newAssignee.status !== USER_STATUS.ACTIVE) {
        throw ApiError.badRequest('Assigned user is inactive');
      }
      const isMem = project.members.some((m) => m.toString() === newAssignee._id.toString());
      const isMgr = project.manager.toString() === newAssignee._id.toString();
      if (!isMem && !isMgr) {
        throw ApiError.badRequest('New assignee must belong to the project members');
      }
    }

    // 3. Validate Dependencies if updating
    if (updates.dependencies) {
      const depSet = new Set(updates.dependencies.map((d) => d.toString()));
      for (const depId of depSet) {
        if (depId === taskId.toString()) {
          throw ApiError.badRequest('A task cannot depend on itself');
        }
        const depTask = await taskRepository.findById(depId);
        if (!depTask) {
          throw ApiError.badRequest(`Dependency task ${depId} does not exist`);
        }
        if (depTask.project.toString() !== project._id.toString()) {
          throw ApiError.badRequest('Dependency tasks must belong to the exact same project');
        }
        const createsCycle = await taskRepository.wouldCreateCycle(taskId, depId);
        if (createsCycle) {
          throw ApiError.badRequest(
            'Circular dependency detected: a task cannot depend on a downstream dependent task'
          );
        }
      }
    }

    // 4. Status & Progress Consistency & Blocked Completion Prevention
    const currentDependencies = updates.dependencies !== undefined ? updates.dependencies : task.dependencies;
    let newStatus = updates.status !== undefined ? updates.status.toUpperCase().replace(' ', '_') : task.status;
    let newProgress = updates.progress !== undefined ? Number(updates.progress) : task.progress;
    let completedAt = task.completedAt;

    if (task.status === TASK_STATUS.COMPLETED && newStatus !== TASK_STATUS.COMPLETED) {
      // Reopened task: clear completedAt and reset progress if caller did not provide new progress
      completedAt = null;
      if (updates.progress === undefined || newProgress === 100) {
        newProgress = 0;
      }
    }

    if (newStatus === TASK_STATUS.COMPLETED || newProgress === 100) {
      // Check for unfinished blocking dependencies
      if (currentDependencies && currentDependencies.length > 0) {
        const depTasks = await taskRepository.list({ _id: { $in: currentDependencies } });
        const hasUnresolved = depTasks.some((d) => d.status !== TASK_STATUS.COMPLETED);
        if (hasUnresolved) {
          throw ApiError.badRequest(
            'Cannot complete task while blocking prerequisite dependencies remain incomplete'
          );
        }
      }
      newStatus = TASK_STATUS.COMPLETED;
      newProgress = 100;
      completedAt = task.completedAt || new Date();
    }

    const payload = {
      ...updates,
      status: newStatus,
      progress: newProgress,
      completedAt,
    };

    const updated = await taskRepository.update(taskId, payload);
    const plain = updated.toJSON();
    const blockingDeps = Array.isArray(updated.dependencies)
      ? updated.dependencies.filter((d) => d && d.status !== TASK_STATUS.COMPLETED)
      : [];
    plain.isBlocked = blockingDeps.length > 0;
    plain.blockingDependencies = blockingDeps;

    // Log specific task execution actions
    if (updates.status && updates.status.toUpperCase() !== task.status) {
      await activityService.logActivity({
        actor: user._id,
        action: ACTIVITY_ACTIONS.TASK_STATUS_CHANGED,
        entityType: ACTIVITY_ENTITIES.TASK,
        entityId: task._id,
        project: project._id,
        description: `${user.name} changed status of "${task.title}" to ${newStatus}`,
        metadata: { previousStatus: task.status, newStatus },
      });
    } else if (updates.progress !== undefined && Number(updates.progress) !== task.progress) {
      await activityService.logActivity({
        actor: user._id,
        action: ACTIVITY_ACTIONS.TASK_PROGRESS_CHANGED,
        entityType: ACTIVITY_ENTITIES.TASK,
        entityId: task._id,
        project: project._id,
        description: `${user.name} updated progress of "${task.title}" to ${newProgress}%`,
        metadata: { previousProgress: task.progress, newProgress },
      });
    } else {
      await activityService.logActivity({
        actor: user._id,
        action: ACTIVITY_ACTIONS.TASK_UPDATED,
        entityType: ACTIVITY_ENTITIES.TASK,
        entityId: task._id,
        project: project._id,
        description: `${user.name} updated task "${task.title}"`,
        metadata: { updatedFields: Object.keys(updates) },
      });
    }

    return plain;
  },

  async updateTaskStatus(taskId, status, user) {
    return this.updateTask(taskId, { status }, user);
  },

  async updateTaskProgress(taskId, progress, user) {
    return this.updateTask(taskId, { progress }, user);
  },

  async addDependency(taskId, dependencyId, user) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw ApiError.notFound('Associated project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden('Only an Admin or Project Manager can configure task dependencies');
    }

    if (taskId.toString() === dependencyId.toString()) {
      throw ApiError.badRequest('A task cannot depend on itself');
    }

    if (task.dependencies.some((d) => d.toString() === dependencyId.toString())) {
      throw ApiError.conflict('Dependency already exists on this task');
    }

    const depTask = await taskRepository.findById(dependencyId);
    if (!depTask) {
      throw ApiError.notFound('Prerequisite dependency task not found');
    }

    if (depTask.project.toString() !== task.project.toString()) {
      throw ApiError.badRequest('Dependencies must belong to the exact same project');
    }

    // Check for circular dependency
    const createsCycle = await taskRepository.wouldCreateCycle(taskId, dependencyId);
    if (createsCycle) {
      throw ApiError.badRequest(
        'Circular dependency detected: adding this dependency would create a cycle'
      );
    }

    task.dependencies.push(depTask._id);
    await task.save();

    await activityService.logActivity({
      actor: user._id,
      action: ACTIVITY_ACTIONS.TASK_DEPENDENCY_ADDED,
      entityType: ACTIVITY_ENTITIES.TASK,
      entityId: task._id,
      project: project._id,
      description: `${user.name} added prerequisite dependency "${depTask.title}" to "${task.title}"`,
      metadata: { dependencyId: depTask._id },
    });

    return taskRepository.findByIdWithDetails(taskId);
  },

  async removeDependency(taskId, dependencyId, user) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw ApiError.notFound('Associated project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden('Only an Admin or Project Manager can remove dependencies');
    }

    const index = task.dependencies.findIndex((d) => d.toString() === dependencyId.toString());
    if (index === -1) {
      throw ApiError.badRequest('Dependency relationship not found on this task');
    }

    task.dependencies.splice(index, 1);
    await task.save();

    await activityService.logActivity({
      actor: user._id,
      action: ACTIVITY_ACTIONS.TASK_DEPENDENCY_REMOVED,
      entityType: ACTIVITY_ENTITIES.TASK,
      entityId: task._id,
      project: project._id,
      description: `${user.name} removed dependency from task "${task.title}"`,
      metadata: { dependencyId },
    });

    return taskRepository.findByIdWithDetails(taskId);
  },

  async deleteTask(taskId, user) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw ApiError.notFound('Associated project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden('Only an Admin or Project Manager can delete tasks');
    }

    // Clean up dependencies references in other tasks
    const { Task } = await import('../models/Task.js');
    await Task.updateMany(
      { dependencies: task._id },
      { $pull: { dependencies: task._id } }
    );

    await taskRepository.delete(taskId);

    await activityService.logActivity({
      actor: user._id,
      action: ACTIVITY_ACTIONS.TASK_DELETED,
      entityType: ACTIVITY_ENTITIES.TASK,
      entityId: task._id,
      project: project._id,
      description: `${user.name} deleted task "${task.title}"`,
      metadata: { taskTitle: task.title },
    });

    return true;
  },

  async getMyTasks(user, query = {}) {
    return this.listTasks(user, { ...query, assignee: user._id.toString() });
  },

  async getOverdueTasks(user, query = {}) {
    return this.listTasks(user, { ...query, overdue: true });
  },

  async getProjectTasks(projectId, user) {
    return this.listTasks(user, { project: projectId, limit: 100 });
  },

  async getProjectMetrics(projectId, user) {
    // Validate project access
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    if (user.role !== USER_ROLES.ADMIN) {
      const isManager = project.manager.equals(user._id);
      const isMember = project.members.some((m) => m.equals(user._id));
      if (!isManager && !isMember) {
        throw ApiError.forbidden('Access denied to project metrics');
      }
    }

    return taskRepository.getProjectMetrics(projectId);
  },
};
