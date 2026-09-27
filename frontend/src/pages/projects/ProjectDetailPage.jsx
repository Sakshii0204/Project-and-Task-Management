import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  AlertTriangle,
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { UserAvatar } from '../../components/common/UserAvatar';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ProjectModal } from '../../components/projects/ProjectModal';
import { TaskModal } from '../../components/tasks/TaskModal';
import { TaskTable } from '../../components/tasks/TaskTable';
import { formatDate } from '../../utils/formatters';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, canManageProjects, canCreateTasks, isAdmin } = useAuth();
  const {
    projects,
    tasks,
    users,
    updateProject,
    deleteProject,
    addTask,
    getProjectStats,
    getProjectTasks,
  } = useProjects();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const project = projects.find((p) => p.id === id || p._id === id || p.legacyId === id);

  if (!project) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Project Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
          The requested project workspace does not exist or has been removed.
        </p>
        <Link to="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const projectTasks = getProjectTasks(project.id);
  const stats = getProjectStats(project.id);
  const teamMembers =
    project.members && project.members.length > 0 && typeof project.members[0] === 'object'
      ? project.members
      : users.filter((u) => project.teamMemberIds?.includes(u.id));

  const handleEditSave = async (updatedData) => {
    await updateProject(project.id, updatedData, currentUser);
  };

  const handleCreateTask = async (taskData) => {
    await addTask(taskData, currentUser);
  };

  const handleDeleteConfirm = async () => {
    await deleteProject(project.id);
    navigate('/projects');
  };

  return (
    <div>
      {/* Back button and page breadcrumb */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>
      </div>

      {/* Project Header Box */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.04em',
                }}
              >
                {project.code}
              </span>
              <StatusBadge status={project.status} />
              {stats.overdue > 0 && (
                <span
                  className="badge badge-overdue"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <AlertTriangle size={12} /> {stats.overdue} Overdue
                </span>
              )}
            </div>
            <h1 className="page-title">{project.name}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {canManageProjects && (
              <Button
                variant="secondary"
                icon={Edit}
                size="sm"
                onClick={() => setEditModalOpen(true)}
              >
                Edit Project
              </Button>
            )}
            {canCreateTasks && (
              <Button
                variant="primary"
                icon={Plus}
                size="sm"
                onClick={() => setTaskModalOpen(true)}
              >
                Add Task
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="danger"
                icon={Trash2}
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                title="Delete project workspace"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '900px' }}>
          {project.description}
        </p>

        {/* Metadata Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Project Lead / Manager
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <User size={14} color="var(--text-muted)" />
              <strong style={{ color: 'var(--text-primary)' }}>{project.managerName}</strong>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Delivery Timeline
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <span>
                {formatDate(project.startDate)} &mdash; {formatDate(project.dueDate)}
              </span>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Assigned Team Members ({teamMembers.length})
            </span>
            <div className="avatar-group" style={{ marginTop: '4px' }}>
              {teamMembers.map((m) => (
                <UserAvatar
                  key={m.id}
                  src={m.avatar}
                  name={m.name}
                  size={26}
                  title={`${m.name} (${m.role})`}
                />
              ))}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
              Overall Progress
            </span>
            <div style={{ marginTop: '6px' }}>
              <ProgressBar progress={stats.progress} showLabel={true} height={7} />
            </div>
          </div>
        </div>
      </div>

      {/* Project Statistics Cards Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <StatCard title="Total Tasks" value={stats.total} variant="default" />
        <StatCard title="Completed" value={stats.completed} variant="success" />
        <StatCard title="In Progress" value={stats.inProgress} variant="info" />
        <StatCard title="To Do" value={stats.todo} variant="default" />
        <StatCard title="Blocked" value={stats.blocked} variant="warning" />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          variant={stats.overdue > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Project Tasks List Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="section-title">Project Tasks ({projectTasks.length})</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Granular task breakdown and deliverables for {project.name}
            </p>
          </div>
          {canCreateTasks && (
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setTaskModalOpen(true)}
            >
              Add Task
            </Button>
          )}
        </div>

        {projectTasks.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FolderKanban size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
            <p>No tasks created yet for this project workspace.</p>
          </div>
        ) : (
          <TaskTable tasks={projectTasks} showProject={false} />
        )}
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        project={project}
        users={users}
      />

      {/* Add Task Modal for this project */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleCreateTask}
        projects={projects}
        users={users}
        allTasks={tasks}
        defaultProjectId={project.id}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project Workspace"
        message={`Are you sure you want to delete "${project.name}"? All associated tasks will also be removed. This cannot be undone.`}
        confirmText="Delete Project"
        isDangerous={true}
      />
    </div>
  );
}
