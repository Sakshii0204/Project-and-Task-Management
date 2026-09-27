/**
 * API Service Layer (Phase 2)
 * Connects Authentication and User management to Express + MongoDB backend via credentials/HttpOnly cookies.
 * STRICT PHASE 2 BOUNDARY: Projects, Tasks, and Activities remain mock/localStorage-driven.
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
    const errorMsg = data?.message || data?.errors?.[0]?.message || `Request failed with status ${response.status}`;
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

// Local storage helpers for Phase 2 mock project & task data
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
      // Graceful fallback for components if unauthenticated or offline
      return mockUsers;
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
  // PHASE 1 PRESERVED: Mock Projects & Tasks
  // (Migrating to backend in Phase 3/4)
  // ==========================================

  async getProjects() {
    return getStoredData(STORAGE_KEYS.PROJECTS, mockProjects);
  },

  async getProjectById(id) {
    const projects = getStoredData(STORAGE_KEYS.PROJECTS, mockProjects);
    return projects.find((p) => p.id === id) || null;
  },

  async createProject(projectData) {
    const projects = getStoredData(STORAGE_KEYS.PROJECTS, mockProjects);
    const newProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProject, ...projects];
    setStoredData(STORAGE_KEYS.PROJECTS, updated);
    return newProject;
  },

  async updateProject(id, updates) {
    const projects = getStoredData(STORAGE_KEYS.PROJECTS, mockProjects);
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      setStoredData(STORAGE_KEYS.PROJECTS, projects);
      return projects[index];
    }
    throw new Error('Project not found');
  },

  async deleteProject(id) {
    const projects = getStoredData(STORAGE_KEYS.PROJECTS, mockProjects);
    const updated = projects.filter((p) => p.id !== id);
    setStoredData(STORAGE_KEYS.PROJECTS, updated);
    return true;
  },

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

  async logActivity(activity) {
    const activities = getStoredData(STORAGE_KEYS.ACTIVITIES, mockActivities);
    const newActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newActivity, ...activities.slice(0, 19)];
    setStoredData(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  },

  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    return true;
  },
};
