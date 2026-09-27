import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, User } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/formatters';
import { calculateProjectProgress } from '../../utils/taskUtils';

export function ProjectCard({ project, tasks = [], users = [] }) {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const progress = calculateProjectProgress(projectTasks);
  const completedCount = projectTasks.filter((t) => t.status === 'Completed').length;

  const teamMembers = users.filter((u) => project.teamMemberIds?.includes(u.id));

  return (
    <div className="project-card">
      <div>
        <div className="project-card-header">
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--brand-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {project.code || 'PRJ'}
            </span>
            <h3 className="project-card-title">
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <p className="project-card-desc">{project.description}</p>

        <div style={{ marginBottom: '16px' }}>
          <ProgressBar progress={progress} showLabel={true} height={6} />
        </div>
      </div>

      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '12px 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
              Due Date
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              <Calendar size={12} /> {formatDate(project.dueDate)}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
              Tasks Completed
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              <CheckCircle2 size={12} color="#10b981" /> {completedCount} / {projectTasks.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lead:</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {project.managerName}
            </span>
          </div>

          <div className="avatar-group">
            {teamMembers.slice(0, 4).map((member) => (
              <UserAvatar
                key={member.id}
                src={member.avatar}
                name={member.name}
                size={26}
                title={`${member.name} (${member.role})`}
              />
            ))}
            {teamMembers.length > 4 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginLeft: '4px',
                }}
              >
                +{teamMembers.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
