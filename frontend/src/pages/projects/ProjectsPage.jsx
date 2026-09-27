import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectTable } from '../../components/projects/ProjectTable';
import { ProjectModal } from '../../components/projects/ProjectModal';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, LayoutGrid, Table, FolderKanban } from 'lucide-react';

export function ProjectsPage() {
  const { currentUser, canManageProjects } = useAuth();
  const { projects, tasks, users, addProject } = useProjects();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = project.name.toLowerCase().includes(q);
        const matchDesc = project.description.toLowerCase().includes(q);
        const matchCode = project.code?.toLowerCase().includes(q);
        const matchLead = project.managerName?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCode && !matchLead) return false;
      }

      if (statusFilter && project.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [projects, search, statusFilter]);

  const handleCreate = async (projectData) => {
    await addProject(projectData, currentUser);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Planning', label: 'Planning' },
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
  ];

  const hasFilters = Boolean(search || statusFilter);

  return (
    <div>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 className="page-title">Projects Portfolio</h2>
          <p className="page-subtitle">
            Manage company projects, assignees, milestones, and track execution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Grid / Table toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '2px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 8px',
              }}
              onClick={() => setViewMode('grid')}
              aria-label="Grid layout"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 8px',
              }}
              onClick={() => setViewMode('table')}
              aria-label="Table layout"
            >
              <Table size={15} />
            </button>
          </div>

          {canManageProjects && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Project
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        showReset={hasFilters}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, code, manager..."
        />

        <div style={{ minWidth: '160px' }}>
          <Select
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            placeholder=""
          />
        </div>
      </FilterBar>

      {/* Projects Content */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try modifying your search criteria or create a new project workspace."
          icon={FolderKanban}
          actionText={canManageProjects ? 'Create Project' : undefined}
          onAction={() => setCreateModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              users={users}
            />
          ))}
        </div>
      ) : (
        <ProjectTable
          projects={filteredProjects}
          tasks={tasks}
          users={users}
        />
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreate}
        users={users}
      />
    </div>
  );
}
