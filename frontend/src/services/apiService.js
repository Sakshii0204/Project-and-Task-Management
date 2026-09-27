/**
 * API Service Layer (Phase 3)
 * Connects Authentication, User Management, and Project Management to Express + MongoDB backend.
 * Uses credentials: 'include' for HttpOnly cookie session handling.
 *
 * STRICT PHASE BOUNDARY:
 * Users & Projects -> Real Express + MongoDB Backend
 * Tasks & Activities -> Preserved Phase 1 Mock / localStorage engine (Migrating in Phase 4)
 */

import { mockUsers } from '../data/mockUsers';
import { mockProjects } from '../data/mockProjects';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STORAGE_KEYS = {
  PROJECTS: 'ptms_projects',
  TASKS: 'ptms_tasks',
  ACTIVITIES: 'ptms_activities',
};

// Generic fetch wrapper with HttpOnly cookie credentials
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Automatically send HttpOnly JWT session cookie
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorDetails = data?.errors?.map((e) => e.message).filter(Boolean).join('; ');
    const errorMsg =
      errorDetails
        ? (data?.message && data.message !== 'Validation failed' && data.message !== 'Validation Error'
            ? `${data.message}: ${errorDetails}`
            : errorDetails)
        : data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Normalize MongoDB user object to ensure frontend compatibility
export function normalizeUser(user) {
  if (!user) return null;
  const roleMapping = {
    ADMIN: 'Admin',
    PROJECT_MANAGER: 'Project Manager',
    TEAM_MEMBER: 'Team Member',
  };

  const normalizedRole = roleMapping[user.role] || user.role;

  return {
    ...user,
    id: user._id || user.id,
    role: normalizedRole,
    rawRole: user.role,
  };
}

// Normalize MongoDB project object to ensure frontend compatibility
export function normalizeProject(project) {
  if (!project) return null;

  const statusMapping = {
    PLANNING: 'Planning',
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
  };

  const priorityMapping = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };

  const managerId = project.manager?._id || project.manager || project.managerId || '';
  const managerName = project.manager?.name || project.managerName || 'Unassigned';
  const members = project.members || [];
  const teamMemberIds = members.map((m) => (m?._id ? m._id.toString() : m.toString()));

  // Deterministic mock task compatibility mapping for seeded projects
  const codeToLegacyId = {
    'PRJ-0001': 'proj-1',
    'PRJ-0002': 'proj-2',
    'PRJ-0003': 'proj-3',
    'PRJ-0004': 'proj-4',
    'PRJ-0005': 'proj-5',
    'ECM-2026': 'proj-1',
    'EPG-2026': 'proj-2',
    'HRM-2026': 'proj-3',
    'CAE-2026': 'proj-4',
    'MBA-2026': 'proj-5',
  };

  const legacyId = codeToLegacyId[project.code] || null;

  return {
    ...project,
    id: project._id ? project._id.toString() : project.id,
    _id: project._id ? project._id.toString() : project.id,
    legacyId,
    status: statusMapping[project.status] || project.status,
    rawStatus: project.status,
    priority: priorityMapping[project.priority] || project.priority,
    rawPriority: project.priority,
    managerId: managerId ? managerId.toString() : '',
    managerName,
    members: members.map(normalizeUser),
    teamMemberIds,
    category: project.category || 'General',
    budget: project.budget || '',
    startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : '',
  };
}

// Local storage helpers for mock task data
function getStoredData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
}

// Normalize MongoDB task object to ensure frontend compatibility
export function normalizeTask(task) {
  if (!task) return null;

  const statusMapping = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    BLOCKED: 'Blocked',
    COMPLETED: 'Completed',
  };

  const priorityMapping = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };

  const id = task._id ? task._id.toString() : task.id;
  const projectObj = task.project && typeof task.project === 'object' ? task.project : null;
  const projectId = projectObj ? (projectObj._id ? projectObj._id.toString() : projectObj.id) : (task.project?.toString() || task.projectId || '');
  const projectName = projectObj ? projectObj.name : (task.projectName || 'Unassigned Project');

  const assigneeObj = task.assignee && typeof task.assignee === 'object' ? task.assignee : null;
  const assigneeId = assigneeObj ? (assigneeObj._id ? assigneeObj._id.toString() : assigneeObj.id) : (task.assignee?.toString() || task.assigneeId || '');
  const assigneeName = assigneeObj ? assigneeObj.name : (task.assigneeName || 'Unassigned');
  const assigneeAvatar = assigneeObj ? (assigneeObj.avatar || '') : (task.assigneeAvatar || '');

  const createdByObj = task.createdBy && typeof task.createdBy === 'object' ? task.createdBy : null;
  const createdById = createdByObj ? (createdByObj._id ? createdByObj._id.toString() : createdByObj.id) : (task.createdBy?.toString() || task.creatorId || '');
  const creatorName = createdByObj ? createdByObj.name : (task.creatorName || '');

  // Normalized dependencies
  const dependencies = Array.isArray(task.dependencies)
    ? task.dependencies.map((d) => {
        if (!d) return null;
        if (typeof d === 'object') {
          return {
            id: d._id ? d._id.toString() : d.id,
            _id: d._id ? d._id.toString() : d.id,
            title: d.title || 'Prerequisite Task',
            status: statusMapping[d.status] || d.status || 'To Do',
            rawStatus: d.status,
            progress: Number(d.progress) || 0,
          };
        }
        return d.toString();
      }).filter(Boolean)
    : [];

  const rawStatus = task.status || 'TODO';
  const rawPriority = task.priority || 'MEDIUM';

  return {
    ...task,
    id,
    _id: id,
    title: task.title || '',
    description: task.description || '',
    projectId,
    project: projectId,
    projectName,
    projectCode: projectObj?.code || '',
    assigneeId,
    assignee: assigneeId,
    assigneeName,
    assigneeAvatar,
    createdById,
    creatorName,
    status: statusMapping[rawStatus] || rawStatus,
    rawStatus,
    priority: priorityMapping[rawPriority] || rawPriority,
    rawPriority,
    progress: Number(task.progress) || 0,
    startDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    completedAt: task.completedAt || null,
    dependencies,
    isBlocked: Boolean(task.isBlocked),
    blockingDependencies: Array.isArray(task.blockingDependencies)
      ? task.blockingDependencies.map((b) => (typeof b === 'object' ? b.title || b.name || 'Prerequisite' : b))
      : [],
    isOverdue: Boolean(task.isOverdue),
    daysOverdue: Number(task.daysOverdue) || 0,
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || new Date().toISOString(),
  };
}

export const apiService = {
  // ==========================================
  // REAL BACKEND API: Authentication & Users
  // ==========================================

  async login(email, password) {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return normalizeUser(response.data?.user);
  },

  async getMe() {
    const response = await request('/auth/me', {
      method: 'GET',
    });
    return normalizeUser(response.data?.user);
  },

  async logout() {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  async getUsers() {
    try {
      const response = await request('/users', {
        method: 'GET',
      });
      const dbUsers = response.data?.users || [];
      return dbUsers.map(normalizeUser);
    } catch {
      return mockUsers.map(normalizeUser);
    }
  },

  async createUser(userData) {
    const response = await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return normalizeUser(response.data?.user);
  },

  async updateUser(userId, updates) {
    const response = await request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return normalizeUser(response.data?.user);
  },

  async updateUserStatus(userId, status) {
    const response = await request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return normalizeUser(response.data?.user);
  },

  // ==========================================
  // REAL BACKEND API: Projects (Phase 3)
  // ==========================================

  async getProjects(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.status) queryParams.set('status', params.status);
      if (params.priority) queryParams.set('priority', params.priority);
      if (params.page) queryParams.set('page', params.page);
      if (params.limit) queryParams.set('limit', params.limit);
      if (params.includeArchived) queryParams.set('includeArchived', 'true');

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await request(`/projects${queryString}`, {
        method: 'GET',
      });
      const rawProjects = response.data?.projects || [];
      const normalized = rawProjects.map(normalizeProject);
      setStoredData(STORAGE_KEYS.PROJECTS, normalized);
      return normalized;
    } catch (err) {
      console.warn('Backend /projects fetch fallback:', err.message);
      return getStoredData(STORAGE_KEYS.PROJECTS, mockProjects).map(normalizeProject);
    }
  },

  async getProjectById(id) {
    try {
      const response = await request(`/projects/${id}`, {
        method: 'GET',
      });
      return normalizeProject(response.data?.project);
    } catch {
      const cached = getStoredData(STORAGE_KEYS.PROJECTS, mockProjects);
      const found = cached.find((p) => p.id === id || p.legacyId === id);
      return found ? normalizeProject(found) : null;
    }
  },

  async createProject(projectData) {
    const payload = {
      name: projectData.name,
      description: projectData.description || '',
      category: projectData.category || 'General',
      budget: projectData.budget || '',
      manager: projectData.managerId || projectData.manager,
      members: projectData.teamMemberIds || projectData.members || [],
      priority: (projectData.priority || 'MEDIUM').toUpperCase(),
      status: (projectData.status || 'PLANNING').toUpperCase().replace(' ', '_'),
      startDate: projectData.startDate,
      dueDate: projectData.dueDate,
    };
    if (projectData.code) payload.code = projectData.code;

    const response = await request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeProject(response.data?.project);
  },

  async updateProject(id, updates) {
    const payload = { ...updates };
    if (updates.priority) payload.priority = updates.priority.toUpperCase();
    if (updates.status) payload.status = updates.status.toUpperCase().replace(' ', '_');
    if (updates.managerId) payload.manager = updates.managerId;

    const response = await request(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeProject(response.data?.project);
  },

  async updateProjectStatus(id, status) {
    const response = await request(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: status.toUpperCase().replace(' ', '_') }),
    });
    return normalizeProject(response.data?.project);
  },

  async archiveProject(id) {
    const response = await request(`/projects/${id}/archive`, {
      method: 'PATCH',
    });
    return normalizeProject(response.data?.project);
  },

  async addProjectMember(id, userId) {
    const response = await request(`/projects/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return normalizeProject(response.data?.project);
  },

  async removeProjectMember(id, userId) {
    const response = await request(`/projects/${id}/members/${userId}`, {
      method: 'DELETE',
    });
    return normalizeProject(response.data?.project);
  },

  async changeProjectManager(id, manager) {
    const response = await request(`/projects/${id}/manager`, {
      method: 'PATCH',
      body: JSON.stringify({ manager }),
    });
    return normalizeProject(response.data?.project);
  },

  async deleteProject(id) {
    return this.archiveProject(id);
  },

  // ==========================================
  // REAL BACKEND API: Tasks (Phase 4)
  // ==========================================

  async getTasks(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.project) queryParams.set('project', params.project);
    if (params.assignee) queryParams.set('assignee', params.assignee);
    if (params.status) queryParams.set('status', params.status);
    if (params.priority) queryParams.set('priority', params.priority);
    if (params.search) queryParams.set('search', params.search);
    if (params.overdue) queryParams.set('overdue', 'true');
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.sort) queryParams.set('sort', params.sort);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await request(`/tasks${queryString}`, {
      method: 'GET',
    });
    const rawTasks = response.data?.tasks || [];
    return rawTasks.map(normalizeTask);
  },

  async getTaskById(id) {
    const response = await request(`/tasks/${id}`, {
      method: 'GET',
    });
    return normalizeTask(response.data?.task);
  },

  async getMyTasks(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.set('status', params.status);
    if (params.priority) queryParams.set('priority', params.priority);
    if (params.search) queryParams.set('search', params.search);
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await request(`/tasks/my${queryString}`, {
      method: 'GET',
    });
    const rawTasks = response.data?.tasks || [];
    return rawTasks.map(normalizeTask);
  },

  async getOverdueTasks(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await request(`/tasks/overdue${queryString}`, {
      method: 'GET',
    });
    const rawTasks = response.data?.tasks || [];
    return rawTasks.map(normalizeTask);
  },

  async createTask(taskData) {
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      project: taskData.projectId || taskData.project,
      assignee: taskData.assigneeId || taskData.assignee,
      priority: (taskData.priority || 'MEDIUM').toUpperCase(),
      status: (taskData.status || 'TODO').toUpperCase().replace(' ', '_'),
      progress: Number(taskData.progress) || 0,
      dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
    };
    if (taskData.startDate) {
      payload.startDate = taskData.startDate;
    }
    if (taskData.dueDate) {
      payload.dueDate = taskData.dueDate;
      if (!taskData.startDate) {
        const due = new Date(taskData.dueDate);
        const today = new Date();
        payload.startDate = today <= due ? today.toISOString().slice(0, 10) : taskData.dueDate;
      }
    }

    const response = await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTask(response.data?.task);
  },

  async updateTask(id, updates) {
    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.assigneeId || updates.assignee) payload.assignee = updates.assigneeId || updates.assignee;
    if (updates.priority) payload.priority = updates.priority.toUpperCase();
    if (updates.status) payload.status = updates.status.toUpperCase().replace(' ', '_');
    if (updates.progress !== undefined) payload.progress = Number(updates.progress);
    if (updates.startDate) payload.startDate = updates.startDate;
    if (updates.dueDate) payload.dueDate = updates.dueDate;
    if (updates.dependencies) payload.dependencies = updates.dependencies;

    const response = await request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeTask(response.data?.task);
  },

  async updateTaskStatus(id, status) {
    const response = await request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: status.toUpperCase().replace(' ', '_') }),
    });
    return normalizeTask(response.data?.task);
  },

  async updateTaskProgress(id, progress) {
    const response = await request(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress: Number(progress) }),
    });
    return normalizeTask(response.data?.task);
  },

  async addTaskDependency(taskId, dependencyId) {
    const response = await request(`/tasks/${taskId}/dependencies`, {
      method: 'POST',
      body: JSON.stringify({ dependencyId }),
    });
    return normalizeTask(response.data?.task);
  },

  async removeTaskDependency(taskId, dependencyId) {
    const response = await request(`/tasks/${taskId}/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });
    return normalizeTask(response.data?.task);
  },

  async deleteTask(id) {
    await request(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  async getProjectMetrics(projectId) {
    const response = await request(`/tasks/project/${projectId}/metrics`, {
      method: 'GET',
    });
    return response.data?.metrics;
  },

  // ==========================================
  // Dashboard Analytics (Phase 5)
  // ==========================================

  async getDashboard() {
    const response = await request('/dashboard', {
      method: 'GET',
    });
    return response.data;
  },

  // ==========================================
  // Activities (Audit Trail - Phase 5)
  // ==========================================

  async getActivities(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.project) searchParams.append('project', params.project);
    if (params.actor) searchParams.append('actor', params.actor);
    if (params.entityType) searchParams.append('entityType', params.entityType);
    if (params.action) searchParams.append('action', params.action);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await request(`/activities${queryStr}`, {
      method: 'GET',
    });

    const activities = response.data || [];
    return activities.map((act) => ({
      id: act._id || act.id,
      action: act.action,
      entityType: act.entityType,
      entityId: act.entityId,
      description: act.description,
      metadata: act.metadata,
      timestamp: act.createdAt,
      user: act.actor
        ? {
            id: act.actor._id || act.actor.id,
            name: act.actor.name,
            email: act.actor.email,
            role: act.actor.role,
            avatar: act.actor.avatar,
            department: act.actor.department,
          }
        : null,
      project: act.project
        ? {
            id: act.project._id || act.project.id,
            name: act.project.name,
            code: act.project.code,
            status: act.project.status,
          }
        : null,
    }));
  },
};
