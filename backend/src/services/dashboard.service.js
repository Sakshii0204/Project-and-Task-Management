import { dashboardRepository } from '../repositories/dashboard.repository.js';
import { activityRepository } from '../repositories/activity.repository.js';
import { Project } from '../models/Project.js';

export const dashboardService = {
  /**
   * Get role-aware dashboard payload
   */
  async getDashboardData(user) {
    const role = user.role;

    if (role === 'ADMIN') {
      const [
        metrics,
        projectStatusDistribution,
        taskStatusDistribution,
        upcomingDeadlines,
        recentActivitiesResult,
        projectProgress,
        teamWorkload,
      ] = await Promise.all([
        dashboardRepository.getAdminMetrics(),
        dashboardRepository.getProjectStatusDistribution(),
        dashboardRepository.getTaskStatusDistribution(),
        dashboardRepository.getUpcomingDeadlines({}, 6),
        activityRepository.list({}, { page: 1, limit: 8 }),
        dashboardRepository.getProjectProgressSummaries({}, 6),
        dashboardRepository.getTeamWorkload(null, 6),
      ]);

      return {
        role,
        metrics,
        projectStatusDistribution,
        taskStatusDistribution,
        upcomingDeadlines,
        recentActivities: recentActivitiesResult.activities,
        projectProgress,
        teamWorkload,
      };
    }

    if (role === 'PROJECT_MANAGER') {
      // Find projects managed by this PM or where PM is member
      const accessibleProjects = await Project.find({
        $or: [{ manager: user._id }, { members: user._id }],
        status: { $ne: 'ARCHIVED' },
      }).select('_id');

      const projectIds = accessibleProjects.map((p) => p._id);

      const [
        metrics,
        projectStatusDistribution,
        taskStatusDistribution,
        upcomingDeadlines,
        recentActivitiesResult,
        projectProgress,
        teamWorkload,
      ] = await Promise.all([
        dashboardRepository.getProjectManagerMetrics(projectIds),
        dashboardRepository.getProjectStatusDistribution({ _id: { $in: projectIds } }),
        dashboardRepository.getTaskStatusDistribution({ project: { $in: projectIds } }),
        dashboardRepository.getUpcomingDeadlines({ project: { $in: projectIds } }, 6),
        activityRepository.list({ project: { $in: projectIds } }, { page: 1, limit: 8 }),
        dashboardRepository.getProjectProgressSummaries({ _id: { $in: projectIds } }, 6),
        dashboardRepository.getTeamWorkload(projectIds, 6),
      ]);

      return {
        role,
        metrics,
        projectStatusDistribution,
        taskStatusDistribution,
        upcomingDeadlines,
        recentActivities: recentActivitiesResult.activities,
        projectProgress,
        teamWorkload,
      };
    }

    // TEAM_MEMBER
    // Find member projects
    const memberProjects = await Project.find({
      members: user._id,
      status: { $ne: 'ARCHIVED' },
    }).select('_id');
    const memberProjectIds = memberProjects.map((p) => p._id);

    const [
      metrics,
      taskStatusDistribution,
      upcomingDeadlines,
      recentActivitiesResult,
      projectProgress,
    ] = await Promise.all([
      dashboardRepository.getTeamMemberMetrics(user._id, memberProjectIds),
      dashboardRepository.getTaskStatusDistribution({ assignee: user._id }),
      dashboardRepository.getUpcomingDeadlines({ assignee: user._id }, 6),
      activityRepository.list(
        {
          $or: [
            { project: { $in: memberProjectIds } },
            { actor: user._id },
          ],
        },
        { page: 1, limit: 8 }
      ),
      dashboardRepository.getProjectProgressSummaries({ _id: { $in: memberProjectIds } }, 6),
    ]);

    return {
      role,
      metrics,
      projectStatusDistribution: [],
      taskStatusDistribution,
      upcomingDeadlines,
      recentActivities: recentActivitiesResult.activities,
      projectProgress,
      teamWorkload: [],
    };
  },
};
