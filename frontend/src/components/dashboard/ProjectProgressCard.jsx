import { Link } from 'react-router-dom';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { calculateProjectProgress } from '../../utils/taskUtils';

export function ProjectProgressCard({ projects = [], tasks = [] }) {
  // Sort projects: Active first, then by name
  const displayProjects = [...projects]
    .sort((a, b) => (a.status === 'Active' ? -1 : b.status === 'Active' ? 1 : 0))
    .slice(0, 5);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h2 className="section-title">Project Progress</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Calculated completion across active workstreams
          </p>
        </div>
        <Link to="/projects" style={{ fontSize: '13px', fontWeight: 500 }}>
          View All &rarr;
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {displayProjects.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No projects available.</p>
        ) : (
          displayProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const progress = calculateProjectProgress(projectTasks);
            const completedCount = projectTasks.filter((t) => t.status === 'Completed').length;

            return (
              <div key={project.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    to={`/projects/${project.id}`}
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontSize: '13.5px',
                    }}
                  >
                    {project.name}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {completedCount}/{projectTasks.length} tasks
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <ProgressBar progress={progress} showLabel={false} height={7} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Lead: {project.managerName}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progress}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
