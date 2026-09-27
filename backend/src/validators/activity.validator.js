import { z } from 'zod';
import { ACTIVITY_ACTIONS, ACTIVITY_ENTITIES } from '../models/Activity.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const mongoIdSchema = z.string().regex(objectIdRegex, 'Invalid MongoDB ObjectId format');

export const listActivitiesQuerySchema = z.object({
  query: z.object({
    project: mongoIdSchema.optional(),
    actor: mongoIdSchema.optional(),
    entityType: z.nativeEnum(ACTIVITY_ENTITIES).optional(),
    action: z.nativeEnum(ACTIVITY_ACTIONS).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});
