import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/formatters';
import { calculateProjectProgress } from '../../utils/taskUtils';

export function ProjectTable({ projects = [], tasks = [], users = [] }) {
  return (
    <div className="table-container">
      <table className="enterprise-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Status</th>
            <th>Lead / Manager</th>
            <th>Team</th>
            <th>Timeline</th>
            <th style={{ minWidth: '140px' }}>Progress</th>
            <th>Tasks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const progress = calculateProjectProgress(projectTasks);
            const completedCount = projectTasks.filter((t) => t.status === 'Completed').length;
            const teamMembers = users.filter((u) => project.teamMemberIds?.includes(u.id));

            return (
              <tr key={project.id}>
                <td>
                  <div>
                    <Link
                      to={`/projects/${project.id}`}
                      style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}
                    >
                      {project.name}
                    </Link>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {project.code} &bull; {project.category}
                    </span>
                  </div>
                </td>
                <td>
                  <StatusBadge status={project.status} />
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{project.managerName}</span>
                </td>
                <td>
                  <div className="avatar-group">
                    {teamMembers.slice(0, 3).map((m) => (
                      <UserAvatar key={m.id} src={m.avatar} name={m.name} size={24} />
                    ))}
                    {teamMembers.length > 3 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        +{teamMembers.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatDate(project.startDate)} &rarr; {formatDate(project.dueDate)}
                  </span>
                </td>
                <td>
                  <ProgressBar progress={progress} showLabel={true} height={6} />
                </td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {completedCount} / {projectTasks.length}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
