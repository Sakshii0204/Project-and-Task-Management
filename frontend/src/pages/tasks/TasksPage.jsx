import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { TaskTable } from '../../components/tasks/TaskTable';
import { TaskModal } from '../../components/tasks/TaskModal';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { filterTasks } from '../../utils/taskUtils';
import { Plus, CheckSquare } from 'lucide-react';

export function TasksPage() {
  const { currentUser, canCreateTasks } = useAuth();
  const {
    tasks,
    projects,
    users,
    addTask,
    updateTask,
  } = useProjects();

  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Apply pure utility filter function
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, {
      search,
      projectId,
      assigneeId,
      priority,
      status,
      overdueOnly,
      sortBy,
      sortOrder,
    });
  }, [tasks, search, projectId, assigneeId, priority, status, overdueOnly, sortBy, sortOrder]);

  const handleCreateOrEdit = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData, currentUser);
    } else {
      await addTask(taskData, currentUser);
    }
    setEditingTask(null);
    setModalOpen(false);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setProjectId('');
    setAssigneeId('');
    setPriority('');
    setStatus('');
    setOverdueOnly(false);
    setSortBy('dueDate');
    setSortOrder('asc');
  };

  const hasActiveFilters = Boolean(
    search || projectId || assigneeId || priority || status || overdueOnly
  );

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const priorityOptions = [
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ];
  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Completed', label: 'Completed' },
  ];

  return (
    <div>
      {/* Header */}
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
          <h2 className="page-title">Enterprise Task Directory</h2>
          <p className="page-subtitle">
            Track status, priorities, dependencies, and owners across projects.
          </p>
        </div>

        {canCreateTasks && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Filter and Sorting Toolbar */}
      <FilterBar showReset={hasActiveFilters} onReset={handleResetFilters}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title, owner, project..."
        />

        <div style={{ minWidth: '150px' }}>
          <Select
            name="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
            placeholder="All Projects"
          />
        </div>

        <div style={{ minWidth: '140px' }}>
          <Select
            name="assigneeId"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={userOptions}
            placeholder="All Assignees"
          />
        </div>

        <div style={{ minWidth: '130px' }}>
          <Select
            name="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={priorityOptions}
            placeholder="All Priorities"
          />
        </div>

        <div style={{ minWidth: '130px' }}>
          <Select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            placeholder="All Statuses"
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#b91c1c',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 10px',
            backgroundColor: overdueOnly ? '#fef2f2' : 'transparent',
            borderRadius: 'var(--radius-md)',
            border: overdueOnly ? '1px solid #fecaca' : '1px solid transparent',
          }}
        >
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
          />
          Overdue Only
        </label>

        {/* Sort by Deadline / Priority */}
        <div style={{ minWidth: '140px' }}>
          <Select
            name="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'dueDate', label: 'Sort: Deadline' },
              { value: 'priority', label: 'Sort: Priority' },
              { value: 'progress', label: 'Sort: Progress' },
              { value: 'title', label: 'Sort: Title' },
            ]}
            placeholder=""
          />
        </div>
      </FilterBar>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="There are no tasks matching your selected filters."
          icon={CheckSquare}
          actionText={canCreateTasks ? 'Create Task' : undefined}
          onAction={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEdit={handleEditClick}
          showProject={true}
        />
      )}

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleCreateOrEdit}
        task={editingTask}
        projects={projects}
        users={users}
        allTasks={tasks}
      />
    </div>
  );
}
