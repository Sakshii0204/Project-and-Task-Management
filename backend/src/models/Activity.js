import mongoose from 'mongoose';

export const ACTIVITY_ACTIONS = {
  USER_CREATED: 'USER_CREATED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_STATUS_CHANGED: 'PROJECT_STATUS_CHANGED',
  PROJECT_MEMBER_ADDED: 'PROJECT_MEMBER_ADDED',
  PROJECT_MEMBER_REMOVED: 'PROJECT_MEMBER_REMOVED',
  PROJECT_MANAGER_CHANGED: 'PROJECT_MANAGER_CHANGED',
  PROJECT_ARCHIVED: 'PROJECT_ARCHIVED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_PROGRESS_CHANGED: 'TASK_PROGRESS_CHANGED',
  TASK_ASSIGNEE_CHANGED: 'TASK_ASSIGNEE_CHANGED',
  TASK_DEPENDENCY_ADDED: 'TASK_DEPENDENCY_ADDED',
  TASK_DEPENDENCY_REMOVED: 'TASK_DEPENDENCY_REMOVED',
  TASK_DELETED: 'TASK_DELETED',
};

export const ACTIVITY_ENTITIES = {
  USER: 'USER',
  PROJECT: 'PROJECT',
  TASK: 'TASK',
};

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity actor is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Activity action is required'],
      enum: {
        values: Object.values(ACTIVITY_ACTIONS),
        message: '{VALUE} is not a valid activity action',
      },
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: {
        values: Object.values(ACTIVITY_ENTITIES),
        message: '{VALUE} is not a valid entity type',
      },
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
activitySchema.index({ createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
