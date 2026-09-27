export function PriorityBadge({ priority }) {
  const getBadgeClass = (p) => {
    switch (p) {
      case 'Critical':
        return 'badge-priority-critical';
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'badge-priority-low';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(priority)}`}>
      <span className="badge-dot" />
      {priority || 'Low'}
    </span>
  );
}
