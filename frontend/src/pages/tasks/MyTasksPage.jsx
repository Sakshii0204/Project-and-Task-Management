import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { TaskTable } from '../../components/tasks/TaskTable';
import { TaskStatusModal } from '../../components/tasks/TaskStatusModal';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard } from '../../components/common/StatCard';
import { isTaskOverdue } from '../../utils/taskUtils';
import { CheckSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export function MyTasksPage() {
  const { currentUser } = useAuth();
  const { tasks, updateTask } = useProjects();
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusModalTask, setStatusModalTask] = useState(null);

  // Filter tasks assigned to current user
  const myAllTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter((t) => t.assigneeId === currentUser.id);
  }, [tasks, currentUser]);

  const overdueCount = myAllTasks.filter((t) => isTaskOverdue(t)).length;
  const inProgressCount = myAllTasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = myAllTasks.filter((t) => t.status === 'Completed').length;
  const blockedCount = myAllTasks.filter((t) => t.status === 'Blocked').length;

  const displayTasks = useMemo(() => {
    if (activeTab === 'ALL') return myAllTasks;
    if (activeTab === 'OVERDUE') return myAllTasks.filter((t) => isTaskOverdue(t));
    return myAllTasks.filter((t) => t.status === activeTab);
  }, [myAllTasks, activeTab]);

  const handleStatusUpdate = async (taskId, updates) => {
    await updateTask(taskId, updates, currentUser);
  };

  const tabs = [
    { id: 'ALL', label: 'All Tasks', count: myAllTasks.length },
    { id: 'In Progress', label: 'In Progress', count: inProgressCount },
    { id: 'To Do', label: 'To Do', count: myAllTasks.filter((t) => t.status === 'To Do').length },
    { id: 'Blocked', label: 'Blocked', count: blockedCount },
    { id: 'Completed', label: 'Completed', count: completedCount },
    {
      id: 'OVERDUE',
      label: 'Overdue',
      count: overdueCount,
      alert: overdueCount > 0,
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="page-title">My Assigned Tasks</h2>
        <p className="page-subtitle">
          Personal workload queue for <strong>{currentUser?.name}</strong> ({currentUser?.role}).
        </p>
      </div>

      {/* Mini KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <StatCard title="My Workload" value={myAllTasks.length} variant="info" icon={CheckSquare} />
        <StatCard title="In Flight" value={inProgressCount} variant="default" icon={Clock} />
        <StatCard title="Completed" value={completedCount} variant="success" icon={CheckCircle} />
        <StatCard
          title="My Overdue"
          value={overdueCount}
          variant={overdueCount > 0 ? 'danger' : 'default'}
          icon={AlertTriangle}
        />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '12.5px',
                gap: '8px',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.25)'
                    : tab.alert
                    ? '#ef4444'
                    : '#e2e8f0',
                  color: isActive ? '#ffffff' : tab.alert ? '#ffffff' : '#475569',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task List */}
      {displayTasks.length === 0 ? (
        <EmptyState
          title={`No tasks in "${activeTab}"`}
          description={
            activeTab === 'OVERDUE'
              ? 'Excellent! None of your assigned tasks are past due.'
              : 'You have no assigned tasks under this category.'
          }
          icon={CheckSquare}
        />
      ) : (
        <TaskTable
          tasks={displayTasks}
          onStatusChange={(task) => setStatusModalTask(task)}
          showProject={true}
        />
      )}

      {/* Quick Status Modal */}
      <TaskStatusModal
        isOpen={Boolean(statusModalTask)}
        onClose={() => setStatusModalTask(null)}
        task={statusModalTask}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
