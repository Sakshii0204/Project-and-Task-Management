/**
 * Form Validation Utilities
 */

/**
 * Validates login form inputs
 * @param {Object} values
 * @returns {Object} errors
 */
export function validateLoginForm(values) {
  const errors = {};

  if (!values.email || !values.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

/**
 * Validates project form inputs
 * @param {Object} values
 * @returns {Object} errors
 */
export function validateProjectForm(values) {
  const errors = {};

  if (!values.name || !values.name.trim()) {
    errors.name = 'Project name is required';
  }

  if (!values.description || !values.description.trim()) {
    errors.description = 'Description is required';
  }

  if (!values.managerId) {
    errors.managerId = 'Project Manager is required';
  }

  if (!values.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!values.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (values.startDate && new Date(values.dueDate) < new Date(values.startDate)) {
    errors.dueDate = 'Due date cannot be before start date';
  }

  return errors;
}

/**
 * Validates task form inputs
 * @param {Object} values
 * @param {Array<Object>} [existingTasks=[]] - Used for dependency checks
 * @param {string} [currentTaskId=null] - For edit mode self-dependency check
 * @returns {Object} errors
 */
export function validateTaskForm(values, existingTasks = [], currentTaskId = null) {
  const errors = {};

  if (!values.title || !values.title.trim()) {
    errors.title = 'Task title is required';
  }

  if (!values.projectId) {
    errors.projectId = 'Project selection is required';
  }

  if (!values.assigneeId) {
    errors.assigneeId = 'Assignee is required';
  }

  if (!values.priority) {
    errors.priority = 'Priority is required';
  }

  if (!values.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (isNaN(new Date(values.dueDate).getTime())) {
    errors.dueDate = 'Due date must be a valid date';
  }

  if (values.startDate && values.dueDate) {
    if (new Date(values.dueDate) < new Date(values.startDate)) {
      errors.dueDate = 'Due date cannot be before start date';
    }
  }

  const progressNum = Number(values.progress);
  if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
    errors.progress = 'Progress must be a number between 0 and 100';
  }

  // Dependency validations:
  if (Array.isArray(values.dependencies) && values.dependencies.length > 0) {
    for (const depId of values.dependencies) {
      if (currentTaskId && depId === currentTaskId) {
        errors.dependencies = 'A task cannot depend on itself';
        break;
      }
      const depTask = existingTasks.find((t) => t.id === depId);
      if (depTask && depTask.projectId !== values.projectId) {
        errors.dependencies = 'Dependencies must belong to the selected project';
        break;
      }
    }
  }

  return errors;
}
