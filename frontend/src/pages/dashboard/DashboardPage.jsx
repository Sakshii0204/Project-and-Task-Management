import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { StatsOverview } from '../../components/dashboard/StatsOverview';
import { ProjectProgressCard } from '../../components/dashboard/ProjectProgressCard';
import { UpcomingDeadlinesCard } from '../../components/dashboard/UpcomingDeadlinesCard';
import { OverdueTasksCard } from '../../components/dashboard/OverdueTasksCard';
import { RecentActivityCard } from '../../components/dashboard/RecentActivityCard';
import { ProjectModal } from '../../components/projects/ProjectModal';
import { TaskModal } from '../../components/tasks/TaskModal';
import { Button } from '../../components/common/Button';
import { Plus, CheckSquare } from 'lucide-react';

export function DashboardPage() {
  const { currentUser, canManageProjects, canCreateTasks } = useAuth();
  const {
    projects,
    tasks,
    activities,
    users,
    getOverallStats,
    addProject,
    addTask,
  } = useProjects();

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // All stats are computed on the fly from reactive state
  const stats = getOverallStats();

  const handleCreateProject = async (projectData) => {
    await addProject(projectData, currentUser);
  };

  const handleCreateTask = async (taskData) => {
    await addTask(taskData, currentUser);
  };

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
            Here is your live delivery summary across all active project workstreams.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
          <RecentActivityCard activities={activities} />
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
