import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Calendar,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Button } from '../../components/common/Button';
import { TaskStatusModal } from '../../components/tasks/TaskStatusModal';
import { formatDate } from '../../utils/formatters';
import { isTaskOverdue, getDaysOverdue } from '../../utils/taskUtils';

export function OverduePage() {
  const { currentUser } = useAuth();
  const { tasks, updateTask } = useProjects();
  const [selectedTask, setSelectedTask] = useState(null);

  // Dynamic computation of overdue tasks based on real-time current date
  const overdueTasks = tasks
    .filter((task) => isTaskOverdue(task))
    .sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a));

  const handleStatusUpdate = async (taskId, updates) => {
    await updateTask(taskId, updates, currentUser);
  };

  return (
    <div>
      {/* Page Title & Explanation Banner */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={24} color="#ef4444" />
          Overdue Activities & Escalations
        </h2>
        <p className="page-subtitle">
          Real-time tracking of tasks that have surpassed their committed delivery milestones.
        </p>
      </div>

      {/* Dynamic Calculation Callout */}
      <div
        style={{
          backgroundColor: '#fff5f5',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>
              Dynamic Overdue Intelligence Active
            </h4>
            <p style={{ fontSize: '12.5px', color: '#b91c1c' }}>
              Calculated dynamically via <code>current date &gt; task.dueDate &amp;&amp; status !== &apos;Completed&apos;</code>.
              Days overdue update automatically with system clock.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {overdueTasks.length} Overdue Items
          </span>
        </div>
      </div>

      {/* Overdue Items List */}
      {overdueTasks.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#ecfdf5',
            borderColor: '#a7f3d0',
          }}
        >
          <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#065f46' }}>
            Zero Overdue Tasks
          </h3>
          <p style={{ fontSize: '13px', color: '#047857', maxWidth: '400px', margin: '6px auto 0 auto' }}>
            All task deliverables are on track or marked as completed.
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ borderColor: '#fca5a5' }}>
          <table className="enterprise-table">
            <thead style={{ backgroundColor: '#fef2f2' }}>
              <tr>
                <th style={{ color: '#991b1b' }}>Task</th>
                <th style={{ color: '#991b1b' }}>Project</th>
                <th style={{ color: '#991b1b' }}>Owner</th>
                <th style={{ color: '#991b1b' }}>Priority</th>
                <th style={{ color: '#991b1b' }}>Due Date</th>
                <th style={{ color: '#991b1b' }}>Days Overdue</th>
                <th style={{ color: '#991b1b' }}>Status</th>
                <th style={{ color: '#991b1b' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.map((task) => {
                const days = getDaysOverdue(task);

                return (
                  <tr key={task.id} style={{ backgroundColor: '#fffbfa' }}>
                    <td>
                      <div>
                        <Link
                          to={`/tasks/${task.id}`}
                          style={{ fontWeight: 600, color: '#991b1b' }}
                        >
                          {task.title}
                        </Link>
                        <p
                          style={{
                            fontSize: '11.5px',
                            color: '#7f1d1d',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px',
                          }}
                        >
                          {task.description}
                        </p>
                      </div>
                    </td>

                    <td>
                      <Link
                        to={`/projects/${task.projectId}`}
                        style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}
                      >
                        {task.projectName}
                      </Link>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserAvatar
                          src={task.assigneeAvatar}
                          name={task.assigneeName}
                          size={24}
                        />
                        <span style={{ fontSize: '12.5px' }}>{task.assigneeName}</span>
                      </div>
                    </td>

                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: '#991b1b',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Calendar size={12} /> {formatDate(task.dueDate)}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#ffffff',
                          backgroundColor: '#ef4444',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <Clock size={11} /> {days} days
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={task.status} />
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                        >
                          Update Status
                        </Button>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Status Modal */}
      <TaskStatusModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
