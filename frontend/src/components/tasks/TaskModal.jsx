import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { validateTaskForm } from '../../utils/validators';

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  task = null,
  projects = [],
  users = [],
  allTasks = [],
  defaultProjectId = null,
}) {
  if (!isOpen) return null;
  return (
    <TaskModalContent
      onClose={onClose}
      onSave={onSave}
      task={task}
      projects={projects}
      users={users}
      allTasks={allTasks}
      defaultProjectId={defaultProjectId}
    />
  );
}

function TaskModalContent({
  onClose,
  onSave,
  task,
  projects,
  users,
  allTasks,
  defaultProjectId,
}) {
  const isEdit = Boolean(task);

  const [formData, setFormData] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    projectId: task?.projectId || defaultProjectId || (projects[0]?.id ?? ''),
    assigneeId: task?.assigneeId || (users[0]?.id ?? ''),
    priority: task?.priority || 'Medium',
    status: task?.status || 'To Do',
    progress: task?.progress !== undefined ? task.progress : 0,
    startDate: task?.startDate || '',
    dueDate: task?.dueDate || '',
    dependencies: task?.dependencies || [],
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'projectId' && value !== prev.projectId) {
        return { ...prev, [name]: value, dependencies: [] };
      }
      return { ...prev, [name]: value };
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDependencyToggle = (depTaskId) => {
    setFormData((prev) => {
      const exists = prev.dependencies.includes(depTaskId);
      return {
        ...prev,
        dependencies: exists
          ? prev.dependencies.filter((id) => id !== depTaskId)
          : [...prev.dependencies, depTaskId],
      };
    });
    if (errors.dependencies) {
      setErrors((prev) => ({ ...prev, dependencies: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateTaskForm(formData, allTasks, task?.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        progress: Number(formData.progress),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.role})`,
  }));

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Completed', label: 'Completed' },
  ];

  const availableDependencies = allTasks.filter(
    (t) => t.projectId === formData.projectId && (!task || t.id !== task.id)
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Integrate UPI 2.0 Webhook Service"
          required
          error={errors.title}
        />

        <div className="form-group">
          <label htmlFor="task-description" className="form-label">
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            placeholder="Technical details, acceptance criteria, notes..."
            className="form-textarea"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select
            label="Project"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            options={projectOptions}
            required
            error={errors.projectId}
          />

          <Select
            label="Assignee / Owner"
            name="assigneeId"
            value={formData.assigneeId}
            onChange={handleChange}
            options={userOptions}
            required
            error={errors.assigneeId}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            required
            error={errors.priority}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            required
          />

          <Input
            label="Progress (%)"
            name="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            required
            error={errors.progress}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
          />

          <Input
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            required
            error={errors.dueDate}
          />
        </div>

        {/* Task Dependencies Selection */}
        <div className="form-group">
          <label className="form-label">Task Dependencies (Blocked by)</label>
          {errors.dependencies && <p className="form-error">{errors.dependencies}</p>}
          <p className="form-hint" style={{ marginBottom: '8px' }}>
            Select prerequisite tasks belonging to this project that must complete first.
          </p>
          {availableDependencies.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No other tasks available in this project to set as dependencies.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '8px',
                maxHeight: '130px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
              }}
            >
              {availableDependencies.map((dep) => (
                <label
                  key={dep.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.dependencies.includes(dep.id)}
                    onChange={() => handleDependencyToggle(dep.id)}
                  />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <strong>{dep.title}</strong> ({dep.status})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
