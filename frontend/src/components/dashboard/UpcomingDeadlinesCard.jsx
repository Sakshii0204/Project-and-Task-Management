import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';
import { formatDate, formatRelativeDueDate } from '../../utils/formatters';
import { isTaskOverdue } from '../../utils/taskUtils';

export function UpcomingDeadlinesCard({ tasks = [] }) {
  // Filter out completed tasks and overdue tasks (overdue has its own dedicated card)
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Completed' && !isTaskOverdue(t))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h2 className="section-title">Upcoming Deadlines</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Scheduled delivery milestones
          </p>
        </div>
        <Link to="/tasks" style={{ fontSize: '13px', fontWeight: 500 }}>
          All Tasks &rarr;
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {upcomingTasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            No upcoming deadlines scheduled.
          </p>
        ) : (
          upcomingTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/tasks/${task.id}`}
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    display: 'block',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {task.title}
                </Link>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>{task.projectName}</span>
                  <span>&bull;</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={11} /> {formatDate(task.dueDate)} ({formatRelativeDueDate(task.dueDate)})
                  </span>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
