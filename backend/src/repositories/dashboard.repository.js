import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

export const dashboardRepository = {
  /**
   * System-wide metrics for Admin role
   */
  async getAdminMetrics() {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
      Project.countDocuments({ status: { $ne: 'ARCHIVED' } }),
      Project.countDocuments({ status: 'ACTIVE' }),
      Project.countDocuments({ status: 'COMPLETED' }),
      Project.countDocuments({ status: 'ON_HOLD' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'TODO' }),
      Task.countDocuments({ status: 'IN_PROGRESS' }),
      Task.countDocuments({ status: 'COMPLETED' }),
      Task.countDocuments({ status: 'BLOCKED' }),
      Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: 'COMPLETED' },
      }),
    ]);

    const overallTaskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      overallTaskCompletionRate,
    };
  },

  /**
   * Metrics scoped to Project Manager (managed/member projects)
   */
  async getProjectManagerMetrics(userProjectIds) {
    const [
      managedProjects,
      activeProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
    ] = await Promise.all([
      Project.countDocuments({ _id: { $in: userProjectIds }, status: { $ne: 'ARCHIVED' } }),
      Project.countDocuments({
        _id: { $in: userProjectIds },
        status: 'ACTIVE',
      }),
      Task.countDocuments({ project: { $in: userProjectIds } }),
      Task.countDocuments({
        project: { $in: userProjectIds },
        status: 'TODO',
      }),
      Task.countDocuments({
        project: { $in: userProjectIds },
        status: 'IN_PROGRESS',
      }),
      Task.countDocuments({
        project: { $in: userProjectIds },
        status: 'COMPLETED',
      }),
      Task.countDocuments({
        project: { $in: userProjectIds },
        status: 'BLOCKED',
      }),
      Task.countDocuments({
        project: { $in: userProjectIds },
        dueDate: { $lt: new Date() },
        status: { $ne: 'COMPLETED' },
      }),
    ]);

    // Unique team members across managed projects
    const projects = await Project.find({ _id: { $in: userProjectIds } }).select('members manager');
    const memberSet = new Set();
    projects.forEach((p) => {
      if (p.manager) memberSet.add(p.manager.toString());
      if (Array.isArray(p.members)) {
        p.members.forEach((m) => memberSet.add(m.toString()));
      }
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      managedProjects,
      activeProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      teamMembers: memberSet.size,
      overallTaskCompletionRate: completionRate,
    };
  },

  /**
   * Metrics scoped to Team Member (assigned tasks and assigned projects)
   */
  async getTeamMemberMetrics(userId, memberProjectIds) {
    const [
      assignedProjects,
      assignedTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
    ] = await Promise.all([
      Project.countDocuments({ _id: { $in: memberProjectIds }, status: { $ne: 'ARCHIVED' } }),
      Task.countDocuments({ assignee: userId }),
      Task.countDocuments({ assignee: userId, status: 'TODO' }),
      Task.countDocuments({
        assignee: userId,
        status: 'IN_PROGRESS',
      }),
      Task.countDocuments({
        assignee: userId,
        status: 'COMPLETED',
      }),
      Task.countDocuments({
        assignee: userId,
        status: 'BLOCKED',
      }),
      Task.countDocuments({
        assignee: userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'COMPLETED' },
      }),
    ]);

    const completionRate =
      assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

    return {
      assignedProjects,
      assignedTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      overallTaskCompletionRate: completionRate,
    };
  },

  /**
   * Status distribution for projects
   */
  async getProjectStatusDistribution(projectFilter = {}) {
    const results = await Project.aggregate([
      { $match: { status: { $ne: 'ARCHIVED' }, ...projectFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const defaultStatuses = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];
    const map = new Map(results.map((r) => [r._id, r.count]));

    return defaultStatuses.map((status) => ({
      status,
      count: map.get(status) || 0,
    }));
  },

  /**
   * Status distribution for tasks
   */
  async getTaskStatusDistribution(taskFilter = {}) {
    const results = await Task.aggregate([
      { $match: { ...taskFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const defaultStatuses = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'];
    const map = new Map(results.map((r) => [r._id, r.count]));

    return defaultStatuses.map((status) => ({
      status,
      count: map.get(status) || 0,
    }));
  },

  /**
   * Upcoming deadlines: tasks due within next 7 days, excluding completed
   */
  async getUpcomingDeadlines(filter = {}, limit = 6) {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    return Task.find({
      dueDate: { $gte: now, $lte: sevenDaysLater },
      status: { $ne: 'COMPLETED' },
      ...filter,
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .populate('project', 'name code status')
      .populate('assignee', 'name email avatar department')
      .select('title priority status dueDate progress dependencies project assignee');
  },

  /**
   * Project progress summaries calculated using Phase 4 rule:
   * round(SUM(task.progress) / task count)
   */
  async getProjectProgressSummaries(projectFilter = {}, limit = 6) {
    const projects = await Project.find({ status: { $ne: 'ARCHIVED' }, ...projectFilter })
      .limit(limit)
      .select('name code status manager members')
      .populate('manager', 'name email');

    const projectIds = projects.map((p) => p._id);

    // Group tasks by project and compute average progress
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          avgProgress: { $avg: '$progress' },
        },
      },
    ]);

    const statsMap = new Map(
      taskStats.map((s) => [
        s._id.toString(),
        {
          totalTasks: s.totalTasks,
          completedTasks: s.completedTasks,
          progress: Math.round(s.avgProgress || 0),
        },
      ])
    );

    return projects.map((p) => {
      const stats = statsMap.get(p._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
      };
      return {
        _id: p._id,
        name: p.name,
        code: p.code,
        status: p.status,
        manager: p.manager,
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        progress: stats.progress,
      };
    });
  },

  /**
   * Team workload summary for PM / Admin
   */
  async getTeamWorkload(projectIds = null, limit = 8) {
    const match = {};
    if (projectIds) {
      match.project = { $in: projectIds };
    }

    const workload = await Task.aggregate([
      { $match: match },
      { $match: { assignee: { $ne: null } } },
      {
        $group: {
          _id: '$assignee',
          totalTasks: { $sum: 1 },
          openTasks: {
            $sum: { $cond: [{ $ne: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'COMPLETED'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { openTasks: -1 } },
      { $limit: limit },
    ]);

    const userIds = workload.map((w) => w._id);
    const users = await User.find({ _id: { $in: userIds } }).select(
      'name email avatar department role'
    );
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return workload.map((w) => ({
      user: userMap.get(w._id.toString()) || { _id: w._id, name: 'Unknown User' },
      totalTasks: w.totalTasks,
      openTasks: w.openTasks,
      completedTasks: w.completedTasks,
      overdueTasks: w.overdueTasks,
    }));
  },
};
