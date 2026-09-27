import { z } from 'zod';
import mongoose from 'mongoose';
import { USER_ROLES, USER_STATUS } from '../models/User.js';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const mongoIdParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(mongoIdRegex, 'Invalid MongoDB ObjectId format')
      .refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid MongoDB ObjectId'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    role: z.enum(
      [USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.TEAM_MEMBER],
      {
        errorMap: () => ({ message: 'Role must be ADMIN, PROJECT_MANAGER, or TEAM_MEMBER' }),
      }
    ),
    department: z.string().trim().optional(),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(mongoIdRegex, 'Invalid MongoDB ObjectId format')
      .refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid MongoDB ObjectId'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum([USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.TEAM_MEMBER]).optional(),
    department: z.string().trim().optional(),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional(),
    avatar: z.string().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(mongoIdRegex, 'Invalid MongoDB ObjectId format')
      .refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid MongoDB ObjectId'),
  }),
  body: z.object({
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE], {
      errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
    }),
  }),
});
