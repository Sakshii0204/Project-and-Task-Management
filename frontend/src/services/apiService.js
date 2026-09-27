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
import { mockTasks } from '../data/mockTasks';
import { mockActivities } from '../data/mockActivities';

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
    const errorMsg =
      data?.message || data?.errors?.[0]?.message || `Request failed with status ${response.status}`;
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
  // PHASE 1 PRESERVED: Mock Tasks & Activities
  // (Migrating to backend in Phase 4)
  // ==========================================

  async getTasks() {
    return getStoredData(STORAGE_KEYS.TASKS, mockTasks);
  },

  async getTaskById(id) {
    const tasks = getStoredData(STORAGE_KEYS.TASKS, mockTasks);
    return tasks.find((t) => t.id === id) || null;
  },

  async createTask(taskData) {
    const tasks = getStoredData(STORAGE_KEYS.TASKS, mockTasks);
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setStoredData(STORAGE_KEYS.TASKS, updated);
    return newTask;
  },

  async updateTask(id, updates) {
    const tasks = getStoredData(STORAGE_KEYS.TASKS, mockTasks);
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      setStoredData(STORAGE_KEYS.TASKS, tasks);
      return tasks[index];
    }
    throw new Error('Task not found');
  },

  async deleteTask(id) {
    const tasks = getStoredData(STORAGE_KEYS.TASKS, mockTasks);
    const updated = tasks.filter((t) => t.id !== id);
    setStoredData(STORAGE_KEYS.TASKS, updated);
    return true;
  },

  async getActivities() {
    return getStoredData(STORAGE_KEYS.ACTIVITIES, mockActivities);
  },

  async logActivity(activityData) {
    const activities = getStoredData(STORAGE_KEYS.ACTIVITIES, mockActivities);
    const newActivity = {
      ...activityData,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newActivity, ...activities.slice(0, 49)];
    setStoredData(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  },
};
