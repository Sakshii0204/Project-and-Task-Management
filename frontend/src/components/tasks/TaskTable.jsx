import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { UserAvatar } from '../common/UserAvatar';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { isTaskOverdue } from '../../utils/taskUtils';

export function TaskTable({
  tasks = [],
  onEdit,
  onStatusChange,
  showProject = true,
}) {
  return (
    <div className="table-container">
      <table className="enterprise-table">
        <thead>
          <tr>
            <th>Task Title</th>
            {showProject && <th>Project</th>}
            <th>Assignee</th>
            <th>Priority</th>
            <th>Status</th>
            <th style={{ minWidth: '130px' }}>Progress</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const overdue = isTaskOverdue(task);

            return (
              <tr
                key={task.id}
                style={
                  overdue
                    ? { backgroundColor: '#fff5f5' }
                    : {}
                }
              >
                <td>
                  <div>
                    <Link
                      to={`/tasks/${task.id}`}
                      style={{
                        fontWeight: 600,
                        color: overdue ? '#b91c1c' : 'var(--text-primary)',
                        display: 'block',
                      }}
                    >
                      {task.title}
                    </Link>
                    {task.dependencies && task.dependencies.length > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#6366f1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                        }}
                      >
                        Has {task.dependencies.length} dependenc{task.dependencies.length === 1 ? 'y' : 'ies'}
                      </span>
                    )}
                  </div>
                </td>

                {showProject && (
                  <td>
                    <Link
                      to={`/projects/${task.projectId}`}
                      style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                    >
                      {task.projectName}
                    </Link>
                  </td>
                )}

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserAvatar
                      src={task.assigneeAvatar}
                      name={task.assigneeName}
                      size={26}
                    />
                    <span style={{ fontSize: '13px' }}>{task.assigneeName}</span>
                  </div>
                </td>

                <td>
                  <PriorityBadge priority={task.priority} />
                </td>

                <td>
                  <StatusBadge status={task.status} />
                </td>

                <td>
                  <ProgressBar progress={task.progress} showLabel={true} height={6} />
                </td>

                <td>
                  <DeadlineBadge task={task} />
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View
                    </Link>
                    {onStatusChange && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onStatusChange(task)}
                        title="Update status"
                      >
                        Status
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onEdit(task)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
