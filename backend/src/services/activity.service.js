import { activityRepository } from '../repositories/activity.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { USER_ROLES } from '../models/User.js';

export const activityService = {
  async logActivity({
    actor,
    action,
    entityType,
    entityId,
    project = null,
    description,
    metadata = {},
  }) {
    try {
      if (!actor || !action || !entityType || !entityId || !description) {
        return null;
      }

      return await activityRepository.create({
        actor,
        action,
        entityType,
        entityId,
        project,
        description,
        metadata,
      });
    } catch (err) {
      console.error('[ActivityService] Failed to log activity:', err.message);
      return null;
    }
  },

  async listActivities(user, query = {}) {
    const { project, actor, entityType, action, page = 1, limit = 20 } = query;

    const filter = {};

    // 1. Role Scoping
    if (user.role === USER_ROLES.ADMIN) {
      if (project) filter.project = project;
    } else if (user.role === USER_ROLES.PROJECT_MANAGER) {
      // Find projects managed or participated in by this PM
      const accessibleProjects = await projectRepository.list({
        $or: [{ manager: user._id }, { members: user._id }],
      }, { limit: 500 });
      const projectIds = accessibleProjects.map((p) => p._id);

      if (project) {
        const isAllowed = projectIds.some((id) => id.toString() === project.toString());
        if (!isAllowed) {
          return {
            activities: [],
            pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 },
          };
        }
        filter.project = project;
      } else {
        filter.project = { $in: projectIds };
      }
    } else {
      // TEAM_MEMBER: Only activities for projects the member belongs to
      const memberProjects = await projectRepository.list({
        members: user._id,
      }, { limit: 500 });
      const projectIds = memberProjects.map((p) => p._id);

      if (project) {
        const isAllowed = projectIds.some((id) => id.toString() === project.toString());
        if (!isAllowed) {
          return {
            activities: [],
            pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 },
          };
        }
        filter.project = project;
      } else {
        filter.project = { $in: projectIds };
      }
    }

    if (actor) filter.actor = actor;
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      activityRepository.list(filter, { skip, limit: Number(limit) }),
      activityRepository.count(filter),
    ]);

    return {
      activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  },
};
