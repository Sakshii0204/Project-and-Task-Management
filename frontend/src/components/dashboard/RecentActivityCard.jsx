import { CheckCircle2, UserPlus, Calendar, PlusCircle, AlertCircle } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/formatters';

export function RecentActivityCard({ activities = [] }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'TASK_COMPLETED':
      case 'TASK_STATUS_CHANGED':
        return <CheckCircle2 size={14} color="#10b981" />;
      case 'TASK_ASSIGNED':
      case 'TASK_ASSIGNEE_CHANGED':
        return <UserPlus size={14} color="#3b82f6" />;
      case 'DEADLINE_CHANGED':
        return <Calendar size={14} color="#f59e0b" />;
      case 'PROJECT_CREATED':
      case 'TASK_CREATED':
        return <PlusCircle size={14} color="#8b5cf6" />;
      default:
        return <AlertCircle size={14} color="#64748b" />;
    }
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h2 className="section-title">Recent Activity</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Audit log of recent system modifications
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No recorded activities.</p>
        ) : (
          activities.slice(0, 6).map((activity) => {
            const userName = activity.user?.name || activity.userName || 'System';
            const userAvatar = activity.user?.avatar || activity.userAvatar || '';
            const description = activity.description || `${activity.action || ''} ${activity.target ? `"${activity.target}"` : ''}`;
            const projectName = activity.project?.name || activity.projectName || '';
            const timestamp = activity.timestamp || activity.createdAt;

            return (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <UserAvatar
                  src={userAvatar}
                  name={userName}
                  size={32}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <strong>{userName}</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{description}</span>
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '3px',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {getActivityIcon(activity.action || activity.type)}
                    {projectName && <span>{projectName}</span>}
                    {projectName && <span>&bull;</span>}
                    <span>{formatDate(timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
