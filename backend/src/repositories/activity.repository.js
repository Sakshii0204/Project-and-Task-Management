import { Activity } from '../models/Activity.js';

const SAFE_ACTOR_FIELDS = '_id name email role avatar department';
const SAFE_PROJECT_FIELDS = '_id name code status';

export const activityRepository = {
  async create(activityData) {
    const activity = new Activity(activityData);
    return activity.save();
  },

  async list(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return Activity.find(filter)
      .populate('actor', SAFE_ACTOR_FIELDS)
      .populate('project', SAFE_PROJECT_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  async count(filter = {}) {
    return Activity.countDocuments(filter);
  },

  async findByProject(projectId, limit = 20) {
    return Activity.find({ project: projectId })
      .populate('actor', SAFE_ACTOR_FIELDS)
      .populate('project', SAFE_PROJECT_FIELDS)
      .sort({ createdAt: -1 })
      .limit(limit);
  },
};
