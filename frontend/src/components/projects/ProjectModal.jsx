import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { validateProjectForm } from '../../utils/validators';

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project = null,
  users = [],
}) {
  if (!isOpen) return null;
  return (
    <ProjectModalContent
      onClose={onClose}
      onSave={onSave}
      project={project}
      users={users}
    />
  );
}

function ProjectModalContent({
  onClose,
  onSave,
  project,
  users,
}) {
  const isEdit = Boolean(project);

  const [formData, setFormData] = useState(() => ({
    name: project?.name || '',
    description: project?.description || '',
    managerId: project?.managerId || '',
    startDate: project?.startDate || '',
    dueDate: project?.dueDate || '',
    status: project?.status || 'Active',
    category: project?.category || 'Engineering',
    budget: project?.budget || '$50,000',
    teamMemberIds: project?.teamMemberIds || [],
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.teamMemberIds.includes(userId);
      return {
        ...prev,
        teamMemberIds: exists
          ? prev.teamMemberIds.filter((id) => id !== userId)
          : [...prev.teamMemberIds, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProjectForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const selectedManager = users.find((u) => u.id === formData.managerId);
      await onSave({
        ...formData,
        managerName: selectedManager ? selectedManager.name : 'Unknown Manager',
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const managerOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.role})`,
  }));

  const statusOptions = [
    { value: 'Planning', label: 'Planning' },
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Project Workspace' : 'Create New Project'}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Enterprise Cloud Migration"
          required
          error={errors.name}
        />

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Outline project objectives, deliverables, and scope..."
            className={`form-textarea ${errors.description ? 'error' : ''}`}
          />
          {errors.description && <p className="form-error">{errors.description}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select
            label="Project Manager"
            name="managerId"
            value={formData.managerId}
            onChange={handleChange}
            options={managerOptions}
            placeholder="Select a project lead"
            required
            error={errors.managerId}
          />

          <Select
            label="Initial Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
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

        {/* Team Members Selection */}
        <div className="form-group">
          <label className="form-label">Assign Team Members</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '8px',
              maxHeight: '130px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f8fafc',
            }}
          >
            {users.map((user) => (
              <label
                key={user.id}
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
                  checked={formData.teamMemberIds.includes(user.id)}
                  onChange={() => handleMemberToggle(user.id)}
                />
                <span>
                  <strong>{user.name}</strong> ({user.role})
                </span>
              </label>
            ))}
          </div>
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
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
