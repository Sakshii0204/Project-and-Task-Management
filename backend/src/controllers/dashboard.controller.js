import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  /**
   * GET /api/dashboard
   * Return role-aware dashboard analytics
   */
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboardData(req.user);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
