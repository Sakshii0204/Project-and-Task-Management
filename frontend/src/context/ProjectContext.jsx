import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';
import { mockActivities } from '../data/mockActivities';
import { isTaskOverdue, calculateProjectProgress, getProjectTaskStatistics } from '../utils/taskUtils';

const ProjectContext = createContext(null);

function getInitialStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState(() => getInitialStorage('ptms_activities', mockActivities));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load real projects, tasks, activities, and users from MongoDB backend on mount or user change
  const refreshProjects = useCallback(async () => {
    try {
      const [fetchedProjects, fetchedTasks, fetchedUsers, fetchedActivities] = await Promise.all([
        apiService.getProjects(),
        apiService.getTasks({ limit: 100 }),
        apiService.getUsers(),
        apiService.getActivities({ limit: 50 }).catch(() => []),
      ]);
      if (Array.isArray(fetchedProjects)) {
        setProjects(fetchedProjects);
      }
      if (Array.isArray(fetchedTasks)) {
        setTasks(fetchedTasks);
      }
      if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      }
      if (Array.isArray(fetchedActivities) && fetchedActivities.length > 0) {
        setActivities(fetchedActivities);
      }
    } catch (e) {
      console.warn('Initial project/task/user load fallback:', e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      await refreshProjects();
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshProjects, currentUser]);

  // Project CRUD with real backend API
  const addProject = async (projectData, creator) => {
    const created = await apiService.createProject(projectData);
    setProjects((prev) => [created, ...prev]);

    await logActivity({
      type: 'PROJECT_CREATED',
      userId: creator?.id || 'admin',
      userName: creator?.name || 'Administrator',
      userAvatar: creator?.avatar || '',
      action: 'created new project workspace',
      target: created.name,
      projectName: created.name,
      projectId: created.id,
    });

    return created;
  };

  const updateProject = async (id, updates, modifier) => {
    const updated = await apiService.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));

    if (updates.name) {
      setTasks((prev) =>
        prev.map((t) => (t.projectId === id || t.projectId === updated.legacyId ? { ...t, projectName: updates.name } : t))
      );
    }

    if (modifier) {
      await logActivity({
        type: 'PROJECT_UPDATED',
        userId: modifier.id,
        userName: modifier.name,
        userAvatar: modifier.avatar || '',
        action: 'updated project configuration',
        target: updated.name,
        projectName: updated.name,
        projectId: updated.id,
      });
    }

    return updated;
  };

  const updateProjectStatus = async (id, status, modifier) => {
    const updated = await apiService.updateProjectStatus(id, status);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));

    if (modifier) {
      await logActivity({
        type: 'PROJECT_STATUS_CHANGED',
        userId: modifier.id,
        userName: modifier.name,
        userAvatar: modifier.avatar || '',
        action: `updated project status to ${status}`,
        target: updated.name,
        projectName: updated.name,
        projectId: updated.id,
      });
    }

    return updated;
  };

  const archiveProject = async (id) => {
    const archived = await apiService.archiveProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    return archived;
  };

  const deleteProject = async (id) => {
    return archiveProject(id);
  };

  const addProjectMember = async (id, userId) => {
    const updated = await apiService.addProjectMember(id, userId);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const removeProjectMember = async (id, userId) => {
    const updated = await apiService.removeProjectMember(id, userId);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const changeProjectManager = async (id, managerId) => {
    const updated = await apiService.changeProjectManager(id, managerId);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  // Task CRUD with Real Database Backend (Phase 4)
  const addTask = async (taskData, creator) => {
    const created = await apiService.createTask(taskData);
    setTasks((prev) => [created, ...prev]);

    await logActivity({
      type: 'TASK_CREATED',
      userId: creator?.id || 'admin',
      userName: creator?.name || 'Project Manager',
      userAvatar: creator?.avatar || '',
      action: `created task "${created.title}"`,
      target: created.title,
      projectName: created.projectName,
      projectId: created.projectId,
      taskId: created.id,
    });

    return created;
  };

  const updateTask = async (id, updates, modifier) => {
    const existing = tasks.find((t) => t.id === id);
    const updated = await apiService.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

    if (modifier && updates.status && updates.status !== existing?.status) {
      await logActivity({
        type: 'TASK_STATUS_CHANGED',
        userId: modifier.id,
        userName: modifier.name,
        userAvatar: modifier.avatar || '',
        action: `updated status of "${updated.title}" to ${updates.status}`,
        target: updated.title,
        projectName: updated.projectName,
        projectId: updated.projectId,
        taskId: updated.id,
      });
    }

    return updated;
  };

  const updateTaskStatus = async (id, status, modifier) => {
    const existing = tasks.find((t) => t.id === id);
    const updated = await apiService.updateTaskStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

    if (modifier && existing?.status !== updated.status) {
      await logActivity({
        type: 'TASK_STATUS_CHANGED',
        userId: modifier.id,
        userName: modifier.name,
        userAvatar: modifier.avatar || '',
        action: `updated status of "${updated.title}" to ${status}`,
        target: updated.title,
        projectName: updated.projectName,
        projectId: updated.projectId,
        taskId: updated.id,
      });
    }

    return updated;
  };

  const updateTaskProgress = async (id, progress) => {
    const updated = await apiService.updateTaskProgress(id, progress);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const addTaskDependency = async (taskId, dependencyId) => {
    const updated = await apiService.addTaskDependency(taskId, dependencyId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const removeTaskDependency = async (taskId, dependencyId) => {
    const updated = await apiService.removeTaskDependency(taskId, dependencyId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const deleteTask = async (id) => {
    await apiService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  // Activity Audit Log
  const logActivity = async (activityData) => {
    const logged = await apiService.logActivity(activityData);
    setActivities((prev) => [logged, ...prev.slice(0, 49)]);
    return logged;
  };

  const resetAllData = () => {
    localStorage.removeItem('ptms_activities');
    refreshProjects();
  };

  // Project Task Resolver with real MongoDB references
  const getProjectTasks = (projectId) => {
    return tasks.filter((t) => t.projectId === projectId || t.project === projectId);
  };

  const getUserTasks = (userId) => {
    return tasks.filter((t) => t.assigneeId === userId);
  };

  const getOverdueTasks = () => {
    return tasks.filter((t) => isTaskOverdue(t));
  };

  const getProjectStats = (projectId) => {
    const projTasks = getProjectTasks(projectId);
    const stats = getProjectTaskStatistics(projTasks);
    const progress = calculateProjectProgress(projTasks);
    return { ...stats, progress };
  };

  const getOverallStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'Active' || p.rawStatus === 'ACTIVE').length;
    const taskStats = getProjectTaskStatistics(tasks);

    return {
      totalProjects,
      activeProjects,
      totalTasks: taskStats.total,
      completedTasks: taskStats.completed,
      inProgressTasks: taskStats.inProgress,
      overdueTasks: taskStats.overdue,
      blockedTasks: taskStats.blocked,
      todoTasks: taskStats.todo,
    };
  };

  const value = {
    projects,
    tasks,
    activities,
    users,
    loading,
    refreshProjects,
    addProject,
    updateProject,
    updateProjectStatus,
    archiveProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    changeProjectManager,
    addTask,
    updateTask,
    updateTaskStatus,
    updateTaskProgress,
    addTaskDependency,
    removeTaskDependency,
    deleteTask,
    logActivity,
    resetAllData,
    getProjectTasks,
    getUserTasks,
    getOverdueTasks,
    getProjectStats,
    getOverallStats,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
