import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../models/Task.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const mongoIdSchema = z.string().regex(objectIdRegex, 'Invalid MongoDB ObjectId format');

export const taskParamSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const taskDependencyParamSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    dependencyId: mongoIdSchema,
  }),
});

export const createTaskSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(150),
      description: z.string().trim().max(2000).optional().default(''),
      project: mongoIdSchema,
      assignee: mongoIdSchema,
      priority: z.nativeEnum(TASK_PRIORITY).optional().default(TASK_PRIORITY.MEDIUM),
      status: z.nativeEnum(TASK_STATUS).optional().default(TASK_STATUS.TODO),
      progress: z.coerce.number().min(0).max(100).optional().default(0),
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid start date format',
        })
        .optional()
        .default(() => new Date().toISOString()),
      dueDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid due date format',
        })
        .optional()
        .default(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()),
      dependencies: z.array(mongoIdSchema).optional().default([]),
    })
    .refine(
      (data) => new Date(data.startDate) <= new Date(data.dueDate),
      {
        message: 'Start date cannot be after due date',
        path: ['dueDate'],
      }
    ),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z
    .object({
      title: z.string().trim().min(2).max(150).optional(),
      description: z.string().trim().max(2000).optional(),
      assignee: mongoIdSchema.optional(),
      priority: z.nativeEnum(TASK_PRIORITY).optional(),
      status: z.nativeEnum(TASK_STATUS).optional(),
      progress: z.coerce.number().min(0).max(100).optional(),
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' })
        .optional(),
      dueDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date format' })
        .optional(),
      dependencies: z.array(mongoIdSchema).optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.dueDate) {
          return new Date(data.startDate) <= new Date(data.dueDate);
        }
        return true;
      },
      {
        message: 'Start date cannot be after due date',
        path: ['dueDate'],
      }
    ),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(TASK_STATUS, {
      errorMap: () => ({ message: 'Invalid task status value' }),
    }),
  }),
});

export const updateTaskProgressSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    progress: z.coerce.number().min(0, 'Progress must be >= 0').max(100, 'Progress must be <= 100'),
  }),
});

export const addDependencySchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    dependencyId: mongoIdSchema,
  }),
});

export const listTasksQuerySchema = z.object({
  query: z.object({
    project: mongoIdSchema.optional(),
    assignee: mongoIdSchema.optional(),
    status: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    search: z.string().trim().optional(),
    overdue: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    sort: z.string().trim().optional().default('dueDate'),
  }),
});
