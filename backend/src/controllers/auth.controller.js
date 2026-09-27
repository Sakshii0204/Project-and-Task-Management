import { authService } from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: { user },
    });
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }),

  logout: asyncHandler(async (_req, res) => {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }),
};
