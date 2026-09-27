# Phase 4 Implementation Report — Database-Backed Task Management Engine & Dependencies

## Phase 4 Objective
Replace Phase 1 mock/localStorage Tasks with a production-grade MongoDB and Mongoose database-backed Task Management Engine. After Phase 4, all core business entities—**Users (Phase 2)**, **Projects (Phase 3)**, and **Tasks (Phase 4)**—are 100% database-backed in MongoDB.

---

## Core Entities & Relationships

```
                        User
                     ▲       ▲
          assignee   │       │ createdBy
                     │       │
                   Task ─────┴─────► Project
                     │
                     └──── dependencies[] ────► Task
```

### Relational Schema Definition
1. **Task $\to$ Project**: `Task.project` is a required `ObjectId` reference to `Project`. Tasks cannot exist without an active, non-archived project.
2. **Task $\to$ Assignee**: `Task.assignee` is a required `ObjectId` reference to `User`. The assignee must be an active user and an assigned member (or manager) of the project.
3. **Task $\to$ Creator**: `Task.createdBy` is an immutable `ObjectId` reference to `User`, extracted strictly from authenticated session `req.user._id`.
4. **Task $\to$ Dependencies**: `Task.dependencies` is an array of `ObjectId` references to other `Task` documents within the exact same project.

---

## Task Schema Details

Implemented in `backend/src/models/Task.js`:

| Field | Type | Rules & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required, trimmed, 2-150 chars | Task name / deliverable summary |
| `description` | String | Trimmed, default: `''`, max 2000 chars | Acceptance criteria & technical details |
| `project` | ObjectId | Ref: `'Project'`, required, indexed | Associated Project document |
| `assignee` | ObjectId | Ref: `'User'`, required, indexed | Member responsible for task delivery |
| `createdBy` | ObjectId | Ref: `'User'`, required | Authenticated user who created task |
| `priority` | String | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Urgency classification |
| `status` | String | Enum: `TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED` | Execution status |
| `progress` | Number | 0 to 100, default: `0` | Percentage completion |
| `startDate` | Date | Required, default: `Date.now` | Scheduled work commencement |
| `dueDate` | Date | Required, default: `+14 days`, indexed | Completion deadline |
| `dependencies` | [ObjectId] | Ref: `'Task'`, indexed | Prerequisite task references |
| `completedAt` | Date | Default: `null` | Exact timestamp of task completion |

### Database Indexes
- `{ project: 1, status: 1 }`: Accelerated project task list and status filtering.
- `{ assignee: 1, status: 1 }`: High-speed resolution for `/api/tasks/my`.
- `{ dueDate: 1, status: 1 }`: Fast index scan for `/api/tasks/overdue`.
- `{ dependencies: 1 }`: Efficient dependency graph traversal and cascade updates.

---

## RBAC & Resource-Level Authorization Matrix

| Operation | ADMIN | PROJECT_MANAGER | TEAM_MEMBER |
| :--- | :--- | :--- | :--- |
| **Create Task** | Any active project | Managed projects only | Forbidden (403) |
| **View Task List** | All tasks across workspace | Tasks in managed/member projects | Tasks in assigned projects |
| **View My Tasks** | Own assigned tasks | Own assigned tasks | Own assigned tasks |
| **View Overdue Tasks** | All overdue tasks | Overdue in managed/member projects | Own assigned overdue tasks |
| **Update Full Task** | Full access | Full access in managed projects | Forbidden (403) |
| **Update Execution** | Full access | Full access in managed projects | Status & Progress only for own assigned tasks |
| **Manage Dependencies**| Full access | Full access in managed projects | Forbidden (403) |
| **Delete Task** | Full access | Full access in managed projects | Forbidden (403) |

---

## Status & Progress Consistency Rules

1. **Auto-Completion on Progress 100%**:
   - When `progress` is set to `100`, the backend automatically sets `status = 'COMPLETED'` and records `completedAt = new Date()`.
2. **Auto-Progress on Status COMPLETED**:
   - When `status` is transitioned to `'COMPLETED'`, the backend automatically forces `progress = 100` and records `completedAt = new Date()`.
3. **Reopening Completed Tasks**:
   - When a completed task is moved to `'TODO'` or `'IN_PROGRESS'`, `completedAt` is cleared to `null`, and `progress` is reset to `0` (or the new progress provided $< 100$).
4. **Blocked Completion Prevention**:
   - A task with incomplete prerequisite dependencies cannot be marked `COMPLETED` or set to `progress = 100`. The backend rejects with `400 Bad Request` ("Cannot complete task while blocking prerequisite dependencies remain incomplete").

---

## Dependency Engine & DFS Cycle Detection

### Graph Definition
- In our directed acyclic graph (DAG), a directed edge $A \to B$ denotes that **Task A depends on Task B** (Task B is a prerequisite for Task A).
- When a client attempts to add dependency $B$ to task $A$, we inspect whether a path already exists from $B$ to $A$ ($B \rightsquigarrow A$). If $B$ already transitively depends on $A$, adding $A \to B$ creates a directed cycle ($A \to B \rightsquigarrow A$).

### DFS Cycle Detection Algorithm
Implemented iteratively with an explicit stack in `backend/src/repositories/task.repository.js`:

```javascript
async wouldCreateCycle(taskId, newDependencyId) {
  if (taskId.toString() === newDependencyId.toString()) return true;

  const visited = new Set();
  const stack = [newDependencyId.toString()];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (currentId === taskId.toString()) return true; // Cycle detected

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const currentTask = await this.findById(currentId);
      if (currentTask && Array.isArray(currentTask.dependencies)) {
        for (const dep of currentTask.dependencies) {
          const depIdStr = dep.toString();
          if (!visited.has(depIdStr)) {
            stack.push(depIdStr);
          }
        }
      }
    }
  }
  return false;
}
```

### Time Complexity
- **Time**: $O(V + E)$ where $V$ is the number of tasks in the project and $E$ is the number of dependency relationships.
- **Space**: $O(V)$ for the visited set and traversal stack.

---

## Dynamic Derived Properties

1. **`isBlocked` & `blockingDependencies`**:
   - A task is derived `isBlocked: true` if any task in `dependencies` has `status !== 'COMPLETED'`.
   - `blockingDependencies` returns the populated titles/IDs of all unfinished prerequisite tasks.
2. **`isOverdue` & `daysOverdue`**:
   - Derived in the Mongoose `toJSON` transform: `isOverdue = (now > dueDate) && (status !== 'COMPLETED')`.
   - `daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24))`. Completed tasks are never overdue.

---

## Project Progress Calculation Formula

$$\text{Project Progress} = \text{round}\left( \frac{\sum_{i=1}^N \text{task}_i.\text{progress}}{N} \right)$$

- If a project has $N = 0$ tasks, `progress = 0%`.
- Implemented in `backend/src/repositories/task.repository.js` via `getProjectMetrics` and matched on frontend in `taskUtils.js`.

---

## REST API Specification

All routes mounted at `/api/tasks` and protected by `authenticate`:

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create task with project validation | Admin, Project Manager |
| `GET` | `/api/tasks` | List/search/filter/paginate tasks | Authenticated (scoped) |
| `GET` | `/api/tasks/my` | Get current user assigned tasks | Authenticated (own tasks) |
| `GET` | `/api/tasks/overdue` | Get overdue tasks | Authenticated (scoped) |
| `GET` | `/api/tasks/project/:projectId/metrics` | Get project progress and task KPI metrics | Project members, PM, Admin |
| `GET` | `/api/tasks/:id` | Get task details with populated dependencies | Project members, PM, Admin |
| `PATCH` | `/api/tasks/:id` | Update task fields (scoped by role) | Admin, PM, Team Member (limited) |
| `PATCH` | `/api/tasks/:id/status` | Update task status (auto-synchronizes progress) | Admin, PM, Assigned Member |
| `PATCH` | `/api/tasks/:id/progress`| Update task progress (auto-synchronizes status) | Admin, PM, Assigned Member |
| `POST` | `/api/tasks/:id/dependencies` | Add prerequisite dependency with cycle check | Admin, PM |
| `DELETE`| `/api/tasks/:id/dependencies/:dependencyId` | Remove dependency | Admin, PM |
| `DELETE`| `/api/tasks/:id` | Delete task and cleanup dependency references | Admin, PM |

---

## Automated Test Verification

All 4 test suites passing (74/74 tests total):
- `tests/auth.test.js`: 8/8 tests pass (JWT cookies, bcrypt, login/logout, health).
- `tests/users.test.js`: 10/10 tests pass (User RBAC, status updates).
- `tests/projects.test.js`: 26/26 tests pass (Project RBAC, manager assignment, archiving).
- `tests/tasks.test.js`: 30/30 tests pass (Task creation, DFS cycle detection, blocked rules, overdue logic, progress consistency, role scoping).

---

## Frontend Integration & Mock Retirement

1. **Authoritative Source of Truth**: MongoDB is now the sole source of truth for Tasks. `localStorage.getItem('ptms_tasks')` has been completely retired from normal execution flow.
2. **API Integration**: `frontend/src/services/apiService.js` now implements real REST calls for all task CRUD, progress updates, status transitions, and dependencies.
3. **State Management**: `frontend/src/context/ProjectContext.jsx` loads real database tasks on mount and triggers real backend mutations.
4. **Validation UX**: `TaskModal` restricts assignee choices to members of the selected project; `TaskStatusModal` catches backend blocked-completion rejections and renders inline user guidance.
5. **Code Quality**:
   - `npm run lint`: 0 errors, 0 warnings.
   - `npm run build`: Production bundle generated cleanly.
