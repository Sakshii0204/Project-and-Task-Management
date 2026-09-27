import { projectRepository } from '../repositories/project.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { USER_ROLES, USER_STATUS } from '../models/User.js';

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const projectService = {
  async createProject(projectData, user) {
    // 1. Role enforcement: Only ADMIN and PROJECT_MANAGER can create
    if (user.role === USER_ROLES.TEAM_MEMBER) {
      throw ApiError.forbidden('Team members are not permitted to create projects');
    }

    // 2. Validate Manager
    const manager = await userRepository.findById(projectData.manager);
    if (!manager) {
      throw ApiError.badRequest('Assigned project manager does not exist');
    }
    if (manager.status !== USER_STATUS.ACTIVE) {
      throw ApiError.badRequest('Assigned project manager account is inactive');
    }
    if (
      manager.role !== USER_ROLES.ADMIN &&
      manager.role !== USER_ROLES.PROJECT_MANAGER
    ) {
      throw ApiError.badRequest(
        'Project manager must have role ADMIN or PROJECT_MANAGER'
      );
    }

    // 3. Validate and Deduplicate Members
    const memberIdSet = new Set(
      (projectData.members || []).map((id) => id.toString())
    );
    // Manager is always included in members
    memberIdSet.add(manager._id.toString());
    const uniqueMemberIds = Array.from(memberIdSet);

    for (const memberId of uniqueMemberIds) {
      const memberUser = await userRepository.findById(memberId);
      if (!memberUser) {
        throw ApiError.badRequest(`Member user with ID ${memberId} not found`);
      }
      if (memberUser.status !== USER_STATUS.ACTIVE) {
        throw ApiError.badRequest(
          `Member user ${memberUser.name} (${memberUser.email}) is inactive`
        );
      }
    }

    // 4. Generate or Validate Project Code
    let code = projectData.code;
    if (code) {
      const existing = await projectRepository.findByCode(code.toUpperCase());
      if (existing) {
        throw ApiError.conflict(`Project code ${code.toUpperCase()} is already in use`);
      }
      code = code.toUpperCase();
    } else {
      let codeNum = await projectRepository.findHighestCodeNumber();
      let isUnique = false;
      while (!isUnique) {
        codeNum += 1;
        code = `PRJ-${String(codeNum).padStart(4, '0')}`;
        const existing = await projectRepository.findByCode(code);
        if (!existing) {
          isUnique = true;
        }
      }
    }

    // 5. Create Project Record
    const created = await projectRepository.create({
      ...projectData,
      code,
      manager: manager._id,
      members: uniqueMemberIds,
      createdBy: user._id,
    });

    return projectRepository.findByIdWithDetails(created._id);
  },

  async listProjectsForUser(user, query = {}) {
    const {
      search,
      status,
      priority,
      manager,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      includeArchived = false,
    } = query;

    const filter = {};

    // Scope projects by user role (resource-level authorization)
    if (user.role === USER_ROLES.ADMIN) {
      // Admins see all projects
    } else if (user.role === USER_ROLES.PROJECT_MANAGER) {
      // Project Managers see projects they manage or are members of
      filter.$or = [{ manager: user._id }, { members: user._id }];
    } else {
      // Team members see only projects they belong to
      filter.members = user._id;
    }

    // Search filter across project name and code
    if (search) {
      const escaped = escapeRegex(search);
      const searchCondition = [
        { name: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
        delete filter.$or;
      } else {
        filter.$or = searchCondition;
      }
    }

    // Status filter
    if (status) {
      filter.status = status.toUpperCase();
    } else if (!includeArchived) {
      filter.status = { $ne: 'ARCHIVED' };
    }

    // Priority filter
    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    // Manager filter
    if (manager) {
      filter.manager = manager;
    }

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      projectRepository.list(filter, { skip, limit, sort }),
      projectRepository.count(filter),
    ]);

    return {
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getProjectByIdForUser(projectId, user) {
    const project = await projectRepository.findByIdWithDetails(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Resource authorization check
    if (user.role === USER_ROLES.ADMIN) {
      return project;
    }

    const isManager = project.manager && project.manager._id.equals(user._id);
    const isMember =
      project.members &&
      project.members.some((m) => m._id && m._id.equals(user._id));

    if (!isManager && !isMember) {
      throw ApiError.forbidden(
        'Access denied. You do not have permission to view this project.'
      );
    }

    return project;
  },

  async updateProject(projectId, updates, user) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Only Admin or the designated Project Manager can update
    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden(
        'Access denied. Only an Admin or the assigned Project Manager can update this project.'
      );
    }

    // Date range validation if dates are modified
    const startDate = updates.startDate ? new Date(updates.startDate) : project.startDate;
    const dueDate = updates.dueDate ? new Date(updates.dueDate) : project.dueDate;
    if (startDate > dueDate) {
      throw ApiError.badRequest('Start date cannot be after due date');
    }

    return projectRepository.update(projectId, updates);
  },

  async updateProjectStatus(projectId, status, user) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden(
        'Access denied. Only an Admin or the assigned Project Manager can update project status.'
      );
    }

    return projectRepository.update(projectId, { status: status.toUpperCase() });
  },

  async archiveProject(projectId, user) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden(
        'Access denied. Only an Admin or the assigned Project Manager can archive this project.'
      );
    }

    return projectRepository.archive(projectId);
  },

  async addProjectMember(projectId, memberUserId, user) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden(
        'Access denied. Only an Admin or Project Manager can add members.'
      );
    }

    if (project.members.some((m) => m.toString() === memberUserId.toString())) {
      throw ApiError.conflict('User is already a member of this project');
    }

    const memberUser = await userRepository.findById(memberUserId);
    if (!memberUser) {
      throw ApiError.badRequest('User to add not found');
    }
    if (memberUser.status !== USER_STATUS.ACTIVE) {
      throw ApiError.badRequest('Cannot add an inactive user to the project');
    }

    project.members.push(memberUser._id);
    await project.save();

    return projectRepository.findByIdWithDetails(projectId);
  },

  async removeProjectMember(projectId, memberUserId, user) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const isManager = project.manager.equals(user._id);
    if (user.role !== USER_ROLES.ADMIN && !isManager) {
      throw ApiError.forbidden(
        'Access denied. Only an Admin or Project Manager can remove members.'
      );
    }

    if (project.manager.toString() === memberUserId.toString()) {
      throw ApiError.badRequest(
        'Cannot remove the designated Project Manager from project members without reassigning manager first.'
      );
    }

    const memberIndex = project.members.findIndex(
      (m) => m.toString() === memberUserId.toString()
    );
    if (memberIndex === -1) {
      throw ApiError.badRequest('User is not a member of this project');
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    return projectRepository.findByIdWithDetails(projectId);
  },

  async changeProjectManager(projectId, newManagerId, user) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    // Only Admin can reassign manager
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden(
        'Access denied. Only Administrators can reassign project managers.'
      );
    }

    const newManager = await userRepository.findById(newManagerId);
    if (!newManager) {
      throw ApiError.badRequest('New manager user not found');
    }
    if (newManager.status !== USER_STATUS.ACTIVE) {
      throw ApiError.badRequest('Assigned new manager account is inactive');
    }
    if (
      newManager.role !== USER_ROLES.ADMIN &&
      newManager.role !== USER_ROLES.PROJECT_MANAGER
    ) {
      throw ApiError.badRequest(
        'Assigned manager must have role ADMIN or PROJECT_MANAGER'
      );
    }

    project.manager = newManager._id;
    // Ensure new manager is in members array
    if (!project.members.some((m) => m.toString() === newManager._id.toString())) {
      project.members.push(newManager._id);
    }

    await project.save();
    return projectRepository.findByIdWithDetails(projectId);
  },
};
