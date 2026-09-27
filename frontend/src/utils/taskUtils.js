/**
 * Task and Project Calculation Utilities
 * Implements pure business logic for project progress, overdue calculations, and filtering.
 */

/**
 * Checks if a task is overdue dynamically.
 * Overdue condition: current date > task.dueDate AND task.status !== 'Completed'
 * @param {Object} task
 * @param {Date} [referenceDate=new Date()]
 * @returns {boolean}
 */
export function isTaskOverdue(task, referenceDate = new Date()) {
  if (!task || !task.dueDate) return false;
  if (task.status === 'Completed') return false;

  const due = new Date(task.dueDate);
  // Set to start of day for fair comparison
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < ref;
}

/**
 * Calculates number of days a task is overdue.
 * Returns 0 if not overdue.
 * @param {Object} task
 * @param {Date} [referenceDate=new Date()]
 * @returns {number}
 */
export function getDaysOverdue(task, referenceDate = new Date()) {
  if (!isTaskOverdue(task, referenceDate)) return 0;

  const due = new Date(task.dueDate);
  const ref = new Date(referenceDate);
  due.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);

  const diffTime = ref.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculates project progress percentage based on its tasks.
 * Formula: SUM(task.progress) / total project tasks
 * If project has no tasks, returns 0.
 * @param {Array<Object>} tasks - Tasks belonging to the project
 * @returns {number} - Rounded integer 0 to 100
 */
export function calculateProjectProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;

  const sumProgress = tasks.reduce((acc, t) => acc + (Number(t.progress) || 0), 0);
  return Math.round(sumProgress / tasks.length);
}

/**
 * Aggregates task count statistics for a project or overall dashboard.
 * @param {Array<Object>} tasks
 * @returns {Object} { total, completed, inProgress, todo, blocked, overdue }
 */
export function getProjectTaskStatistics(tasks = []) {
  if (!Array.isArray(tasks)) {
    return { total: 0, completed: 0, inProgress: 0, todo: 0, blocked: 0, overdue: 0 };
  }

  let total = tasks.length;
  let completed = 0;
  let inProgress = 0;
  let todo = 0;
  let blocked = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.status === 'Completed') completed++;
    else if (task.status === 'In Progress') inProgress++;
    else if (task.status === 'To Do') todo++;
    else if (task.status === 'Blocked') blocked++;

    if (isTaskOverdue(task)) {
      overdue++;
    }
  }

  return { total, completed, inProgress, todo, blocked, overdue };
}

/**
 * Filters a list of tasks by multiple criteria.
 * @param {Array<Object>} tasks
 * @param {Object} filters
 * @returns {Array<Object>}
 */
export function filterTasks(tasks = [], filters = {}) {
  const {
    search = '',
    projectId = '',
    assigneeId = '',
    priority = '',
    status = '',
    overdueOnly = false,
    sortBy = 'dueDate', // 'dueDate' | 'priority' | 'title' | 'progress'
    sortOrder = 'asc',
  } = filters;

  return tasks
    .filter((task) => {
      // Keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchProject = task.projectName?.toLowerCase().includes(q);
        const matchAssignee = task.assigneeName?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchProject && !matchAssignee) {
          return false;
        }
      }

      // Project filter
      if (projectId && task.projectId !== projectId) {
        return false;
      }

      // Assignee filter
      if (assigneeId && task.assigneeId !== assigneeId) {
        return false;
      }

      // Priority filter
      if (priority && task.priority !== priority) {
        return false;
      }

      // Status filter
      if (status && task.status !== status) {
        return false;
      }

      // Overdue filter
      if (overdueOnly && !isTaskOverdue(task)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'priority') {
        const weight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        const diff = (weight[b.priority] || 0) - (weight[a.priority] || 0);
        return sortOrder === 'asc' ? -diff : diff;
      }
      if (sortBy === 'progress') {
        return sortOrder === 'asc' ? a.progress - b.progress : b.progress - a.progress;
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
}
