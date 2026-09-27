import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Activity,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';

export function StatsOverview({ stats }) {
  const {
    totalProjects = 0,
    activeProjects = 0,
    totalTasks = 0,
    completedTasks = 0,
    inProgressTasks = 0,
    overdueTasks = 0,
  } = stats || {};

  return (
    <div className="kpi-grid">
      <StatCard
        title="Total Projects"
        value={totalProjects}
        subtitle={`${activeProjects} active portfolios`}
        icon={FolderKanban}
        variant="info"
      />
      <StatCard
        title="Active Projects"
        value={activeProjects}
        subtitle="Currently in execution"
        icon={Layers}
        variant="default"
      />
      <StatCard
        title="Total Tasks"
        value={totalTasks}
        subtitle="Across all workstreams"
        icon={Activity}
        variant="info"
      />
      <StatCard
        title="Completed Tasks"
        value={completedTasks}
        subtitle={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% overall completion` : '0%'}
        icon={CheckCircle2}
        variant="success"
      />
      <StatCard
        title="In Progress"
        value={inProgressTasks}
        subtitle="Active work in flight"
        icon={Clock}
        variant="info"
      />
      <StatCard
        title="Overdue Tasks"
        value={overdueTasks}
        subtitle="Requires escalation"
        icon={AlertTriangle}
        variant={overdueTasks > 0 ? 'danger' : 'default'}
      />
    </div>
  );
}
