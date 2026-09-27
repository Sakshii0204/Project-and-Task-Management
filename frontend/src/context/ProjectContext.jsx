import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { mockUsers } from '../data/mockUsers';
import { mockProjects } from '../data/mockProjects';
import { mockTasks } from '../data/mockTasks';
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
  const [projects, setProjects] = useState(() => getInitialStorage('ptms_projects', mockProjects));
  const [tasks, setTasks] = useState(() => getInitialStorage('ptms_tasks', mockTasks));
  const [activities, setActivities] = useState(() => getInitialStorage('ptms_activities', mockActivities));
  const [users, setUsers] = useState(() => getInitialStorage('ptms_users', mockUsers));
  const [loading] = useState(false);

  // Sync users with live backend MongoDB users when available
  useEffect(() => {
    let isMounted = true;
    apiService.getUsers().then((fetched) => {
      if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
        setUsers(fetched);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Project CRUD
  const addProject = async (projectData, creator) => {
    const created = await apiService.createProject(projectData);
    setProjects((prev) => [created, ...prev]);

    await logActivity({
      type: 'PROJECT_CREATED',
      userId: creator?.id || 'user-admin',
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
        prev.map((t) => (t.projectId === id ? { ...t, projectName: updates.name } : t))
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

  const deleteProject = async (id) => {
    await apiService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    return true;
  };

  // Task CRUD
  const addTask = async (taskData, creator) => {
    const project = projects.find((p) => p.id === taskData.projectId);
    const assignee = users.find((u) => u.id === taskData.assigneeId);

    const enriched = {
      ...taskData,
      projectName: project ? project.name : 'Unassigned Project',
      assigneeName: assignee ? assignee.name : 'Unassigned',
      assigneeAvatar: assignee ? assignee.avatar : '',
    };

    const created = await apiService.createTask(enriched);
    setTasks((prev) => [created, ...prev]);

    await logActivity({
      type: 'TASK_CREATED',
      userId: creator?.id || 'user-pm',
      userName: creator?.name || 'Project Manager',
      userAvatar: creator?.avatar || '',
      action: `created task and assigned to ${enriched.assigneeName}`,
      target: created.title,
      projectName: enriched.projectName,
      projectId: created.projectId,
      taskId: created.id,
    });

    return created;
  };

  const updateTask = async (id, updates, modifier) => {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return null;

    let enriched = { ...updates };
    if (updates.projectId) {
      const proj = projects.find((p) => p.id === updates.projectId);
      if (proj) enriched.projectName = proj.name;
    }
    if (updates.assigneeId) {
      const assignee = users.find((u) => u.id === updates.assigneeId);
      if (assignee) {
        enriched.assigneeName = assignee.name;
        enriched.assigneeAvatar = assignee.avatar;
      }
    }

    const updated = await apiService.updateTask(id, enriched);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

    if (modifier && updates.status && updates.status !== existing.status) {
      await logActivity({
        type: updates.status === 'Completed' ? 'TASK_COMPLETED' : 'STATUS_CHANGED',
        userId: modifier.id,
        userName: modifier.name,
        userAvatar: modifier.avatar || '',
        action: updates.status === 'Completed' ? 'marked as completed' : `changed status to ${updates.status}`,
        target: updated.title,
        projectName: updated.projectName,
        projectId: updated.projectId,
        taskId: updated.id,
      });
    }

    return updated;
  };

  const deleteTask = async (id) => {
    await apiService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const logActivity = async (activityData) => {
    const newAct = await apiService.logActivity(activityData);
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
  };

  const resetAllData = () => {
    apiService.resetAll();
    setProjects(mockProjects);
    setTasks(mockTasks);
    setActivities(mockActivities);
    setUsers(mockUsers);
  };

  // Selectors & Calculations
  const getProjectTasks = (projectId) => {
    return tasks.filter((t) => t.projectId === projectId);
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
    const activeProjects = projects.filter((p) => p.status === 'Active').length;
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
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
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
