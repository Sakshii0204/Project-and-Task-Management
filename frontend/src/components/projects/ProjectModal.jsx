import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { apiService } from '../../services/apiService';
import { validateProjectForm } from '../../utils/validators';

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project = null,
  users: initialUsers = [],
}) {
  if (!isOpen) return null;
  return (
    <ProjectModalContent
      onClose={onClose}
      onSave={onSave}
      project={project}
      initialUsers={initialUsers}
    />
  );
}

function ProjectModalContent({
  onClose,
  onSave,
  project,
  initialUsers,
}) {
  const isEdit = Boolean(project);

  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(() => (!initialUsers || initialUsers.length === 0));
  const [usersError, setUsersError] = useState(null);

  const users = initialUsers && initialUsers.length > 0 ? initialUsers : fetchedUsers;

  useEffect(() => {
    let isMounted = true;
    if (initialUsers && initialUsers.length > 0) {
      return;
    }

    apiService
      .getUsers()
      .then((data) => {
        if (isMounted) {
          setFetchedUsers(Array.isArray(data) ? data : []);
          setUsersLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load users for project modal:', err);
          setUsersError('Unable to load users. Please try again.');
          setUsersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialUsers]);

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
      const selectedManager = users.find(
        (u) => (u.id || u._id) === formData.managerId
      );
      await onSave({
        ...formData,
        managerName: selectedManager ? selectedManager.name : 'Unknown Manager',
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isUserActive = (u) => {
    const status = (u.status || '').toUpperCase();
    return status === 'ACTIVE';
  };

  const eligibleManagers = users.filter((u) => {
    if (!isUserActive(u)) return false;
    const r = (u.rawRole || u.role || '').toUpperCase();
    return r === 'ADMIN' || r === 'PROJECT_MANAGER' || u.role === 'Admin' || u.role === 'Project Manager';
  });

  const activeTeamMembers = users.filter((u) => isUserActive(u));

  const managerOptions = eligibleManagers.map((u) => ({
    value: u.id || u._id,
    label: `${u.name} — ${u.role || u.rawRole}`,
  }));

  const managerPlaceholder = usersLoading
    ? 'Loading users...'
    : eligibleManagers.length === 0
    ? 'No eligible project managers available.'
    : 'Select a project lead';

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
        {usersError && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#991b1b',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {usersError}
          </div>
        )}

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
            placeholder={managerPlaceholder}
            disabled={usersLoading || eligibleManagers.length === 0}
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
              minHeight: '48px',
              maxHeight: '140px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f8fafc',
            }}
          >
            {usersLoading ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Loading users...
              </p>
            ) : activeTeamMembers.length === 0 ? (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                No active team members available.
              </p>
            ) : (
              activeTeamMembers.map((user) => {
                const userId = user.id || user._id;
                return (
                  <label
                    key={userId}
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
                      checked={formData.teamMemberIds.includes(userId)}
                      onChange={() => handleMemberToggle(userId)}
                    />
                    <span>
                      <strong>{user.name}</strong> ({user.role || user.rawRole})
                    </span>
                  </label>
                );
              })
            )}
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
