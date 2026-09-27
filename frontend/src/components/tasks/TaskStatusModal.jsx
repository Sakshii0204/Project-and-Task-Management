import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';

export function TaskStatusModal({ isOpen, onClose, task, onUpdate }) {
  if (!isOpen || !task) return null;
  return (
    <TaskStatusModalContent
      onClose={onClose}
      task={task}
      onUpdate={onUpdate}
    />
  );
}

function TaskStatusModalContent({ onClose, task, onUpdate }) {
  const [status, setStatus] = useState(task.status || 'To Do');
  const [progress, setProgress] = useState(task.progress !== undefined ? task.progress : 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const numericProgress = Number(progress);
      const finalProgress = status === 'Completed' ? 100 : numericProgress;
      await onUpdate(task.id, { status, progress: finalProgress });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Completed', label: 'Completed' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="Update Task Status" maxWidth="450px">
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Updating status for <strong>{task.title}</strong>
        </p>

        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setStatus(nextStatus);
            if (nextStatus === 'Completed') {
              setProgress(100);
            }
          }}
          options={statusOptions}
          required
        />

        <Input
          label="Progress Percentage (0 - 100%)"
          name="progress"
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          required
        />

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
            Save Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
