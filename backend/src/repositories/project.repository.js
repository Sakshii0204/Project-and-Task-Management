import { Project } from '../models/Project.js';

const SAFE_USER_FIELDS = '_id name email role avatar department';

export const projectRepository = {
  async create(projectData) {
    const project = new Project(projectData);
    return project.save();
  },

  async findById(id) {
    return Project.findById(id);
  },

  async findByIdWithDetails(id) {
    return Project.findById(id)
      .populate('manager', SAFE_USER_FIELDS)
      .populate('members', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS);
  },

  async findByCode(code) {
    return Project.findOne({ code });
  },

  async list(filter = {}, { skip = 0, limit = 10, sort = '-createdAt' } = {}) {
    return Project.find(filter)
      .populate('manager', SAFE_USER_FIELDS)
      .populate('members', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  async count(filter = {}) {
    return Project.countDocuments(filter);
  },

  async update(id, updateData) {
    return Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('manager', SAFE_USER_FIELDS)
      .populate('members', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS);
  },

  async archive(id) {
    return Project.findByIdAndUpdate(
      id,
      {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
      { new: true }
    )
      .populate('manager', SAFE_USER_FIELDS)
      .populate('members', SAFE_USER_FIELDS)
      .populate('createdBy', SAFE_USER_FIELDS);
  },

  async findHighestCodeNumber() {
    const latest = await Project.findOne({ code: /^PRJ-\d+$/ })
      .sort({ code: -1 })
      .select('code')
      .lean();

    if (!latest || !latest.code) return 0;
    const match = latest.code.match(/^PRJ-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  },
};
