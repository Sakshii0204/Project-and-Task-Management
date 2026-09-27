import mongoose from 'mongoose';
import { Task } from '../models/Task.js';

const SAFE_USER_FIELDS = '_id name email role avatar department';
const SAFE_PROJECT_FIELDS = '_id name code status manager members';
const SAFE_DEP_FIELDS = '_id title status progress dueDate priority';

export const taskRepository = {
  async create(taskData) {
    const task = new Task(taskData);
    return task.save();
  },

  async findById(id) {
    return Task.findById(id);
  },

  async findByIdWithDetails(id) {
    return Task.findById(id)
      .populate('project', SAFE_PROJECT_FIELDS)
      .populate('assignee', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS)
      .populate('dependencies', SAFE_DEP_FIELDS);
  },

  async list(filter = {}, { skip = 0, limit = 20, sort = 'dueDate' } = {}) {
    return Task.find(filter)
      .populate('project', SAFE_PROJECT_FIELDS)
      .populate('assignee', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS)
      .populate('dependencies', SAFE_DEP_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  async count(filter = {}) {
    return Task.countDocuments(filter);
  },

  async update(id, updateData) {
    return Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('project', SAFE_PROJECT_FIELDS)
      .populate('assignee', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS)
      .populate('dependencies', SAFE_DEP_FIELDS);
  },

  async delete(id) {
    return Task.findByIdAndDelete(id);
  },

  async findByProject(projectId) {
    return Task.find({ project: projectId })
      .populate('project', SAFE_PROJECT_FIELDS)
      .populate('assignee', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS)
      .populate('dependencies', SAFE_DEP_FIELDS)
      .sort('dueDate');
  },

  async findByAssignee(assigneeId) {
    return Task.find({ assignee: assigneeId })
      .populate('project', SAFE_PROJECT_FIELDS)
      .populate('assignee', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS)
      .populate('dependencies', SAFE_DEP_FIELDS)
      .sort('dueDate');
  },

  /**
   * DFS Cycle Detection
   * Adding edge: taskId -> newDependencyId
   * If newDependencyId can reach taskId through existing dependencies, cycle exists.
   */
  async wouldCreateCycle(taskId, newDependencyId) {
    if (taskId.toString() === newDependencyId.toString()) {
      return true; // Self-dependency
    }

    const visited = new Set();
    const stack = [newDependencyId.toString()];

    while (stack.length > 0) {
      const currentId = stack.pop();
      if (currentId === taskId.toString()) {
        return true; // Cycle detected: target reached from candidate dependency
      }

      if (!visited.has(currentId)) {
        visited.add(currentId);
        const currentTask = await Task.findById(currentId).select('dependencies').lean();
        if (currentTask && Array.isArray(currentTask.dependencies)) {
          for (const dep of currentTask.dependencies) {
            stack.push(dep.toString());
          }
        }
      }
    }

    return false;
  },

  /**
   * Aggregates project task metrics and calculate real progress
   * Project Progress = SUM(task.progress) / totalTasks
   */
  async getProjectMetrics(projectId) {
    const pId = new mongoose.Types.ObjectId(projectId);
    const tasks = await Task.find({ project: pId }).select('status progress dueDate').lean();

    const total = tasks.length;
    if (total === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        blocked: 0,
        todo: 0,
        overdue: 0,
        progress: 0,
      };
    }

    const now = new Date();
    let completed = 0;
    let inProgress = 0;
    let blocked = 0;
    let todo = 0;
    let overdue = 0;
    let sumProgress = 0;

    for (const t of tasks) {
      sumProgress += Number(t.progress) || 0;
      if (t.status === 'COMPLETED') {
        completed += 1;
      } else {
        if (t.dueDate && new Date(t.dueDate) < now) {
          overdue += 1;
        }
        if (t.status === 'IN_PROGRESS') inProgress += 1;
        else if (t.status === 'BLOCKED') blocked += 1;
        else if (t.status === 'TODO') todo += 1;
      }
    }

    return {
      total,
      totalTasks: total,
      completed,
      completedTasks: completed,
      inProgress,
      inProgressTasks: inProgress,
      blocked,
      blockedTasks: blocked,
      todo,
      todoTasks: todo,
      overdue,
      overdueTasks: overdue,
      progress: Math.round(sumProgress / total),
    };
  },
};
