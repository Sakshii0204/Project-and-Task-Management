import { userService } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  getUsers: asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const users = await userService.getAllUsers(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  }),

  getUserById: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }),

  createUser: asyncHandler(async (req, res) => {
    const newUser = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: newUser },
    });
  }),

  updateUser: asyncHandler(async (req, res) => {
    const updated = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: updated },
    });
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const updated = await userService.updateUserStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      data: { user: updated },
    });
  }),
};
