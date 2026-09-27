import { Link } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';
import { isTaskOverdue, getDaysOverdue } from '../../utils/taskUtils';

export function OverdueTasksCard({ tasks = [] }) {
  const overdueTasks = tasks
    .filter((t) => isTaskOverdue(t))
    .sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a))
    .slice(0, 4);

  return (
    <div
      className="card"
      style={{
        borderLeft: overdueTasks.length > 0 ? '4px solid #ef4444' : '1px solid var(--border-color)',
        height: '100%',
      }}
    >
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={16} />
          </div>
          <div>
            <h2 className="section-title">Critical Overdue Items</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Past deadline & requires immediate action
            </p>
          </div>
        </div>
        <Link to="/overdue" style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
          View All ({overdueTasks.length}) &rarr;
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {overdueTasks.length === 0 ? (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              color: '#059669',
              backgroundColor: '#ecfdf5',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Great job! No overdue tasks pending across projects.
          </div>
        ) : (
          overdueTasks.map((task) => {
            const days = getDaysOverdue(task);
            return (
              <div
                key={task.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #fed7d7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/tasks/${task.id}`}
                    style={{
                      fontWeight: 600,
                      color: '#991b1b',
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
                      color: '#7f1d1d',
                    }}
                  >
                    <span>{task.projectName}</span>
                    <span>&bull;</span>
                    <span>Assignee: {task.assigneeName}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={11} /> {days}d overdue
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
