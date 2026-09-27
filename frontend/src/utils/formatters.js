/**
 * Date and String Formatting Utilities
 */

/**
 * Formats an ISO date string or Date object into human-friendly format (e.g. 'Oct 15, 2026')
 * @param {string|Date} dateValue
 * @returns {string}
 */
export function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date relative to today (e.g., 'Due in 3 days', 'Due today', 'Overdue by 2 days')
 * @param {string|Date} dateValue
 * @param {string} [status='']
 * @returns {string}
 */
export function formatRelativeDueDate(dateValue, status = '') {
  if (!dateValue) return '';
  if (status === 'Completed') return 'Completed';

  const due = new Date(dateValue);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return `${days} ${days === 1 ? 'day' : 'days'} overdue`;
  }
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}

/**
 * Generates initials from a full name (e.g. "Sakshi Sharma" -> "SS")
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
