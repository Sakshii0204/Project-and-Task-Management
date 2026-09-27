import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  GitBranch,
  Edit,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Button } from '../../components/common/Button';
import { TaskModal } from '../../components/tasks/TaskModal';
import { TaskStatusModal } from '../../components/tasks/TaskStatusModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { formatDate } from '../../utils/formatters';
import { isTaskOverdue, getDaysOverdue } from '../../utils/taskUtils';

export function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, canCreateTasks, isAdmin } = useAuth();
  const {
    tasks,
    projects,
    users,
    updateTask,
    deleteTask,
  } = useProjects();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Task Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
          The requested task does not exist or may have been deleted.
        </p>
        <Link to="/tasks" className="btn btn-primary">
          Back to Tasks
        </Link>
      </div>
    );
  }

  const overdue = isTaskOverdue(task);
  const daysOverdue = getDaysOverdue(task);

  // Upstream dependencies (Blocked By: tasks this task depends on)
  const blockedByTasks = tasks.filter((t) => task.dependencies?.includes(t.id));

  // Downstream dependencies (Depends On: tasks that depend on this task)
  const downstreamTasks = tasks.filter((t) => t.dependencies?.includes(task.id));

  const handleEditSave = async (updatedData) => {
    await updateTask(task.id, updatedData, currentUser);
  };

  const handleQuickStatusSave = async (taskId, updates) => {
    await updateTask(taskId, updates, currentUser);
  };

  const handleDeleteConfirm = async () => {
    await deleteTask(task.id);
    navigate('/tasks');
  };

  return (
    <div>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/tasks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Tasks Directory
        </Link>
      </div>

      {/* Prominent Overdue Warning Banner if task is overdue */}
      {overdue && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#991b1b' }}>
                OVERDUE ACTIVITY ALERT: {daysOverdue} Days Past Target Deadline
              </h3>
              <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: '2px' }}>
                Scheduled due date was <strong>{formatDate(task.dueDate)}</strong>. Status is currently{' '}
                <strong>{task.status}</strong>. Please update delivery status or revise the milestone.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
          >
            Update Status
          </Button>
        </div>
      )}

      {/* Main Task Detail Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              <Link
                to={`/projects/${task.projectId}`}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--brand-primary)',
                  backgroundColor: '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {task.projectName}
              </Link>
            </div>
            <h1 className="page-title" style={{ fontSize: '22px' }}>
              {task.title}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              icon={Clock}
              size="sm"
              onClick={() => setStatusModalOpen(true)}
            >
              Update Status
            </Button>
            {canCreateTasks && (
              <Button
                variant="secondary"
                icon={Edit}
                size="sm"
                onClick={() => setEditModalOpen(true)}
              >
                Edit Task
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="danger"
                icon={Trash2}
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Description & Acceptance Criteria
          </h4>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {task.description || 'No detailed description provided.'}
          </p>
        </div>

        <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
          <ProgressBar progress={task.progress} showLabel={true} height={8} />
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Assignee / Owner
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <UserAvatar src={task.assigneeAvatar} name={task.assigneeName} size={28} />
              <strong style={{ color: 'var(--text-primary)' }}>{task.assigneeName}</strong>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Start Date
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <span>{formatDate(task.startDate)}</span>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Due Date
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Calendar size={14} color={overdue ? '#ef4444' : 'var(--text-muted)'} />
              <span style={{ fontWeight: overdue ? 700 : 400, color: overdue ? '#b91c1c' : 'inherit' }}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Dependencies Section */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitBranch size={18} color="var(--brand-primary)" />
            <div>
              <h2 className="section-title">Task Dependency Matrix</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Upstream prerequisites and downstream impacted tasks
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Blocked By */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Blocked By (Prerequisites)</span>
              <span className="badge badge-status-todo" style={{ fontSize: '11px' }}>
                {blockedByTasks.length}
              </span>
            </h4>

            {blockedByTasks.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                This task has no upstream blockers.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {blockedByTasks.map((dep) => (
                  <div
                    key={dep.id}
                    style={{
                      padding: '10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <Link
                        to={`/tasks/${dep.id}`}
                        style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}
                      >
                        {dep.title}
                      </Link>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                        Owner: {dep.assigneeName} &bull; Due: {formatDate(dep.dueDate)}
                      </span>
                    </div>
                    <StatusBadge status={dep.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Depends On (Downstream) */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Depends On This Task (Downstream)</span>
              <span className="badge badge-status-todo" style={{ fontSize: '11px' }}>
                {downstreamTasks.length}
              </span>
            </h4>

            {downstreamTasks.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No downstream tasks are waiting on this task.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {downstreamTasks.map((down) => (
                  <div
                    key={down.id}
                    style={{
                      padding: '10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <Link
                        to={`/tasks/${down.id}`}
                        style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}
                      >
                        {down.title}
                      </Link>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                        Owner: {down.assigneeName} &bull; Due: {formatDate(down.dueDate)}
                      </span>
                    </div>
                    <StatusBadge status={down.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        task={task}
        projects={projects}
        users={users}
        allTasks={tasks}
      />

      {/* Update Status Modal */}
      <TaskStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        task={task}
        onUpdate={handleQuickStatusSave}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"?`}
        confirmText="Delete Task"
        isDangerous={true}
      />
    </div>
  );
}
