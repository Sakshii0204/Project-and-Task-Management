import { activityService } from '../services/activity.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const activityController = {
  listActivities: asyncHandler(async (req, res) => {
    const { activities, pagination } = await activityService.listActivities(req.user, req.query);
    res.status(200).json({
      success: true,
      message: 'Activities retrieved successfully',
      data: activities,
      pagination,
    });
  }),
};
