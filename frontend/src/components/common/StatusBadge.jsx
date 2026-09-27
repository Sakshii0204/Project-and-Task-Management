export function StatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s) {
      case 'Completed':
        return 'badge-status-completed';
      case 'In Progress':
        return 'badge-status-progress';
      case 'To Do':
        return 'badge-status-todo';
      case 'Blocked':
        return 'badge-status-blocked';
      case 'Planning':
        return 'badge-status-planning';
      case 'On Hold':
        return 'badge-status-onhold';
      case 'Active':
        return 'badge-status-progress';
      default:
        return 'badge-status-planning';
    }
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{status || 'Unknown'}</span>;
}
