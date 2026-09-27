import { Calendar, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { isTaskOverdue, getDaysOverdue } from '../../utils/taskUtils';

export function DeadlineBadge({ task, showIcon = true }) {
  if (!task || !task.dueDate) return null;

  const overdue = isTaskOverdue(task);
  const daysOverdue = getDaysOverdue(task);
  const formatted = formatDate(task.dueDate);

  if (task.status === 'Completed') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        {showIcon && <Calendar size={13} />}
        {formatted}
      </span>
    );
  }

  if (overdue) {
    return (
      <span
        className="badge badge-overdue"
        title={`${daysOverdue} days overdue`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        <AlertCircle size={13} />
        {formatted} ({daysOverdue}d overdue)
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
      }}
    >
      {showIcon && <Calendar size={13} />}
      {formatted}
    </span>
  );
}
