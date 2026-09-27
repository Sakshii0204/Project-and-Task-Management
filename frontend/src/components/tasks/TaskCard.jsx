import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { UserAvatar } from '../common/UserAvatar';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { isTaskOverdue } from '../../utils/taskUtils';

export function TaskCard({ task, onEdit }) {
  const overdue = isTaskOverdue(task);

  return (
    <div
      className="card"
      style={{
        borderLeft: overdue ? '4px solid #ef4444' : '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>

        <h4 style={{ fontSize: '15px', fontWeight: 600, marginTop: '8px', marginBottom: '4px' }}>
          <Link
            to={`/tasks/${task.id}`}
            style={{ color: overdue ? '#991b1b' : 'var(--text-primary)' }}
          >
            {task.title}
          </Link>
        </h4>

        <p
          style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '10px',
          }}
        >
          {task.description}
        </p>

        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Project: <strong>{task.projectName}</strong>
        </span>
      </div>

      <div>
        <div style={{ marginBottom: '10px' }}>
          <ProgressBar progress={task.progress} showLabel={true} height={5} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserAvatar src={task.assigneeAvatar} name={task.assigneeName} size={24} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {task.assigneeName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DeadlineBadge task={task} />
            {onEdit && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onEdit(task)}
                style={{ padding: '2px 6px', fontSize: '11px' }}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
