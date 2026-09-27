import mongoose from 'mongoose';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Omitted by default from queries
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: Object.values(USER_ROLES),
        message: '{VALUE} is not a supported role',
      },
      default: USER_ROLES.TEAM_MEMBER,
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: '{VALUE} is not a valid status',
      },
      default: USER_STATUS.ACTIVE,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);
