import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { ProjectDetailPage } from '../pages/projects/ProjectDetailPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { TaskDetailPage } from '../pages/tasks/TaskDetailPage';
import { MyTasksPage } from '../pages/tasks/MyTasksPage';
import { OverduePage } from '../pages/tasks/OverduePage';
import { TeamPage } from '../pages/users/TeamPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { NotFoundPage } from '../pages/common/NotFoundPage';
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Projects */}
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />

        {/* Tasks */}
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />

        {/* Workload Views */}
        <Route path="my-tasks" element={<MyTasksPage />} />
        <Route path="overdue" element={<OverduePage />} />

        {/* Team and Profile */}
        <Route path="team" element={<TeamPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Error States inside shell */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
