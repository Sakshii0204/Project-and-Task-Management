import { z } from 'zod';
import { PROJECT_STATUS, PROJECT_PRIORITY } from '../models/Project.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const mongoIdSchema = z.string().regex(objectIdRegex, 'Invalid MongoDB ObjectId format');

export const projectParamSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const projectMemberParamSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    userId: mongoIdSchema,
  }),
});

export const createProjectSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(150),
      code: z.string().trim().toUpperCase().optional(),
      description: z.string().trim().max(1000).optional().default(''),
      manager: mongoIdSchema,
      members: z.array(mongoIdSchema).optional().default([]),
      status: z.nativeEnum(PROJECT_STATUS).optional().default(PROJECT_STATUS.PLANNING),
      priority: z.nativeEnum(PROJECT_PRIORITY).optional().default(PROJECT_PRIORITY.MEDIUM),
      category: z.string().trim().max(100).optional().default('General'),
      budget: z.string().trim().max(50).optional().default(''),
      startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid start date format',
      }),
      dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid due date format',
      }),
    })
    .refine(
      (data) => new Date(data.startDate) <= new Date(data.dueDate),
      {
        message: 'Start date cannot be after due date',
        path: ['dueDate'],
      }
    ),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(150).optional(),
      description: z.string().trim().max(1000).optional(),
      category: z.string().trim().max(100).optional(),
      budget: z.string().trim().max(50).optional(),
      priority: z.nativeEnum(PROJECT_PRIORITY).optional(),
      status: z.nativeEnum(PROJECT_STATUS).optional(),
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' })
        .optional(),
      dueDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date format' })
        .optional(),
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

export const updateProjectStatusSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(PROJECT_STATUS, {
      errorMap: () => ({ message: 'Invalid project status value' }),
    }),
  }),
});

export const changeProjectManagerSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    manager: mongoIdSchema,
  }),
});

export const addProjectMemberSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    userId: mongoIdSchema,
  }),
});

export const listProjectsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    status: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    manager: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    sort: z.string().trim().optional().default('-createdAt'),
    includeArchived: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});
