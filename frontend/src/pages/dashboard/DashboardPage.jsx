import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { apiService } from '../../services/apiService';
import { StatsOverview } from '../../components/dashboard/StatsOverview';
import { ProjectProgressCard } from '../../components/dashboard/ProjectProgressCard';
import { UpcomingDeadlinesCard } from '../../components/dashboard/UpcomingDeadlinesCard';
import { OverdueTasksCard } from '../../components/dashboard/OverdueTasksCard';
import { RecentActivityCard } from '../../components/dashboard/RecentActivityCard';
import { ProjectModal } from '../../components/projects/ProjectModal';
import { TaskModal } from '../../components/tasks/TaskModal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Plus, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';

export function DashboardPage() {
  const { currentUser, canManageProjects, canCreateTasks } = useAuth();
  const {
    projects,
    tasks,
    activities,
    users,
    refreshProjects,
    addProject,
    addTask,
  } = useProjects();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to connect to dashboard service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      await loadDashboard();
    });
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const handleCreateProject = async (projectData) => {
    await addProject(projectData, currentUser);
    loadDashboard();
  };

  const handleCreateTask = async (taskData) => {
    await addTask(taskData, currentUser);
    loadDashboard();
  };

  // Metrics from real DB dashboard or fallback to context stats
  const metrics = dashboardData?.metrics || {};
  const stats = {
    totalProjects: metrics.totalProjects ?? metrics.managedProjects ?? metrics.assignedProjects ?? projects.length,
    activeProjects: metrics.activeProjects ?? projects.filter((p) => p.status === 'Active').length,
    totalTasks: metrics.totalTasks ?? metrics.assignedTasks ?? tasks.length,
    completedTasks: metrics.completedTasks ?? tasks.filter((t) => t.status === 'Completed').length,
    inProgressTasks: metrics.inProgressTasks ?? tasks.filter((t) => t.status === 'In Progress').length,
    overdueTasks: metrics.overdueTasks ?? 0,
    blockedTasks: metrics.blockedTasks ?? 0,
  };

  // Real DB upcoming deadlines and recent activities
  const recentActs = (dashboardData?.recentActivities && dashboardData.recentActivities.length > 0)
    ? dashboardData.recentActivities
    : activities;

  if (loading && !dashboardData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '16px' }}>
        <LoadingSpinner size="lg" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading real-time delivery metrics...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertCircle size={36} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Dashboard Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
        <Button variant="primary" icon={RefreshCw} onClick={loadDashboard}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 className="page-title">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Team'}
          </h2>
          <p className="page-subtitle">
            Role: <strong>{dashboardData?.role || currentUser?.role}</strong> &bull; Database-backed executive delivery KPIs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={() => {
              loadDashboard();
              refreshProjects();
            }}
            title="Refresh Live Metrics"
          >
            Refresh
          </Button>

          {canManageProjects && (
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => setProjectModalOpen(true)}
            >
              New Project
            </Button>
          )}
          {canCreateTasks && (
            <Button
              variant="primary"
              icon={CheckSquare}
              onClick={() => setTaskModalOpen(true)}
            >
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* 6 Executive KPI Cards */}
      <StatsOverview stats={stats} />

      {/* Main Dashboard Widgets: 2-Column Grid */}
      <div className="dashboard-grid-2col">
        {/* Left Column: Project Progress & Upcoming Deadlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ProjectProgressCard projects={projects} tasks={tasks} />
          <UpcomingDeadlinesCard tasks={tasks} />
        </div>

        {/* Right Column: Overdue Tasks & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <OverdueTasksCard tasks={tasks} />
          <RecentActivityCard activities={recentActs} />
        </div>
      </div>

      {/* Project & Task Creation Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleCreateProject}
        users={users}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleCreateTask}
        projects={projects}
        users={users}
        allTasks={tasks}
      />
    </div>
  );
}
