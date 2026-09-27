# Project & Task Management System — Complete Interview Walkthrough

This document is the central interview preparation guide for the **Project & Task Management System (Phase 1)** built for the Thinqloud Solutions Pvt. Ltd. campus recruitment drive. It explains the system architecture, business logic, component structure, and demonstration flow in simple, conversational, interview-friendly language.

---

## 1. PROJECT INTRODUCTION

### What is the Project & Task Management System?
The Project & Task Management System is a centralized business web platform where teams plan, delegate, execute, track, and review collaborative engineering projects. It acts as a single source of truth for organizational delivery.

### What business problem does it solve?
In modern engineering and technology companies:
- Projects fail or suffer delays due to scattered communications across emails, chats, and spreadsheets.
- Team members lack clarity on who owns which task and what the delivery deadline is.
- Downstream tasks are frequently blocked because nobody tracks task dependencies (which task must finish before another can begin).
- Managers find out about overdue work too late, turning minor delays into major delivery failures.

### Why is this application needed?
This platform solves these operational bottlenecks by providing:
1. **Dynamic Visibility**: Instant delivery metrics across all company projects.
2. **Accountability**: Every task has a designated owner, priority level, and timeline.
3. **Dependency Protection**: Clear visualization of which tasks block other tasks.
4. **Automated Risk Escalation**: Automated calculation of overdue items with zero manual reporting delay.

### Who are the users?
- **Company Leadership & Admins**: Need top-level portfolio tracking, resource allocation, and overall completion health.
- **Project Managers**: Create projects, delegate work, monitor milestones, manage deadlines, and unblock team members.
- **Engineers / Team Members**: Need a clean personal workspace (`My Tasks`) to see assigned items, report progress, and flag blockers.

---

## 2. PROJECT OBJECTIVE

The primary objective of Phase 1 is to construct a **production-grade, responsive, and interview-ready frontend** using React and modern component design principles.

All business calculation rules (such as overdue calculations, project progress percentages, priority categorization, and multi-filter queries) run on pure algorithmic utilities and reactive React Context state with mock data. The architecture isolates presentation components from data services so the application can connect to a Node.js/Express/MongoDB REST API in Phase 2 with zero redesign.

---

## 3. USER ROLES

The application is architected around **Role-Based Access Control (RBAC)** supporting three distinct organizational roles:

```
+-------------------------------------------------------------------------+
|                               USER ROLES                                |
+-----------------------+------------------------+------------------------+
|         ADMIN         |    PROJECT MANAGER     |      TEAM MEMBER       |
+-----------------------+------------------------+------------------------+
| Executive Oversight   | Milestone Delivery     | Task Execution         |
| Full CRUD Permissions | Project & Task Manager | Personal Queue         |
| User Directory View   | Dependency Tracking    | Status & Progress Edit |
+-----------------------+------------------------+------------------------+
```

### 1. Admin
- **Responsibilities**: Oversees company portfolios, manages project workspaces, reviews team distribution, and ensures project governance.
- **Screens Used**: All screens (`Dashboard`, `Projects`, `Project Details`, `Tasks`, `Task Details`, `Overdue`, `Team Directory`, `Profile`).
- **Actions Permitted**:
  - Create, edit, and delete project workspaces.
  - Create, assign, edit, and delete tasks.
  - View all user workloads and team member directories.
  - Access administrative actions.

### 2. Project Manager (PM)
- **Responsibilities**: Responsible for successful project delivery, milestone planning, scheduling, assigning tasks, and resolving blockers.
- **Screens Used**: `Dashboard`, `Projects`, `Project Details`, `Tasks`, `Task Details`, `Overdue`, `Team Directory`, `Profile`.
- **Actions Permitted**:
  - Create new projects and modify project schedules.
  - Create tasks, assign owners, set priorities, and link prerequisite dependencies.
  - Monitor overdue risks and reallocate resources.

### 3. Team Member (Engineer / Designer / QA)
- **Responsibilities**: Focuses on task execution, updating task progress percentages, transitioning task statuses, and keeping deadlines.
- **Screens Used**: `My Tasks` (primary view), `Dashboard`, `Tasks`, `Task Details`, `Projects` (read-only view), `Profile`.
- **Actions Permitted**:
  - View tasks assigned to them under `My Tasks`.
  - Update status (`To Do` -> `In Progress` -> `Completed` or `Blocked`).
  - Update progress slider (0% to 100%).
  - Inspect task prerequisites and downstream dependents.

---

## 4. COMPLETE APPLICATION FLOW

The system follows an intuitive and structured business flow:

```
[1. Login]
   │  (Mock Authentication with 1-click Admin / PM / Dev credentials)
   ▼
[2. Dashboard]
   │  (6 Live KPI Cards, Project Progress Meters, Deadlines, Overdue Feed, Activity Log)
   ▼
[3. Projects Portfolio]
   │  (Browse projects via Card Grid or Data Table with search & status filters)
   ▼
[4. Project Details]
   │  (Inspect project metadata, assigned team members, stats breakdown & project task list)
   ▼
[5. Task Directory]
   │  (Filter tasks by Project, Assignee, Priority, Status, Overdue, and Deadline Sort)
   ▼
[6. Task Creation & Assignment]
   │  (Create task, attach to project, assign team member, configure start/due dates)
   ▼
[7. Dependency Linking]
   │  (Select prerequisite tasks that must complete first)
   ▼
[8. Progress & Status Updates]
   │  (Update progress % and status, trigger collaborative audit log)
   ▼
[9. Overdue Intelligence]
   │  (System clock compares currentDate > dueDate; flags overdue items across UI)
   ▼
[10. Dedicated Views (My Tasks & Overdue)]
      (Personalized queues and emergency escalation dashboards)
```

1. **Login**: User enters credentials or clicks one of three demo autofill buttons (`Admin`, `Manager`, `Engineer`). The mock auth system validates the credentials and saves the session.
2. **Dashboard**: User is redirected to `/dashboard`. Dynamic metrics calculate real-time counts for Total Projects, Active Projects, Total Tasks, Completed Tasks, In-Progress Tasks, and Overdue Tasks.
3. **Projects**: User navigates to `/projects` to browse projects in either Card Grid or Enterprise Table view, filter by status, or search.
4. **Project Details**: Clicking any project opens `/projects/:id`, revealing the project description, manager, team avatars, timeline, and all tasks assigned to this project.
5. **Tasks**: User visits `/tasks` to inspect all tasks across the company. Powerful multi-filter toolbar enables filtering by project, assignee, priority, status, or overdue state.
6. **Task Assignment**: Creating or editing a task allows assigning any team member as the owner.
7. **Deadline Setting**: Each task requires a start and due date, validated so the due date cannot precede the start date.
8. **Dependencies**: Tasks can be marked as dependent on other tasks in the same project.
9. **Progress Tracking**: Team members update their completion percentages (0–100%) and status (`To Do`, `In Progress`, `Blocked`, `Completed`).
10. **Overdue Detection**: Any incomplete task whose due date has passed is dynamically styled with red warnings and pushed to the `/overdue` view.

---

## 5. PHASE 1 ARCHITECTURE

Phase 1 follows a clean **layered frontend architecture**:

```
+-------------------------------------------------------------+
|                      1. USER INTERACTION                    |
|             (Browser clicks, inputs, route changes)         |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                        2. ROUTING                           |
|       (React Router DOM v7 + ProtectedRoute RBAC Guards)    |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                     3. PAGE CONTROLLERS                     |
|  (DashboardPage, ProjectsPage, TasksPage, OverduePage, etc) |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                    4. REUSABLE UI LAYER                     |
|    (Cards, Tables, Modals, Badges, SearchBar, ProgressBars) |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                 5. STATE & CONTEXT LAYER                    |
|   (AuthContext: RBAC session | ProjectContext: CRUD store)  |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|              6. BUSINESS LOGIC & CALCULATION ENGINE         |
|  (isTaskOverdue, calculateProgress, getProjectStatistics)   |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|             7. DATA ABSTRACTION & STORAGE LAYER             |
|        (apiService.js + mockData + localStorage cache)      |
+-------------------------------------------------------------+
```

### Explanation of Layers:
1. **User Interaction Layer**: Captures clicks, form submissions, filter selections, and navigation requests.
2. **Routing Layer**: Validates whether the user is logged in. If not, redirects to `/login`. If the user lacks role permission, redirects to `/unauthorized`.
3. **Page Controllers**: Coordinates state, manages modal visibility, and orchestrates layout for specific screens.
4. **Reusable UI Layer**: Dumb presentation components (Buttons, Inputs, Badges) that render data provided via props and emit events.
5. **State & Context Layer**: React Context stores global state in memory and provides dispatch methods (`addProject`, `updateTask`, `switchRole`).
6. **Business Logic Layer**: Pure JavaScript functions that compute derived values (e.g. project progress %, days overdue) on the fly without mutating source data.
7. **Data Abstraction Layer**: `apiService.js` simulates backend API calls. In Phase 1, it queries `mockData` and syncs with `localStorage`. In Phase 2, this layer is swapped for Axios HTTP requests.

---

## 6. FOLDER STRUCTURE

```
frontend/
├── src/
│   ├── assets/              # Static branding and vector icons
│   ├── components/
│   │   ├── common/          # 16 atomic, highly reusable UI components
│   │   ├── layout/          # Shell architecture (Header, Sidebar, AppLayout)
│   │   ├── dashboard/       # Dashboard-specific widgets (KPIs, Activity, Deadlines)
│   │   ├── projects/        # Project domain widgets (ProjectCard, ProjectTable, ProjectModal)
│   │   └── tasks/           # Task domain widgets (TaskTable, TaskCard, TaskModal, StatusModal)
│   ├── context/             # Global application state providers (AuthContext, ProjectContext)
│   ├── data/                # Seed mock datasets (mockUsers, mockProjects, mockTasks, mockActivities)
│   ├── pages/               # Top-level route views (auth, dashboard, projects, tasks, users, profile)
│   ├── routes/              # Route map (AppRoutes) and route guard (ProtectedRoute)
│   ├── services/            # API abstraction layer (apiService.js)
│   ├── styles/              # Design tokens and modular CSS (index.css, components.css)
│   ├── utils/               # Pure calculation utilities, formatters, and form validators
│   ├── App.jsx              # Application root with Provider wrapping
│   └── main.jsx             # React 19 DOM mount entrypoint
├── docs/                    # Architecture, Phase 1 documentation, and Interview Walkthrough
└── README.md                # Project README and quick start instructions
```

### Folder Roles and Connections:
- `src/utils`: Contains pure algorithms (`taskUtils.js`, `validators.js`). No JSX. Used by Context, Pages, and Components.
- `src/data`: Contains initial realistic mock seed records. Read by `apiService.js` and Context.
- `src/context`: Uses `services/apiService.js` and `utils/taskUtils.js` to manage application state.
- `src/components`: UI building blocks. Receives data via props from Pages and emits user actions.
- `src/pages`: Assembles components and binds them to Context hooks (`useAuth`, `useProjects`).
- `src/routes`: Determines which Page renders for which browser URL.

---

## 7. IMPORTANT FILES

### 1. `src/utils/taskUtils.js`
- **Purpose**: Pure business logic engine for calculating overdue items, project completion percentages, project task statistics, and multi-criteria task filtering.
- **Used By**: `ProjectContext.jsx`, `DashboardPage.jsx`, `ProjectDetailPage.jsx`, `TasksPage.jsx`, `OverduePage.jsx`.
- **Important Logic**:
  - `isTaskOverdue(task)`: Compares `task.dueDate < startOfDay(now)` and `task.status !== 'Completed'`.
  - `getDaysOverdue(task)`: Computes exact integer day difference between today and due date.
  - `calculateProjectProgress(tasks)`: Evaluates `(completedTasks / totalTasks) * 100`.
  - `filterTasks(tasks, filters)`: Multi-attribute search, filter, and sort algorithm.

### 2. `src/context/AuthContext.jsx`
- **Purpose**: Manages current user session, mock authentication, RBAC role detection, and role-switching.
- **Used By**: Entire application (`Header`, `Sidebar`, `ProtectedRoute`, `LoginPage`, `ProfilePage`).
- **Important Logic**:
  - Lazily initializes user session from `localStorage` without cascading re-renders.
  - Exposes `currentUser`, `isAuthenticated`, `isAdmin`, `isProjectManager`, `isTeamMember`.
  - Provides `switchRole(role)` for instantaneous interview role switching.

### 3. `src/context/ProjectContext.jsx`
- **Purpose**: Central state store for projects, tasks, activities, and team members.
- **Used By**: All dashboard, project, and task pages.
- **Important Logic**:
  - Provides CRUD methods: `addProject`, `updateProject`, `deleteProject`, `addTask`, `updateTask`, `deleteTask`.
  - Automatically logs audit events (e.g. `TASK_COMPLETED`, `PROJECT_CREATED`) upon mutations.
  - Exposes `getOverallStats()` and `getProjectStats(id)` for dynamic KPI calculations.

### 4. `src/routes/ProtectedRoute.jsx`
- **Purpose**: Client-side route security wrapper enforcing authentication and role verification.
- **Used By**: `src/routes/AppRoutes.jsx`.
- **Important Logic**:
  - If user is not authenticated, redirects to `/login` preserving intended destination in state.
  - If user lacks required role, redirects to `/unauthorized`.
  - Otherwise, renders child route components inside `AppLayout`.

### 5. `src/components/layout/Sidebar.jsx`
- **Purpose**: Primary responsive navigation sidebar.
- **Used By**: `AppLayout.jsx`.
- **Important Logic**:
  - Renders navigation links with dynamic badge counters (e.g., alert badge showing live overdue count).
  - Includes Demo RBAC Switcher buttons (`Admin`, `PM`, `Dev`) for instant role changes.
  - Converts to a touch-friendly slide-over drawer on mobile screens (`<= 900px`).

### 6. `src/pages/tasks/OverduePage.jsx`
- **Purpose**: Dedicated risk-monitoring screen highlighting past-due tasks.
- **Used By**: Route `/overdue`.
- **Important Logic**:
  - Dynamically extracts overdue items using `isTaskOverdue(task)`.
  - Sorts tasks by days overdue descending (most critical items first).
  - Displays red warning badges and provides one-click status update modals.

---

## 8. REACT CONCEPTS USED

### 1. Components
Modular, self-contained UI units that return JSX.
- *Example*: `StatCard.jsx` accepts `title`, `value`, `icon`, and `variant` to render uniform KPI cards across pages.

### 2. Props
Read-only parameters passed from parent components to child components to configure appearance and behavior.
- *Example*: `<StatusBadge status={project.status} />` passes project status to render color-coded badge pills.

### 3. State (`useState`)
Encapsulated data within a component that triggers a re-render when modified.
- *Example*: `search` and `statusFilter` state in `ProjectsPage.jsx` update as the user types or selects a dropdown.

### 4. Context API & `useContext`
Solves "prop drilling" by sharing global state across deeply nested components.
- *Example*: `useAuth()` provides `currentUser` to `Header.jsx` and `Sidebar.jsx` without passing user props through `AppLayout`.

### 5. Lazy State Initialization
Passing a function to `useState(() => initialValue)` so expensive calculations (like reading from `localStorage`) run only on mount rather than on every render.
- *Example*: In `AuthContext.jsx`, `useState(() => getStoredSession())` prevents cascading renders flagged by React 19 lint rules.

### 6. React Router DOM (v7)
Client-side routing library enabling multi-page navigation without full browser refreshes.
- *Example*: `<Routes>`, `<Route>`, `<NavLink>`, and `useNavigate()` coordinate navigation between `/dashboard`, `/projects`, and `/tasks`.

### 7. Protected Routes & Route Guards
Higher-Order Component pattern that checks conditions before rendering target components.
- *Example*: `<ProtectedRoute>` wraps all private routes, checking `isAuthenticated` and redirecting to `/login` if false.

### 8. Conditional Rendering
Rendering different UI elements based on state or business rules.
- *Example*: In `TaskDetailPage.jsx`, the red overdue banner renders only if `isTaskOverdue(task) === true`.

### 9. Event Handling
Handling user interactions (clicks, keyboard input, form submissions).
- *Example*: `onChange={(e) => setSearch(e.target.value)}` updates search queries in real time.

### 10. Form Handling & Controlled Components
Form input elements whose values are tied directly to React state.
- *Example*: In `ProjectModal.jsx`, input values bind to `formData.name` and update via `handleChange`.

---

## 9. ROUTING FLOW

| Route Path | Page Component | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage` | Public | Authentication gateway with demo credentials |
| `/` | Redirect | Protected | Automatically redirects authenticated visits to `/dashboard` |
| `/dashboard` | `DashboardPage` | Protected | Executive summary with 6 KPIs and progress widgets |
| `/projects` | `ProjectsPage` | Protected | Project catalog with grid/table toggle & search |
| `/projects/:id` | `ProjectDetailPage` | Protected | Detailed project view, statistics, and task breakdown |
| `/tasks` | `TasksPage` | Protected | Enterprise task directory with multi-filter query bar |
| `/tasks/:id` | `TaskDetailPage` | Protected | Task inspector with dependency mapping |
| `/my-tasks` | `MyTasksPage` | Protected | Filtered personal task queue for current user |
| `/overdue` | `OverduePage` | Protected | Critical risk-escalation table with days overdue metrics |
| `/team` | `TeamPage` | Protected | Team member directory preparing for Phase 2/3 RBAC |
| `/profile` | `ProfilePage` | Protected | User profile details and role inspection |
| `/unauthorized` | `UnauthorizedPage` | Protected | Error screen when a role lacks permissions |
| `*` | `NotFoundPage` | Public | Global 404 handler for invalid routes |

### How `ProtectedRoute` Works:
```
User visits route (e.g. /projects)
           │
           ▼
 Is loading auth state? ──YES──> Render LoadingSpinner
           │ NO
           ▼
 Is user authenticated? ──NO───> Redirect to /login (save intended path)
           │ YES
           ▼
 Does route require role?
    ├─ Role not allowed ───────> Redirect to /unauthorized
    └─ Role allowed ───────────> Render requested page inside AppLayout
```

---

## 10. MOCK AUTHENTICATION

### Phase 1 Mock Flow:
1. User enters email and password on `/login` (or clicks demo autofill buttons for Admin, PM, or Dev).
2. `validateLoginForm()` validates that email is populated and formatted correctly, and password has at least 6 characters.
3. Form submits to `login()` in `AuthContext`.
4. `login()` looks up the email in `mockUsers.js` and verifies against demo credentials.
5. If valid, the user object is saved to React state and `localStorage`.
6. User is redirected to `/dashboard`.

```
[Login Form] ──> [Validate Form] ──> [Check mockUsers.js] ──> [Save to State & LocalStorage] ──> [Redirect to /dashboard]
```

### Phase 2 Real JWT Integration Flow:
In Phase 2, this mock layer will be replaced with real backend authentication:
```
[React Login Form]
       │
       ▼ (HTTP POST /api/auth/login)
[Express Server & Auth Controller]
       │
       ▼ (Find user by email)
[MongoDB Database]
       │
       ▼ (Verify password hash via bcrypt.compare)
[bcrypt Hashing Engine]
       │
       ▼ (Sign JWT with userId & role payload)
[jsonwebtoken Library]
       │
       ▼ (Return HTTP 200 + JWT in httpOnly Cookie)
[React Frontend]
       │
       ▼ (Store user in AuthContext & attach token to future Axios requests)
[Authenticated Requests with Bearer Token]
```

---

## 11. PROJECT MANAGEMENT FLOW

```
[Click "Create Project"]
           │
           ▼
   [ProjectModal opens]
           │
           ▼
[Fill: Name, Description, Lead, Dates, Status, Members]
           │
           ▼
   [Form Validation]
     ├─ Name required
     ├─ Description required
     ├─ Manager required
     ├─ Start date required
     ├─ Due date required
     └─ Due date >= Start date
           │ Passed
           ▼
[addProject() dispatched in ProjectContext]
           │
           ▼
[New project prepended to state & persisted to localStorage]
           │
           ▼
[Audit activity logged: "Rajesh Kulkarni created new project workspace"]
           │
           ▼
[Project instantly appears on Dashboard & Projects Page]
```

### Important Project Fields:
- `id`: Unique identifier (e.g. `proj-1`).
- `code`: Project reference code (e.g. `ECM-2026`).
- `name`: Human-readable title (e.g. `Enterprise Cloud Migration`).
- `description`: Detailed technical scope and deliverables.
- `managerId` & `managerName`: Designated project lead.
- `teamMemberIds`: Array of user IDs assigned to work on the project.
- `startDate` & `dueDate`: Timeline boundaries.
- `status`: `Planning`, `Active`, `On Hold`, `Completed`.
- `budget`: Allocated financial resources.

---

## 12. TASK MANAGEMENT FLOW

```
[Click "Create Task"]
           │
           ▼
    [TaskModal opens]
           │
           ▼
[Fill: Title, Description, Project, Assignee, Priority, Status, Dates, Dependencies]
           │
           ▼
   [validateTaskForm()]
     ├─ Title required
     ├─ Project required
     ├─ Assignee required
     ├─ Priority required
     ├─ Due date required & valid
     ├─ Progress must be 0–100%
     ├─ Task cannot depend on itself
     └─ Dependencies must belong to same project
           │ Passed
           ▼
[addTask() dispatched in ProjectContext]
           │
           ▼
[Assignee & Project metadata enriched onto task object]
           │
           ▼
[Audit activity logged: "Priya Sundaram assigned task to Sakshi Sharma"]
           │
           ▼
[Task displays across Task Directory, Project Details, and My Tasks]
```

---

## 13. TASK DEPENDENCIES

### What is a Task Dependency?
A task dependency is a directional relationship between two tasks where Task B cannot start or complete until Task A has finished.

### Real Engineering Example:
```
[Task 1: Database Schema Migration]
                 │
                 ▼ (Prerequisite / Blocker)
[Task 2: REST API Endpoint Development]
                 │
                 ▼ (Prerequisite / Blocker)
[Task 3: React Frontend Integration]
                 │
                 ▼ (Prerequisite / Blocker)
[Task 4: QA End-to-End Testing]
```

In this pipeline:
- *REST API Development* is **Blocked By** *Database Schema Migration*.
- *Database Schema Migration* has downstream dependents: *REST API Development* **Depends On** it.

### Why Dependency Management is Critical:
1. **Prevents Idle Bottlenecks**: Developers avoid working on frontend screens before APIs or data models are ready.
2. **Accurate Scheduling**: Helps Project Managers identify the *Critical Path*—the sequence of dependent tasks that determines the overall project deadline.
3. **Risk Containment**: If a blocker task is delayed or marked `Blocked`, managers immediately know which downstream deliverables will be affected.

---

## 14. OVERDUE BUSINESS LOGIC

### Mathematical Definition:
A task is classified as **Overdue** if and only if:
```
currentDate > dueDate AND task.status !== "Completed"
```

If a task is marked `Completed`, it is **never** overdue, even if today's date is after its due date.

### Reusable Utility Implementation:
Located in `src/utils/taskUtils.js`:

```javascript
export function isTaskOverdue(task, referenceDate = new Date()) {
  if (!task || !task.dueDate) return false;
  if (task.status === 'Completed') return false;

  const due = new Date(task.dueDate);
  const ref = new Date(referenceDate);
  // Normalize time to start of day for clean date comparisons
  due.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);

  return due < ref;
}

export function getDaysOverdue(task, referenceDate = new Date()) {
  if (!isTaskOverdue(task, referenceDate)) return 0;

  const due = new Date(task.dueDate);
  const ref = new Date(referenceDate);
  due.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);

  const diffTime = ref.getTime() - due.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
```

### Real Example:
- **Reference Date (Today)**: September 26, 2026
- **Task**: *Database Zero-Downtime Replication to AWS Aurora*
- **Due Date**: September 20, 2026
- **Status**: `Blocked`
- **Evaluation**: September 26 > September 20 AND status is not `Completed` &rarr; **OVERDUE (6 days overdue)**.
- **UI Impact**: Red warning styling in Task Table, red badge on Dashboard, displayed on `/overdue` page, and red banner on Task Details page.

---

## 15. PROJECT PROGRESS LOGIC

### Progress Formula:
Project progress is calculated dynamically from the statuses of its constituent tasks:

$$\text{Project Progress} = \left( \frac{\text{Completed Tasks in Project}}{\text{Total Tasks in Project}} \right) \times 100$$

If a project has 0 tasks, progress defaults to 0%.

### Implementation:
Located in `src/utils/taskUtils.js`:

```javascript
export function calculateProjectProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;

  const completed = tasks.filter((t) => t.status === 'Completed').length;
  return Math.round((completed / tasks.length) * 100);
}
```

### Real Example:
- Project: *Enterprise Cloud Migration*
- Total Tasks = 5
- Tasks:
  - Task 101: `Completed`
  - Task 102: `Completed`
  - Task 103: `In Progress`
  - Task 104: `Blocked`
  - Task 105: `To Do`
- Completed Tasks = 2
- Progress = $(2 / 5) \times 100 = \mathbf{40\%}$.

If a developer changes Task 103 from `In Progress` to `Completed`, progress instantly recalculates to $(3 / 5) \times 100 = \mathbf{60\%}$.

---

## 16. DASHBOARD LOGIC

Dashboard figures are **computed dynamically** from reactive state on every render, never hardcoded:

```
[ProjectContext State: projects[], tasks[]]
                     │
                     ▼
             [getOverallStats()]
                     │
     ┌───────────────┼───────────────┬────────────────┐
     ▼               ▼               ▼                ▼
Total Projects  Active Projects  Total Tasks    Task Breakdown
 projects.length  status==Active   tasks.length   (via getProjectTaskStatistics)
                                                 ├─ Completed Tasks
                                                 ├─ In Progress Tasks
                                                 └─ Overdue Tasks (via isTaskOverdue)
```

1. **Total Projects**: `projects.length`.
2. **Active Projects**: `projects.filter(p => p.status === 'Active').length`.
3. **Total Tasks**: `tasks.length`.
4. **Completed Tasks**: `tasks.filter(t => t.status === 'Completed').length`.
5. **In Progress Tasks**: `tasks.filter(t => t.status === 'In Progress').length`.
6. **Overdue Tasks**: `tasks.filter(t => isTaskOverdue(t)).length`.

When any task is edited or created, React state updates and all 6 stat cards recalculate immediately.

---

## 17. SEARCH & FILTER FLOW

The application implements a multi-attribute filter engine in `src/utils/taskUtils.js`:

```
Input Collection (tasks[])
           │
           ▼
[Keyword Search] ──> Matches title, description, projectName, or assigneeName (case-insensitive)
           │
           ▼
[Project Filter] ──> Matches task.projectId === selectedProjectId
           │
           ▼
[Assignee Filter] ─> Matches task.assigneeId === selectedAssigneeId
           │
           ▼
[Priority Filter] ─> Matches task.priority === selectedPriority
           │
           ▼
[Status Filter] ───> Matches task.status === selectedStatus
           │
           ▼
[Overdue Only] ────> Evaluates isTaskOverdue(task) === true
           │
           ▼
[Sorter Engine] ───> Sorts by dueDate (ascending/descending), priority weight, progress, or title
           │
           ▼
Output: Filtered & Sorted Task Collection
```

This ensures that combining multiple filters (e.g. *Enterprise Cloud Migration* + *Critical Priority* + *Overdue Only*) yields accurate, instant results.

---

## 18. VALIDATION

Robust client-side validation prevents invalid data entry across forms (`src/utils/validators.js`):

### 1. Login Validation (`validateLoginForm`)
- **Email**: Cannot be empty; must match email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- **Password**: Cannot be empty; minimum 6 characters.

### 2. Project Validation (`validateProjectForm`)
- **Name**: Required; non-empty trimmed string.
- **Description**: Required; outlines scope.
- **Project Manager**: Required; lead must be assigned.
- **Start Date**: Required valid date.
- **Due Date**: Required valid date; cannot be chronologically earlier than start date (`dueDate >= startDate`).

### 3. Task Validation (`validateTaskForm`)
- **Title**: Required; descriptive title.
- **Project**: Required; task must belong to a project workspace.
- **Assignee**: Required; designated owner.
- **Priority**: Required (`Low`, `Medium`, `High`, `Critical`).
- **Due Date**: Required; valid calendar date.
- **Progress**: Numeric value bounded strictly between 0 and 100.
- **Self-Dependency Constraint**: A task cannot list itself as a prerequisite (`depId !== task.id`).
- **Cross-Project Constraint**: Dependencies must belong to the same project workspace (`depTask.projectId === values.projectId`).

---

## 19. RESPONSIVE DESIGN

The application is built to provide an optimal user experience across all screen form factors:

```
+-------------------------------------------------------------------------+
|                           RESPONSIVE BEHAVIOR                           |
+-------------------+-----------------------------------------------------+
| Viewport          | Layout Adaptations                                  |
+-------------------+-----------------------------------------------------+
| Desktop (>1024px) | Permanent 260px sidebar, 2-column dashboard widgets,|
|                   | wide multi-column tables, inline toolbars           |
+-------------------+-----------------------------------------------------+
| Laptop (900-1024) | Compact dashboard columns, responsive filter wraps  |
+-------------------+-----------------------------------------------------+
| Tablet (600-900)  | Sidebar collapses into off-canvas drawer with       |
|                   | backdrop overlay; hamburger toggle in header        |
+-------------------+-----------------------------------------------------+
| Mobile (<600px)   | 1-column card grids, horizontal scroll table wraps  |
|                   | (`.table-container`), full-width modal dialogs      |
+-------------------+-----------------------------------------------------+
```

- **Off-Canvas Sidebar Drawer**: On viewports `<= 900px`, the sidebar transforms into an off-screen drawer with a backdrop overlay that closes upon clicking any navigation link or the backdrop.
- **Table Scroll Containers**: Enterprise data tables are wrapped in `.table-container` with `overflow-x: auto` so wide tables scroll horizontally without breaking screen boundaries.
- **Fluid Layout Grids**: KPI cards and project cards utilize CSS Grid with `repeat(auto-fill, minmax(320px, 1fr))` to adjust column counts automatically.

---

## 20. REUSABLE COMPONENTS

16 atomic components live in `src/components/common/` to eliminate duplicate code:

```
+-------------------------------------------------------------------------+
|                      COMMON REUSABLE COMPONENTS                         |
+-----------------------+-------------------------------------------------+
| Component             | Purpose & Capabilities                          |
+-----------------------+-------------------------------------------------+
| Button                | Primary, secondary, danger, ghost variants with |
|                       | inline Lucide icons and loading spinner state   |
| Input                 | Form input with floating label, icon adornment, |
|                       | and validation error messaging                  |
| Select                | Accessible dropdown with option mapping         |
| Modal                 | Overlay dialog with ESC key and backdrop close  |
| ConfirmationModal     | Destructive action confirmation dialog          |
| StatusBadge           | Color-coded badge for task and project statuses |
| PriorityBadge         | Priority pill with color indicator dot          |
| ProgressBar           | Animated progress bar with percentage readout   |
| StatCard              | KPI metric card with icon container and trend   |
| SearchBar             | Text search field with clear button             |
| FilterBar             | Flexible toolbar container for filter controls  |
| UserAvatar            | Profile avatar with fallback initials           |
| DeadlineBadge         | Dynamic due date badge with overdue alert tag   |
| LoadingSpinner        | Centered loading indicator                      |
| EmptyState            | Contextual illustration when no items match     |
| ErrorMessage          | Alert banner with retry callback                |
+-----------------------+-------------------------------------------------+
```

### Why Reusability Matters:
1. **Consistency**: The entire UI adheres to the same padding, border radii, colors, and typography tokens.
2. **Maintainability**: Changing button styles or badge padding in one component updates hundreds of instances across the app.
3. **Accessibility**: Modal keyboard traps and ARIA labels are implemented once and shared across all dialogs.

---

## 21. ERROR & FEEDBACK HANDLING

- **Validation Errors**: Inline red error messages render under invalid fields immediately upon form submission.
- **Empty States**: If a search or filter produces no records, `EmptyState` displays a helpful message and a clear-filters or create button instead of a blank screen.
- **Loading States**: During data loading or mock authentication delays, `LoadingSpinner` provides visual feedback.
- **404 Not Found Page**: Navigating to undefined routes (e.g. `/unknown-path`) renders `NotFoundPage` with a button to return to the Dashboard.
- **Unauthorized Page**: Attempting to access restricted screens with an unauthorized role displays `UnauthorizedPage` explaining the RBAC restriction.

---

## 22. PHASE 1 LIMITATIONS

To maintain strict project boundaries and ensure high frontend quality for Phase 1, the following features are intentionally reserved for Phase 2:

1. **No Express Backend Server**: Data operations execute locally in the browser; there is no Node.js server.
2. **No MongoDB Database**: State is initialized from seed files and saved in browser `localStorage`.
3. **No Real JWT Authentication**: Session authentication is simulated through mock profiles without signed cryptographic tokens.
4. **No Password Hashing**: Passwords are verified in plain text against demo records; bcrypt hashing will be added in Phase 2.
5. **No WebSocket / Real-Time Push**: Updates occur through local React state rather than Socket.IO broadcasts.

---

## 23. HOW PHASE 2 WILL CONNECT

Phase 1 was intentionally designed with an API service abstraction layer (`services/apiService.js`) to allow a seamless backend transition:

```
PHASE 1 (Current):
[React Component] ──> [Context Provider] ──> [apiService.js] ──> [localStorage / mockData]

PHASE 2 (Upcoming):
[React Component] ──> [Context Provider] ──> [apiService.js (Axios)] ──> [Express REST APIs] ──> [Mongoose Models] ──> [MongoDB Database]
```

### What Changes in Phase 2:
1. **`apiService.js`**: Instead of reading from `localStorage`, functions will call `axios.get('/api/projects')`, `axios.post('/api/tasks')`, etc.
2. **Authentication**: `AuthContext.login()` will send an HTTP POST request to `/api/auth/login`, receive a signed JWT token in an `httpOnly` cookie, and store user metadata.
3. **Database**: Project and Task schemas in `mockProjects.js` and `mockTasks.js` mirror Mongoose schemas, enabling a smooth migration to MongoDB collections.

---

## 24. IMPORTANT TECHNICAL TERMS (INTERVIEW REVISION)

- **React**: A component-based JavaScript library for building interactive user interfaces via a virtual DOM.
- **Vite**: A modern frontend build tool and development server using native ES modules for ultra-fast Hot Module Replacement (HMR).
- **SPA (Single Page Application)**: A web application that loads a single HTML page and updates content dynamically without full browser reloads.
- **Component**: An independent, reusable piece of UI that manages its own rendering and logic.
- **Props**: Short for properties; read-only data passed from parent to child components.
- **State**: Mutable data managed within a component that causes the component to re-render when changed.
- **Context API**: React's built-in state management solution for sharing data globally across the component tree without prop drilling.
- **Hook**: A special function (e.g. `useState`, `useContext`) that lets function components use React state and lifecycle features.
- **Routing**: The mechanism that maps browser URLs to specific pages and components.
- **Protected Route**: A route wrapper that checks if a user is authenticated before allowing access to a view.
- **CRUD**: The four fundamental data actions: Create, Read, Update, and Delete.
- **REST API**: Representational State Transfer; an architectural pattern for network APIs using standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- **Frontend**: The client-side interface that users interact with in their browser.
- **Backend**: The server-side environment that processes business logic, interacts with databases, and handles authentication.
- **Database**: An organized, persistent storage system for application data.
- **MongoDB**: A NoSQL document-oriented database that stores records as flexible BSON/JSON documents.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js that provides schema validation and query building.
- **Express**: A minimal and flexible Node.js web application framework for building REST APIs.
- **Node.js**: A cross-platform JavaScript runtime environment that executes JavaScript outside of the browser.
- **JWT (JSON Web Token)**: A compact, URL-safe standard for securely transmitting verified claims between parties as a digitally signed token.
- **Authentication**: Verifying **who** a user is (e.g., verifying email and password).
- **Authorization**: Verifying **what** an authenticated user is permitted to do (e.g., can a Team Member delete a project?).
- **RBAC (Role-Based Access Control)**: Restricting system access to authorized users based on their assigned role (Admin, PM, Member).
- **JSON**: JavaScript Object Notation; lightweight text data interchange format.
- **HTTP**: Hypertext Transfer Protocol; foundation data protocol of the World Wide Web.
- **Middleware**: Functions in Express that have access to the request and response objects to execute code, perform checks, or modify headers.
- **Business Logic**: Domain-specific calculation rules that define how data is transformed, validated, and computed.
- **Responsive Design**: Web design approach that ensures layouts render well across all device viewports.
- **Git**: A distributed version control system for tracking source code revisions.
- **GitHub**: A cloud-based platform for hosting and collaborating on Git repositories.

---

## 25. TOP 20 INTERVIEW QUESTIONS & ANSWERS

### Q1: Explain your project in brief.
> "I built the Project & Task Management System for Thinqloud Solutions. It is a business application designed to help cross-functional engineering teams track projects, assign tasks, manage deadlines, enforce task dependencies, monitor completion progress, and catch overdue activities. In Phase 1, I implemented a responsive, interview-ready frontend using React 19, Vite, and React Router DOM, with mock authentication, RBAC, and dynamic calculation utilities."

### Q2: What business problem does this application solve?
> "It eliminates scattered communication and delivery blind spots. By pairing clear task assignments and deadlines with task dependency tracking and automated overdue detection, it ensures team members know their priorities and managers can catch bottlenecks before they impact project delivery."

### Q3: Why did you choose React over plain JavaScript or other frameworks?
> "React's component-based model is ideal for building enterprise dashboards. It allows breaking complex interfaces into reusable UI components like buttons, modals, and KPI cards. React's virtual DOM delivers fast re-renders when filters or task statuses change, and the Context API offers straightforward global state management without external library overhead."

### Q4: Explain your Phase 1 frontend architecture.
> "The frontend uses a clean layered architecture: React Router handles URL routing, wrapped in a ProtectedRoute component for RBAC checks. Pages orchestrate features by combining reusable atomic UI components. Global state is managed via Context API (`AuthContext` and `ProjectContext`). Crucially, derived metrics—like project progress and overdue counts—are calculated dynamically using pure utility functions rather than being hardcoded."

### Q5: How do you calculate project progress?
> "Project progress is calculated dynamically using the formula: completed tasks in project divided by total tasks in project multiplied by 100. This logic lives in `src/utils/taskUtils.js` within `calculateProjectProgress()`. When any task status changes to `Completed`, the project progress bar automatically recalculates across all project cards and detail views."

### Q6: How does the application identify overdue tasks?
> "Overdue detection is dynamic. In `isTaskOverdue()`, the function compares today's date against the task's due date. If today's date is greater than the due date AND the task status is not `Completed`, the task is flagged as overdue. The utility `getDaysOverdue()` then calculates the exact difference in days. If a task is marked `Completed`, it is never treated as overdue."

### Q7: How do task dependencies work in your system?
> "A task dependency represents a prerequisite relationship. For example, 'Frontend Integration' depends on 'Backend API Development'. On the Task Details page, the application visualizes both 'Blocked By' (tasks that must finish first) and 'Depends On' (downstream tasks waiting for this one). When creating or editing a task, validation rules guarantee that a task cannot depend on itself and dependencies must belong to the same project."

### Q8: How does authentication currently work in Phase 1?
> "Phase 1 implements mock authentication using `AuthContext`. It supports demo credentials for three roles: Admin, Project Manager, and Team Member, with convenient one-click demo logins. The session persists in `localStorage`. Route guards in `ProtectedRoute` ensure that unauthenticated users cannot access private application views."

### Q9: Why did you use mock data instead of building the backend immediately?
> "Separating development into phases is standard industry practice. Building the frontend with mock data in Phase 1 allows refining user workflows, role permissions, UI/UX aesthetics, and business validation without backend bottlenecks. It establishes clear data contracts that define exactly what REST endpoints and Mongoose models are needed in Phase 2."

### Q10: How will MongoDB be integrated in Phase 2?
> "The mock data structures in `mockProjects.js` and `mockTasks.js` mirror Mongoose schemas. In Phase 2, we will create Mongoose models with references—such as `projectId` referencing the Project model and `assigneeId` referencing the User model. `apiService.js` will swap local storage calls for Axios HTTP requests connected to Express controllers backed by MongoDB Atlas."

### Q11: What is the Context API and why did you use it?
> "Context API is React's built-in state management system. I used it to avoid prop drilling across deeply nested components. `AuthContext` provides the authenticated user and RBAC helpers to headers, sidebars, and route guards. `ProjectContext` maintains the project and task store so actions like creating a task update the dashboard, project details, and task directory simultaneously."

### Q12: Why are reusable components important in your codebase?
> "I built 16 common components in `src/components/common/` (Buttons, Modals, Badges, SearchBars, ProgressBars). This ensures visual and behavioral consistency across the application, simplifies maintenance by centralizing style tokens, and speeds up feature development."

### Q13: What is Role-Based Access Control (RBAC) and how is it implemented?
> "RBAC restricts system operations based on a user's role. In Phase 1, `AuthContext` provides helper flags like `isAdmin`, `isProjectManager`, and `isTeamMember`. For example, only Admins and Project Managers see 'Create Project' and 'Create Task' action buttons, while Team Members have a dedicated 'My Tasks' view focused on their personal assignments."

### Q14: How will JWT authentication work in Phase 2?
> "When a user logs in, the Express server will verify credentials against bcrypt password hashes in MongoDB. Upon verification, the server signs a JSON Web Token containing the user's ID and role, returning it in a secure `httpOnly` cookie. Subsequent requests will send this token to authenticate the user via Express middleware."

### Q15: What form validations have you implemented?
> "Using `src/utils/validators.js`, login requires valid email formatting and minimum password length. Project forms require a name, description, manager, and valid dates where due date cannot be earlier than start date. Task forms require title, project, assignee, priority, valid due date, progress bounded between 0–100%, and self-dependency prevention."

### Q16: How did you ensure the application is responsive?
> "I used an off-canvas drawer navigation for tablet and mobile devices (`<= 900px`) with a hamburger menu toggle. Data tables are enclosed in scrollable containers to prevent page overflow. Card grids use CSS Grid with `auto-fill` and `minmax` to adjust column counts dynamically from 4 columns on desktop down to 1 column on mobile."

### Q17: What was the most critical business logic to implement?
> "The overdue detection and project progress calculation engines. Ensuring these metrics update dynamically based on live dates and task statuses—rather than static mock values—makes the system realistic and prepared for real-time backend updates."

### Q18: What happens if an API call fails or a route doesn't exist?
> "I built comprehensive UI feedback states: `ErrorMessage` displays an error banner with a retry callback; `EmptyState` guides users when no search results match; `NotFoundPage` handles invalid 404 URLs; and `UnauthorizedPage` informs users when their role lacks permission for a requested view."

### Q19: Why divide the project into Phase 1 and Phase 2?
> "Phased delivery reduces project risk. Phase 1 focuses on design, responsive UX, routing, and business logic validation. Phase 2 introduces the backend server, database schemas, and cryptographic security. Phase 3 can then add live collaboration via Socket.IO."

### Q20: What will change in the frontend code when transitioning to Phase 2?
> "Very little UI code will change. The presentation components and pages will remain intact. The only layer being modified is `services/apiService.js`, where mock promises will be replaced with Axios REST calls (`axios.get`, `axios.post`) pointing to our Express server endpoints."

---

## 26. 2-MINUTE PROJECT ELEVATOR PITCH (PHASE 3 UPDATED)

*(Practice speaking this aloud for your interview introduction)*:

> "Hello! I built the **Project & Task Management System** for the Thinqloud Solutions recruitment drive. 
>
> The business problem this system addresses is delivery friction and lack of visibility in technical teams—unclear task ownership, invisible blockers, unmonitored deadlines, and scattered communication across informal channels.
>
> To solve this, I designed a multi-role enterprise platform tailored for three organizational roles: **Admins**, **Project Managers**, and **Team Members**.
>
> Across **Phases 1, 2, and 3**, we have delivered:
> 1. A responsive **React 19 frontend** built with **Vite, React Router DOM, and custom CSS design tokens**, featuring executive KPIs, project completion meters, prerequisite task dependency tracking, and real-time overdue alerts computed on the fly.
> 2. A production-grade **MERN backend foundation** built on **Node.js, Express, MongoDB, and Mongoose**.
> 3. An enterprise security layer featuring **real JWT authentication stored in secure HttpOnly cookies**, **bcrypt password hashing**, **server-side Role-Based Access Control (RBAC)**, **Helmet security headers**, **strict CORS**, **Zod request validation**, and **rate limiting**.
> 4. **Real database-backed Project Management (Phase 3)**: Projects, manager assignments, and team memberships are fully persisted in MongoDB using Mongoose document references (`ObjectId`), with **resource-level authorization**, collision-safe project code generation (`PRJ-XXXX`), search, filtering, pagination, and soft archive workflows.
>
> In accordance with our phase boundaries, **Users and Projects are 100% database-backed in MongoDB**, while individual Tasks and task progress remain managed via our reactive Phase 1 mock store in localStorage. This strict phase boundary allowed us to thoroughly isolate and test our backend data models without regressions.
>
> Our backend achieves 100% test coverage across 44 automated tests, the frontend compiles with zero ESLint warnings, and session integrity seamlessly survives full browser reloads."

---

## 27. STEP-BY-STEP INTERVIEW DEMO WALKTHROUGH (PHASE 3 UPDATED)

Follow this exact sequence when demonstrating the application to interviewers:

### Step 1: Start Services & Database
- **Action**: Show that MongoDB is running on port 27017, the Express backend server is running on `http://localhost:5000`, and Vite frontend dev server is running on `http://localhost:5173`.
- **What to say**: *"Here we have our full-stack architecture running. Our Express backend connects to a local MongoDB instance named `project_task_management`, and our Vite React client runs on port 5173."*

### Step 2: Login as Admin & Explain Authentication Flow
- **Action**: Navigate to `/login`. Click the **'Admin'** demo quick-fill button (`admin@thinqloud.com`), then click **'Sign In to Workspace'**.
- **What to say**: *"When I click login, the React frontend submits a POST request to `/api/auth/login`. Our Express validation middleware validates the request using Zod. The backend retrieves the user from MongoDB, verifies the password using `bcrypt.compare`, signs a JWT containing the user ID, and returns it inside an HttpOnly cookie with `SameSite: Lax`. The frontend AuthContext receives the sanitized user profile without exposing any token to JavaScript."*

### Step 3: Executive Dashboard with Live MongoDB Project Counts
- **Action**: Land on `/dashboard`. Highlight the 6 KPI cards across the top and project progress bars.
- **What to say**: *"Upon authentication, we land on the Executive Dashboard. Total Projects and Active Projects are now derived directly from our live MongoDB database. Notice that Task statistics remain based on mock tasks—this is an intentional phase boundary until Phase 4."*

### Step 4: Open Projects Portfolio & Create Real Project
- **Action**: Click **'Projects'** in the sidebar. Click **'Create Project'**. Select Project Lead: `Priya Sundaram (Project Manager)`. Toggle team members. Enter Title: `Automated DevOps Pipeline`. Click **'Create Project'**.
- **What to say**: *"When I submit this form, React dispatches a POST request to `/api/projects`. The backend validates the inputs with Zod, ensures the manager is an active Admin or PM, deduplicates team members, automatically generates a unique collision-safe project code (`PRJ-0006`), and stores the document in MongoDB. The new project appears in the UI instantly without page reload."*

### Step 5: Open Project Detail & Show Real MongoDB Relationships
- **Action**: Click on the newly created project to open its Project Detail page.
- **What to say**: *"In Project Details, notice the Project Lead and Team Members. These are not static strings—they are populated Mongoose document references linking `Project.manager` and `Project.members` to real User ObjectIds in MongoDB."*

### Step 6: Browser Refresh to Demonstrate MongoDB Persistence
- **Action**: Press `Ctrl + R` (or `F5`) in the browser to trigger a full page reload.
- **What to say**: *"When I refresh the page, the user session restores automatically via `/api/auth/me`, and the project data reloads directly from MongoDB via `GET /api/projects/:id`. The project and its team assignments are permanently persisted in the database."*

### Step 7: Edit Project, Change Manager, and Archive
- **Action**: Click **'Edit Project'**. Change description or status to `Active`. Show that Admin can also reassign the project manager via `PATCH /api/projects/:id/manager`.
- **What to say**: *"Administrators can update project configuration or reassign the project manager. If we archive the project, it executes a soft deletion via `PATCH /api/projects/:id/archive`, setting `archivedAt` timestamp rather than permanently destroying records."*

### Step 8: Search, Filter & Pagination
- **Action**: Go back to `/projects`. Type `DevOps` in the search bar. Filter by status `Active`.
- **What to say**: *"The project registry supports multi-criteria search and status filtering backed by backend queries with regex escaping and pagination support."*

### Step 9: Login as Project Manager & Show Resource-Level Authorization
- **Action**: Log out and log in as `pm@thinqloud.com` (`Priya Sundaram`). Open `/projects`.
- **What to say**: *"Now I'm logged in as Priya, a Project Manager. Priya can view and edit projects she manages or belongs to. If Priya attempts to modify an unrelated project directly via API, our backend service rejects the request with HTTP `403 Forbidden`. This is resource-level authorization enforced on the server."*

### Step 10: Login as Team Member & Show Restricted Actions
- **Action**: Log out and log in as `dev@thinqloud.com` (`Sakshi Sharma`). Open `/projects`.
- **What to say**: *"Now logged in as Sakshi, an engineer with role `TEAM_MEMBER`. Notice the 'Create Project' and 'Edit Project' buttons are hidden. If Sakshi attempts to call `POST /api/projects` via Postman, our backend immediately returns `403 Forbidden`."*

### Step 11: Explain Why Tasks Remain Mock & Phase 4 Strategy
- **Action**: Open `/tasks`. Show task dependency views and overdue warnings.
- **What to say**: *"Notice that Tasks, Dependencies, and Overdue calculations continue to work smoothly. In Phase 3, we strictly migrated Project and Team management to MongoDB. In Phase 4, we will create the Mongoose Task model, link tasks to `Project._id` and `User._id`, and make task progress and dependencies fully database-backed."*

---

## 28. PHASE 2: BACKEND ARCHITECTURE & SECURITY CONCEPTS

### Core Technologies
- **Node.js**: Asynchronous, event-driven JavaScript runtime executing server-side code without blocking I/O.
- **Express.js**: Fast, minimalist web framework providing routing, middleware pipelines, and HTTP request/response abstractions.
- **MongoDB**: Document-oriented NoSQL database storing JSON-like BSON documents with flexible schemas.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB providing schema validation, type casting, middleware hooks, and query builders.
- **bcrypt / bcryptjs**: Cryptographic password hashing library employing adaptive salting and key derivation (Blowfish cipher) to defend against rainbow table and brute-force attacks.
- **JSON Web Token (JWT)**: Compact, URL-safe standard (RFC 7519) for transmitting cryptographically signed identity claims between client and server.
- **HttpOnly Cookies**: Browser cookies inaccessible via JavaScript `document.cookie`, offering superior defense against Cross-Site Scripting (XSS) token theft.
- **CORS (Cross-Origin Resource Sharing)**: Browser security standard configured on Express to permit requests only from authorized origins (`http://localhost:5173`) with credentials enabled.
- **Helmet**: Express middleware setting secure HTTP response headers (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security).
- **Rate Limiting (`express-rate-limit`)**: Middleware regulating incoming request frequency per IP address to safeguard auth endpoints from denial-of-service and credential stuffing.

### Layered Architecture Responsibilities
```
Client Request
      │
      ▼
Routes (Routing URLs & HTTP Verbs)
      │
      ▼
Middleware (CORS, RateLimit, BodyParser, Auth, RBAC, Zod Validation)
      │
      ▼
Controllers (Extract req data, invoke service, send status & JSON response)
      │
      ▼
Services (Business logic, duplicate checks, password hashing, token generation)
      │
      ▼
Repositories (Direct Mongoose queries: findById, create, updateOne)
      │
      ▼
Models (Mongoose schema definitions, field validations, indexes, toJSON transforms)
      │
      ▼
MongoDB (Database storage)
```

### Complete Authentication Request Lifecycle

```
1. React Login Component: User inputs email and password, clicks "Sign In".
2. apiService: Dispatches POST request to /api/auth/login with credentials: 'include'.
3. Express Route: /api/auth mounts auth.routes.js.
4. Validation Middleware: validateBody(loginSchema) verifies email syntax and password presence via Zod.
5. Auth Controller: authController.login receives validated payload and invokes authService.login.
6. Auth Service: Calls userRepository.findByEmailWithPassword(email) to fetch the user document.
7. MongoDB: Performs indexed query on `email`.
8. bcrypt Verification: passwordUtils.comparePassword compares plain-text attempt with stored hash.
9. Account Check: Verifies user exists and status === 'ACTIVE'.
10. JWT Generation: jwtUtils.generateToken(user._id) signs { userId } using JWT_SECRET and expiration.
11. HttpOnly Cookie: Controller attaches cookie `token` with httpOnly: true, sameSite: 'lax', secure: in production.
12. Response: Express returns HTTP 200 with sanitized user object (password excluded).
13. React AuthContext: Updates currentUser in memory and redirects to /dashboard.
```

### Protected Request & Server-Side RBAC Lifecycle
```
1. Browser: Requests GET /api/users; browser automatically sends HttpOnly `token` cookie.
2. authenticate Middleware:
   - Reads req.cookies.token.
   - Verifies cryptographic signature via jwt.verify().
   - Queries MongoDB for user by decoded userId.
   - Confirms user exists and status === 'ACTIVE'.
   - Attaches sanitized user document to req.user.
3. authorize('ADMIN') Middleware:
   - Compares req.user.role with allowed role ('ADMIN').
   - If role matches: calls next() to enter controller.
   - If role mismatches: throws ApiError.forbidden('Access denied. Required role: ADMIN').
4. Controller & Service: Executes user retrieval and sends formatted JSON response.
```

---

## 29. TOP 30 PHASE 2 BACKEND & ARCHITECTURE INTERVIEW QUESTIONS & ANSWERS

### Q1: Explain your complete application architecture.
> "We follow a decoupled MERN stack architecture. The frontend is a React 19 SPA built with Vite and pure CSS tokens. The backend is an Express REST API structured into Routes, Middleware, Controllers, Services, and Repositories. MongoDB stores documents via Mongoose schemas. Authentication uses cryptographically signed JWTs stored in HttpOnly cookies, and authorization is enforced on the server via RBAC middleware."

### Q2: How does authentication work in your application?
> "A user posts credentials to `/api/auth/login`. Zod validates inputs, the user is fetched from MongoDB, and `bcrypt.compare` verifies the password against the stored hash. Upon verification, the backend generates a JWT containing the user's ID and transmits it as an HttpOnly cookie with `SameSite: Lax`. The client stores only safe user metadata in React context."

### Q3: What is a JWT?
> "A JSON Web Token is an open standard (RFC 7519) that defines a compact, self-contained way to securely transmit information between parties as a JSON object. It consists of three base64url-encoded parts separated by dots: Header (algorithm & token type), Payload (claims like user ID and expiration), and Signature (verifies integrity)."

### Q4: Why did you use JWT instead of stateful sessions?
> "JWTs are stateless and self-contained. The server does not need to query a session store like Redis on every single request just to confirm token existence; it verifies the cryptographic signature using the secret key. This reduces database overhead and makes the API horizontally scalable across multi-server environments."

### Q5: Where is your JWT stored?
> "The JWT is stored exclusively in an `HttpOnly` browser cookie set by the server response header `Set-Cookie`. It is never stored in React state, localStorage, or sessionStorage."

### Q6: Why not store JWT in localStorage?
> "`localStorage` is accessible to any JavaScript running on the origin via `window.localStorage`. If the application suffers from any Cross-Site Scripting (XSS) vulnerability or a compromised third-party npm package, malicious scripts can steal the token immediately. Storing tokens in `HttpOnly` cookies eliminates JavaScript accessibility."

### Q7: What is an HttpOnly cookie?
> "An HttpOnly cookie is a cookie configured with the `HttpOnly` directive in the `Set-Cookie` header. Browsers forbid client-side scripts from reading or manipulating this cookie through `document.cookie`. The browser automatically includes the cookie in subsequent HTTP requests to the origin."

### Q8: What is bcrypt?
> "bcrypt is an adaptive cryptographic key derivation and password hashing function based on the Blowfish cipher. It incorporates a salt to protect against rainbow table attacks and an adjustable work factor (salt rounds) to slow down brute-force attacks as hardware speeds increase."

### Q9: What is the difference between hashing and encryption?
> "Hashing is a one-way mathematical function that transforms input into a fixed-length string and cannot be reversed. Encryption is a two-way function where data is transformed using a key and can be decrypted back into plain text using the corresponding private/secret key. Passwords must always be hashed, never encrypted."

### Q10: How are passwords stored in your database?
> "Passwords are never stored in plain text. When an Admin creates a user or seed data runs, the password is processed through `bcrypt.hash(password, 10)` before writing to MongoDB. In our Mongoose User model, `select: false` ensures the hash is excluded by default from queries, and `toJSON` removes it during serialization."

### Q11: What is the difference between authentication and authorization?
> "Authentication verifies **who you are** (identity verification via email and password leading to a JWT). Authorization verifies **what you are allowed to do** (permission check ensuring an Admin can create users, while a Team Member is restricted)."

### Q12: What is RBAC?
> "Role-Based Access Control is an authorization mechanism where access rights are assigned to roles rather than individual users. Users are assigned roles (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`), and endpoints require specific roles to execute operations."

### Q13: Why must RBAC exist on the backend?
> "Frontend RBAC—such as hiding buttons or using `ProtectedRoute`—is solely user experience (UX) to guide navigation. Any technical user can inspect network traffic, alter React state in DevTools, or send raw curl requests directly to the API. The backend is the true security boundary; without server-side RBAC, unauthorized users could manipulate database records directly."

### Q14: What is middleware in Express?
> "Middleware functions have access to the request object (`req`), response object (`res`), and the `next` function in the application's request-response cycle. They perform tasks such as logging, parsing bodies, verifying tokens, enforcing RBAC, and passing control to the next handler or terminating the request."

### Q15: What is Express?
> "Express is a minimalist, flexible Node.js web application framework that provides a robust suite of features for building web and mobile applications, including routing, middleware integration, template rendering, and HTTP helpers."

### Q16: What is Mongoose?
> "Mongoose is an Object Data Modeling (ODM) library for MongoDB in Node.js. It manages relationships between data, provides schema validation, implements middleware hooks, and translates between objects in code and representations in MongoDB."

### Q17: Why use MongoDB for this application?
> "MongoDB offers a flexible JSON/BSON document model that mirrors JavaScript objects cleanly. As project tasks evolve with nested attributes (checklists, dynamic dependency arrays, flexible metadata), MongoDB's schema flexibility accommodates iterative schema changes without expensive relational table migrations."

### Q18: What is CORS and how did you configure it?
> "Cross-Origin Resource Sharing is a browser security mechanism that blocks web pages from making requests to a different domain/port than the one that served the page. We configured the `cors` middleware to explicitly allow `http://localhost:5173` with `credentials: true`. We avoid `origin: '*'` because browsers reject credentialed cookie requests with wildcard origins."

### Q19: What does Helmet do?
> "Helmet secures Express apps by setting various HTTP response headers such as `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` (mitigating clickjacking), and `Strict-Transport-Security` (forcing HTTPS)."

### Q20: What is rate limiting?
> "Rate limiting restricts the number of requests a client IP can make to an API within a specified timeframe. We applied `express-rate-limit` with a strict window (10 requests per 15 minutes) on authentication endpoints to defend against automated brute-force attacks and credential stuffing."

### Q21: What happens when a JWT expires?
> "When the token expires (`1d`), `jwt.verify()` throws a `TokenExpiredError`. Our `authenticate` middleware catches this and throws an `ApiError.unauthorized('Token expired')` with status code 401. The frontend receives 401, resets `currentUser`, and redirects the user to `/login`."

### Q22: How is session restored after a browser refresh?
> "On initial load, React's `AuthContext` runs an effect that calls `GET /api/auth/me` with `credentials: 'include'`. The browser automatically includes the HttpOnly `token` cookie. Express verifies the token, loads the user from MongoDB, and returns safe user data, restoring the session seamlessly without storing tokens in localStorage."

### Q23: What happens if someone changes their role in frontend DevTools?
> "Nothing malicious happens. While they might visually reveal an Admin button in React, clicking it sends a request to the backend. The backend `authenticate` middleware reconstructs the real user identity and role from the signed JWT and database, and `authorize('ADMIN')` immediately rejects their request with `403 Forbidden`."

### Q24: Why use controllers, services, and repositories?
> "This 3-tier separation of concerns improves maintainability and testability:
> - **Controllers**: Handle HTTP protocol concerns (headers, cookies, status codes).
> - **Services**: Contain pure business logic and validation rules independent of transport protocol.
> - **Repositories**: Encapsulate Mongoose database queries. If we migrate from MongoDB to PostgreSQL later, only repositories change while business services remain untouched."

### Q25: How do you handle backend errors?
> "We implement centralized error handling using a custom `ApiError` class and an `asyncHandler` wrapper around route handlers to catch rejections without try/catch boilerplate. A global error middleware intercepts errors, maps Mongoose/Zod codes into standardized JSON `{ success: false, message, errors }`, and hides stack traces in production."

### Q26: What is the difference between HTTP 401 and 403?
> "- **401 Unauthorized**: The client is unauthenticated (missing, invalid, or expired JWT). The identity is unknown.
> - **403 Forbidden**: The client is authenticated, but their role or identity lacks permission to access the requested resource."

### Q27: Why use environment variables?
> "Environment variables keep sensitive secrets (database passwords, JWT secret keys, API credentials) and environment-specific configs (ports, client URLs) out of source control. We validate required variables at startup via `src/config/env.js` and fail fast if keys are missing."

### Q28: How do you prevent duplicate users?
> "We apply two defense layers: first, the service layer runs an explicit pre-check query `userRepository.findByEmail(email)` and throws an `ApiError.conflict('Email already registered')` (HTTP 409); second, the Mongoose schema defines a `unique: true` index on `email`, and our global error handler catches MongoDB error code 11000."

### Q29: How do you validate API requests?
> "We use **Zod** schema validation through reusable middleware (`validateBody`, `validateParams`). Incoming request payloads are validated against strict type, length, regex, and enum rules before reaching controllers. If invalid, a standardized `400 Bad Request` with detailed field error messages is returned immediately."

### Q30: How will Projects connect to Users in Phase 3?
> "In Phase 3, we defined the Mongoose `Project` schema where `manager` references a single `User` ObjectId, `members` references an array of `User` ObjectIds, and `createdBy` stores the creator user ID. When querying projects, Mongoose `populate()` joins user details (`_id name email role avatar department`) dynamically without storing redundant user snapshots."

---

## 30. PHASE 3: PROJECT & TEAM MANAGEMENT CORE CONCEPTS

### Document Relationships in MongoDB
- **MongoDB ObjectId**: A 12-byte (24-character hexadecimal) BSON primary key composed of a 4-byte timestamp, 5-byte random value, and 3-byte incrementing counter, ensuring global uniqueness across clusters.
- **Document Reference**: Storing another document's `_id` inside a field rather than nesting the full object. Acts as a foreign key in NoSQL.
- **Why Reference User Instead of Duplicating**: If user names, roles, or avatars change, updating a single user document immediately reflects across all projects. Duplicating user data creates data anomalies and synchronization complexity.
- **Mongoose `populate()`**: An abstraction that automatically executes a secondary query behind the scenes to replace specified reference `ObjectId` fields with the actual referenced documents from another collection.
- **Embedded vs Referenced Documents**:
  - *Embedded*: Sub-documents nested directly within a parent document. Ideal for tightly bound, 1-to-few data that is always read together and doesn't exist independently (e.g., project address or milestone checklist).
  - *Referenced*: Separate collections linked via `ObjectId`. Essential for 1-to-many and many-to-many relationships where entities have independent lifecycles (e.g., Users, Projects, Tasks).
- **One-to-Many Relationship (Manager to Projects)**: A single User can manage multiple Projects (`Project.manager -> User._id`).
- **Many-to-Many Relationship (Members to Projects)**: A Project has many assigned Users, and a User can be a member of multiple Projects (`Project.members[] -> [User._id]`).

### Architectural Patterns
- **Repository Pattern**: Encapsulates data access and query building (`Project.find()`, `findByIdAndUpdate()`). Decouples business rules from the underlying database driver or ODM.
- **Service Layer**: Houses the core domain and business logic (e.g., role checks, manager validation, date rules, unique code generation). Does not handle HTTP request/response objects.
- **Controller Layer**: Accepts HTTP requests, parses and delegates to services, and formats standard JSON responses with status codes.
- **Thin Controllers**: Keeping controllers minimal (5–10 lines per handler) ensures application workflows can be unit tested without mocking HTTP request/response pipelines.
- **Business Logic vs Validation**:
  - *Validation (Zod)*: Structural format and syntax checks (is `startDate` an ISO date? Is `manager` a 24-char hex string? Is `startDate <= dueDate`?).
  - *Business Logic (Service)*: Domain rules (does the manager exist in MongoDB? Is their status `ACTIVE`? Do they possess the `ADMIN` or `PROJECT_MANAGER` role? Is the project already archived?).

### Query & Data Lifecycle
- **Pagination**: Splitting large query result sets into smaller pages using `skip = (page - 1) * limit` and `limit = N`. Prevents memory exhaustion and reduces network payloads.
- **Search & Filtering**: Query parameters (`search`, `status`, `priority`) dynamically construct MongoDB filter queries. String search values are regex-escaped to prevent ReDoS (Regular Expression Denial of Service).
- **Archive vs Delete (Soft Deletion)**: Hard deletion (`deleteMany`/`deleteOne`) permanently destroys historical records and causes orphan reference errors in downstream data. Soft archiving sets `status = 'ARCHIVED'` and stores an `archivedAt` timestamp, preserving audit trails while excluding archived records from active views.
- **MongoDB Indexes**: Data structures (B-trees) that store a small portion of the collection's data set in an easily traversable form. Indexes on `code`, `status`, `manager`, and `members` drastically improve search and filter speeds from $O(N)$ collection scans to $O(\log N)$ index lookups.
- **Unique Project Codes**: Human-readable identifiers (`PRJ-0001`, `PRJ-0002`) generated by incrementing the highest existing numerical suffix with a MongoDB `unique` index constraint to guarantee collision safety.
- **Resource-Level Authorization**: While Role-Based Access Control checks user type globally, resource-level authorization verifies whether a specific user has permission on a specific entity instance (e.g., checking `project.manager.equals(user._id)` before allowing updates).

---

## 31. TOP 25 PHASE 3 INTERVIEW QUESTIONS & ANSWERS

### Q1: How is a Project stored in MongoDB?
> "A Project is stored as a document in the `projects` collection via Mongoose. It contains project metadata (`name`, `description`, `category`, `budget`, `status`, `priority`, `startDate`, `dueDate`), a unique indexed `code` (`PRJ-XXXX`), an `archivedAt` timestamp, and `ObjectId` references to the `users` collection for `manager`, `members`, and `createdBy`."

### Q2: How do Projects relate to Users in your database?
> "We implement two distinct relationships:
> 1. A **1-to-many** relationship where `Project.manager` holds a single `User` ObjectId referencing the designated project lead.
> 2. A **many-to-many** relationship where `Project.members` stores an array of `User` ObjectIds representing assigned team members."

### Q3: Why use ObjectId references instead of embedding user data in Project?
> "Users are shared, independent entities across the organization. If we embedded user snapshots (name, email, avatar) in every project document, updating a user's profile would require updating multiple project documents. References maintain a single source of truth and guarantee referential consistency."

### Q4: What does Mongoose `populate()` do behind the scenes?
> "`populate()` performs automated document joins. When querying `Project.findById(id).populate('manager')`, Mongoose inspects the `ref: 'User'` schema declaration, executes a secondary `User.find({ _id: { $in: [...] } })` query, and substitutes the raw ObjectId with the resolved User document."

### Q5: Why not duplicate user data inside Project documents?
> "Duplication introduces data redundancy and update anomalies. If user Vikram changes his email or avatar, any project document with duplicated data becomes stale. Referencing user IDs ensures that whenever projects are fetched, `populate()` retrieves fresh, synchronized user data."

### Q6: How do you prevent duplicate members in a project?
> "We enforce deduplication at two levels: in the service layer when creating a project, member IDs are converted into a `Set` before saving. When adding a member via `POST /api/projects/:id/members`, the service checks `project.members.includes(userId)` and throws an `ApiError.conflict('User is already a member')` (HTTP 409)."

### Q7: How do you verify that a manager exists and is valid?
> "Before persisting a project, `projectService` queries `userRepository.findById(managerId)`. It verifies three conditions: first, the user exists in MongoDB; second, their `status === 'ACTIVE'`; third, their role is either `ADMIN` or `PROJECT_MANAGER`. If any check fails, it throws an `ApiError.badRequest()` (HTTP 400)."

### Q8: How do you prevent Team Members from creating projects?
> "We enforce server-side RBAC in `projectService.createProject`: if `user.role === 'TEAM_MEMBER'`, the service throws an `ApiError.forbidden('Team members are not permitted to create projects')` (HTTP 403). Frontend button hiding is purely for user experience."

### Q9: How does Project Manager authorization work?
> "Project Managers can only update, archive, or manage members of projects they personally lead (`project.manager.equals(user._id)`). When listing projects, Project Managers only see projects they manage or are members of (`$or: [{ manager: user._id }, { members: user._id }]`)."

### Q10: What is the difference between role-based and resource-based authorization?
> "- **Role-based authorization (RBAC)**: Checks permissions based solely on user role (e.g., only `ADMIN` can access user management).
> - **Resource-based authorization**: Checks permissions against the specific record being operated on (e.g., PM Priya can update Project Alpha because she is its manager, but cannot update Project Beta managed by Rajesh)."

### Q11: How do you generate unique project codes?
> "We use an atomic suffix generator: `projectRepository.findHighestCodeNumber()` searches for the highest existing `PRJ-(\d+)` pattern using indexed regex, increments the counter, and pads it to 4 digits (`PRJ-0001`, `PRJ-0002`). A database-level `unique: true` index on `code` guarantees collision safety."

### Q12: Why archive projects instead of deleting them?
> "Hard deleting projects destroys audit history and breaks relational integrity with tasks, activities, and logs. Archiving sets `status = 'ARCHIVED'` and records `archivedAt = new Date()`. The project is hidden from default listings but remains accessible for audits or restoration."

### Q13: How does project search work?
> "The client sends a query parameter `GET /api/projects?search=devops`. In `projectService`, the search term is escaped against special regex characters to prevent ReDoS, and matched case-insensitively against `name` and `code` using `{ $or: [{ name: { $regex: escaped, $options: 'i' } }, { code: { $regex: escaped, $options: 'i' } }] }`."

### Q14: How does pagination work?
> "The client requests `page` and `limit`. The repository calculates `skip = (page - 1) * limit` and passes it to Mongoose `.skip(skip).limit(limit)`. In parallel, `countDocuments(filter)` counts total matching records, returning metadata: `{ page, limit, total, pages }`."

### Q15: Why is pagination important for enterprise APIs?
> "Without pagination, a query on thousands of projects transfers megabytes of JSON over the network, spikes Node.js event-loop memory, and slows down database query execution. Pagination guarantees predictable, sub-100ms response times and constant memory footprints."

### Q16: What is a database index?
> "An index is a specialized data structure (typically a B-tree in MongoDB) that stores a sorted copy of specific document fields alongside pointers to the full document. It allows the database engine to find matching documents in $O(\log N)$ time rather than performing an expensive $O(N)$ full collection scan."

### Q17: What is a unique index?
> "A unique index ensures that indexed fields do not store duplicate values across documents. In our Project model, `code: { type: String, unique: true, index: true }` enforces uniqueness at the database engine level, rejecting duplicate code insertions with error code 11000."

### Q18: What is the difference between a controller and a service?
> "- **Controller**: Translates HTTP requests (extracts `req.body`, `req.params`, `req.cookies`), calls service methods, and sends HTTP status codes and JSON.
> - **Service**: Houses business rules, cross-entity validations, database queries, and role checks independent of transport protocols."

### Q19: What is the difference between a service and a repository?
> "- **Service**: Contains business logic and orchestrates workflows across multiple models (e.g., verifying user status before creating a project).
> - **Repository**: Encapsulates direct database queries (e.g., `Project.findById()`, `Project.create()`). This allows switching databases without rewriting business logic."

### Q20: Why keep controllers thin?
> "Thin controllers contain zero business logic. This makes the code modular, prevents duplicate code across routes, and allows developers to test business logic through service unit tests without needing mock Express request/response objects."

### Q21: How do you validate MongoDB IDs before database lookup?
> "We use **Zod** schema validation: `z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')`. If a client sends a malformed ID like `/api/projects/abc123`, Zod intercepts the request and returns `400 Bad Request` before Mongoose attempts a CastError."

### Q22: What happens if an inactive user is assigned to a project?
> "The service validates each assigned member and manager: if `user.status !== 'ACTIVE'`, the API immediately rejects the request with HTTP `400 Bad Request` and message `'Cannot add an inactive user to the project'`, preventing orphaned workloads."

### Q23: How do you prevent invalid project date ranges?
> "We implement date validation at two boundaries: Zod verifies `startDate` and `dueDate` are parseable ISO strings and enforces `startDate <= dueDate` using `.refine()`. The service layer re-verifies this rule during project updates."

### Q24: Why are Tasks still mock in Phase 3?
> "We follow strict phase boundaries. Migrating both Projects and Tasks simultaneously introduces high regression risks with relational joins, progress calculations, and dependency DAG algorithms. Phase 3 isolated and verified Project and Team persistence. Phase 4 will migrate Tasks cleanly."

### Q25: Explain the end-to-end Phase 3 architecture.
> "A user interacts with React Project components. `apiService.js` sends credentialed requests to Express routes. `authenticate` verifies the JWT HttpOnly cookie, Zod validates the payload, and `projectService` enforces RBAC and manager/member rules. `projectRepository` executes Mongoose queries with `.populate()` on MongoDB. Sanitized project JSON is returned to `ProjectContext`, updating the UI instantly."

---

## 20. PHASE 4 — DATABASE-BACKED TASK MANAGEMENT ENGINE & DEPENDENCIES

### Overview
In Phase 4, the Project & Task Management System completed its core database migration. All mock and `localStorage` task storage was retired. Tasks, task dependencies, priority rankings, assignment workflows, deadline monitoring, blocked state derivation, and dynamic project progress calculation are now 100% database-backed in MongoDB.

### Core Business Entities: All Database-Backed
1. **Users** (Phase 2): Stored in `users` collection in MongoDB. Handled via bcrypt password hashing, JWT HttpOnly authentication cookies, and role classification (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`).
2. **Projects** (Phase 3): Stored in `projects` collection in MongoDB. Linked to manager (`ref: User`), members (`[ref: User]`), and creator (`ref: User`).
3. **Tasks** (Phase 4): Stored in `tasks` collection in MongoDB. Linked to project (`ref: Project`), assignee (`ref: User`), creator (`ref: User`), and dependencies (`[ref: Task]`).

---

### The Updated 2-Minute Elevator Pitch (Post-Phase 4)

> *"The Project & Task Management System is a full-stack, enterprise-grade engineering management platform built with the MERN stack (MongoDB, Express, React, Node.js). It provides end-to-end project planning, task delegation, dependency tracking, and automated deadline risk escalation.*
>
> *In Phase 2, we built secure JWT HttpOnly cookie authentication and user RBAC. In Phase 3, we migrated Projects to MongoDB with manager delegation and collision-safe project codes. In Phase 4, we replaced mock tasks with a database-backed Task Management Engine.*
>
> *All core entities—Users, Projects, and Tasks—are fully persisted in MongoDB. Tasks support priority classification, deadlines, assignee verification against project members, and a directed acyclic graph (DAG) dependency engine with iterative DFS cycle detection. The system dynamically derives blocked and overdue states, recalculates project progress in real time as the average of task progress, and strictly enforces resource-level authorization across Admins, Project Managers, and Team Members with 100% automated test coverage."*

---

### Phase 4 Interview Demonstration Flow

When demonstrating Phase 4 to an interview panel, walk through this live execution script:

1. **Step 1: Admin / PM Authentication**:
   - Log in as Project Manager Priya (`pm@thinqloud.com`).
   - Show session restoration via HttpOnly JWT cookie.
2. **Step 2: Project & Task Creation**:
   - Open *Enterprise Cloud Migration*.
   - Click **Create Task** to open `TaskModal`.
   - Show that Assignee dropdown is dynamically restricted to project members (e.g. Sakshi, Amit).
   - Enter title, priority (`High`), due date, and save.
   - Refresh page to demonstrate persistent MongoDB storage.
3. **Step 3: Dependency Configuration**:
   - Open *Microservices Deployment*.
   - Add dependency on *Provision EKS Kubernetes Cluster Infrastructure*.
   - Explain terminology: *Microservices Deployment* **depends on** *Kubernetes Cluster*; *Kubernetes Cluster* **blocks** *Microservices Deployment*.
4. **Step 4: Blocked State & Blocked Completion Prevention**:
   - Show that *Microservices Deployment* displays `Blocked` with prerequisite badge.
   - Attempt to mark the blocked task as `Completed`.
   - Demonstrate server-side rejection with error message: *"Cannot complete task while blocking prerequisite dependencies remain incomplete"*.
5. **Step 5: Circular Dependency Rejection**:
   - Attempt to make *Provision EKS Cluster* depend on *Microservices Deployment*.
   - Show immediate HTTP 400 rejection: *"Circular dependency detected: a task cannot depend on a downstream dependent task"*.
   - Explain the iterative DFS cycle detection algorithm running on the backend.
6. **Step 6: Completion & Unblocking**:
   - Mark the prerequisite task (*Kubernetes Cluster*) as `Completed` (progress hits 100%, `completedAt` timestamp generated).
   - Show dependent task automatically transitioning from blocked to ready.
7. **Step 7: Dynamic Project Progress Recalculation**:
   - Show that project progress updates dynamically as $\frac{\sum \text{task.progress}}{N}$.
8. **Step 8: Role-Scoped Views (`My Tasks` & `Overdue`)**:
   - Navigate to `/tasks/my` to show personal task queue.
   - Navigate to `/overdue` to show past-due tasks with overdue day counters.
   - Log in as Team Member Sakshi (`dev@thinqloud.com`).
   - Demonstrate that Sakshi can update progress and status on her assigned task, but cannot reassign the task or modify unauthorized project fields.

---

### Phase 4 Interview Questions & Answers (30 High-Frequency Questions)

#### Q1: How is a Task stored in MongoDB?
> "A Task is stored as a document in the `tasks` collection using Mongoose schema modeling. It contains scalar fields (`title`, `description`, `priority`, `status`, `progress`, `startDate`, `dueDate`, `completedAt`) and relational `ObjectId` references (`project`, `assignee`, `createdBy`, and an array of `dependencies`)."

#### Q2: How does Task relate to Project?
> "Through a normalized one-to-many relationship: `Task.project` stores an `ObjectId` referencing the `Project` model. Every task must belong to an active, non-archived project. We index `{ project: 1 }` for sub-millisecond retrieval of project tasks."

#### Q3: How does Task relate to User?
> "A Task maintains two distinct user relationships:
> 1. `Task.assignee` (`ref: User`): The team member responsible for execution.
> 2. `Task.createdBy` (`ref: User`): The user who created the task (extracted securely from `req.user._id`)."

#### Q4: How are task dependencies represented in the database?
> "In `Task.dependencies`, stored as an array of `ObjectId` references pointing to other `Task` documents within the exact same project: `dependencies: [{ type: ObjectId, ref: 'Task' }]`."

#### Q5: What is a dependency graph?
> "A dependency graph is a directed graph $G = (V, E)$ where vertices ($V$) represent individual tasks and directed edges ($E$) represent prerequisite requirements. An edge $A \to B$ means Task A requires Task B to be finished before Task A can complete."

#### Q6: Why is the dependency graph directed?
> "Because dependencies are directional and asymmetric: if Frontend Integration depends on Backend API, Backend API does not depend on Frontend Integration. The direction of the edge determines execution sequence."

#### Q7: What is a circular dependency?
> "A circular dependency is a closed loop in a directed graph (e.g., $A \to B \to C \to A$). If Task A depends on Task B, Task B depends on Task C, and Task C depends on Task A, none of the tasks can ever start or complete, causing permanent project deadlock."

#### Q8: How do you detect cycles when a user adds a dependency?
> "Before saving a new dependency edge $A \to B$, we run an iterative Depth-First Search (DFS) starting from $B$. We traverse all outgoing dependency edges from $B$. If traversal ever visits $A$, a path $B \rightsquigarrow A$ already exists. Adding $A \to B$ would complete a cycle ($A \to B \rightsquigarrow A$). The service intercepts this and rejects with HTTP 400 Bad Request."

#### Q9: Why use DFS instead of BFS for cycle detection?
> "Both DFS and BFS have the same time complexity $O(V + E)$ on finite directed graphs. We chose iterative DFS because it uses a simple LIFO stack, checks deep dependency chains directly, and minimizes memory allocation without call stack recursion overhead in Node.js."

#### Q10: What happens if A depends on B and B depends on A?
> "When the user attempts to add $B \to A$ while $A \to B$ already exists, DFS traversal starting from $A$ immediately encounters $B$, identifies the cycle in 1 step, and aborts with HTTP 400: `'Circular dependency detected'`."

#### Q11: Can tasks depend on tasks from another project?
> "No. Cross-project dependencies are explicitly rejected by `taskService`. Prerequisite dependencies must belong to the exact same `projectId`. This prevents cascading deadlocks and maintains workspace encapsulation."

#### Q12: What makes a task logically blocked?
> "A task is logically blocked if it has at least one prerequisite task in `dependencies` whose `status !== 'COMPLETED'`. We expose this derived state as `isBlocked: true` and populate `blockingDependencies`."

#### Q13: Do you store `isBlocked` as a persistent boolean in MongoDB?
> "No, `isBlocked` is derived dynamically during query time and response serialization. Storing derived state in MongoDB risks data staleness: if Task B completes, Task A's stored boolean would be out of sync unless expensive cascading writes were executed across dependent documents."

#### Q14: What makes a task overdue?
> "A task is overdue when `current date > dueDate` and `status !== 'COMPLETED'`. This is dynamically computed during JSON serialization: `ret.isOverdue = !isCompleted && due && due < now;`."

#### Q15: Why isn't a completed late task considered currently overdue?
> "Because once a task reaches `COMPLETED`, its deadline risk has been resolved. Showing completed tasks on an active overdue alert screen causes false operational panic."

#### Q16: How do status and progress remain consistent?
> "The backend synchronizes status and progress symmetrically:
> 1. Setting `progress = 100` forces `status = 'COMPLETED'` and records `completedAt`.
> 2. Setting `status = 'COMPLETED'` forces `progress = 100` and records `completedAt`.
> 3. Moving away from `COMPLETED` to `IN_PROGRESS` or `TODO` clears `completedAt` to `null` and resets progress if it was still 100."

#### Q17: What is `completedAt`?
> "It is a timestamp (`Date`) recorded by Mongoose when a task transitions to `COMPLETED`. It provides auditable proof of when deliverables were actually completed."

#### Q18: What happens when a completed task is reopened?
> "`taskService` sets `completedAt = null`. If the client did not explicitly provide a lower progress value, progress is reset to `0%` so the task no longer claims completion."

#### Q19: How do you calculate project progress?
> "Project progress is calculated dynamically as the average progress of all tasks in the project:
> $$\text{Progress} = \text{round}\left( \frac{\sum \text{task.progress}}{N} \right)$$
> If a project has 0 tasks, progress is 0%."

#### Q20: Why calculate project progress from Tasks rather than manual manager input?
> "Manual progress entry is subjective and prone to manager bias or outdated estimates. Deriving progress directly from individual task completion percentages provides transparent, data-driven delivery metrics."

#### Q21: What happens if a project has zero tasks?
> "The repository returns `progress: 0%` and total tasks `0`. The formula handles division by zero safely by returning 0 when `tasks.length === 0`."

#### Q22: How does the `My Tasks` endpoint work?
> "`GET /api/tasks/my` calls `taskService.getMyTasks()`. It automatically scopes the query filter to `{ assignee: req.user._id }`. Team members only see tasks assigned to them, with full support for status/priority filtering, search, and pagination."

#### Q23: How is Team Member task access restricted?
> "We enforce resource-level authorization:
> - Team members can view tasks in projects they belong to.
> - Team members can only update `status` and `progress` on tasks assigned to them (`task.assignee.equals(user._id)`).
> - Attempts to modify `title`, `description`, `project`, or `assignee` by a team member are rejected with HTTP 403 Forbidden."

#### Q24: Can a Team Member reassign their task to someone else?
> "No. Task delegation and reassignment is restricted to Admins and the Project Manager who leads that project. If a Team Member attempts to pass `assignee` in the update payload, the service throws `403 Forbidden: Team members can only update status and progress`."

#### Q25: How do you prevent assigning tasks to invalid users?
> "`taskService.createTask` performs two validations on `assignee`:
> 1. Verifies the user exists in MongoDB and `user.status === 'ACTIVE'`.
> 2. Verifies the user is an assigned member of the project (`project.members.includes(assigneeId)` or is the project manager). Rejects with HTTP 400 Bad Request otherwise."

#### Q26: How do you prevent cross-project dependencies?
> "When adding a dependency, the service loads both tasks and compares `depTask.project.toString() !== task.project.toString()`. If they do not match, it immediately rejects with HTTP 400: `'Dependencies must belong to the exact same project'`."

#### Q27: How do task filters and search work?
> "The client passes query parameters (`project`, `assignee`, `status`, `priority`, `search`, `overdue`, `page`, `limit`). The service escapes the search string against ReDoS and applies MongoDB filter criteria: `$or: [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }]`."

#### Q28: Why paginate Tasks on the backend?
> "Enterprise projects often have hundreds or thousands of tasks. Fetching all tasks at once increases database memory consumption, inflates payload size, and slows frontend rendering. Paginating with `page` and `limit` ensures constant response time and bounded memory usage."

#### Q29: How did you migrate from mock tasks to MongoDB without breaking the frontend?
> "We implemented an adapter layer: `normalizeTask()` in `apiService.js` transforms MongoDB documents (`_id`, uppercase status `TODO`, nested ObjectId references) into the normalized shape expected by Phase 1 UI components (`id`, title-cased `To Do`, populated names and avatars). This allowed us to swap the data source while preserving 100% of the UI design and user experience."

#### Q30: What was the biggest technical challenge in Phase 4?
> "Ensuring data integrity across interrelated business rules:
> 1. Preventing circular dependencies in arbitrary directed graph topologies using iterative DFS.
> 2. Preventing blocked tasks from being marked completed while dependencies remain unresolved.
> 3. Synchronizing status, progress, and `completedAt` across concurrent status updates without inconsistent states."

---

## 21. PHASE 5 — REAL DASHBOARD ANALYTICS, AUDIT TRAIL & SYSTEM HARDENING

### Overview
In Phase 5, the Project & Task Management System achieved enterprise business readiness. We added:
1. **Real Dashboard Analytics**: `GET /api/dashboard` powered by high-performance MongoDB aggregation pipelines.
2. **Role-Aware Metric Scoping**: Strict data partitioning for Admins (system-wide), Project Managers (managed projects), and Team Members (assigned work).
3. **Comprehensive Audit & Activity Trail**: `Activity` model in MongoDB capturing 16 critical business lifecycle events across projects and tasks.
4. **Targeted Deadline Visibility**: Real-time identification of tasks due in the next 7 days, excluding completed work, and sorted nearest first.
5. **Dynamic Project Progress Integration**: Derived from actual MongoDB task progress using the Phase 4 formula: $\text{round}(\sum \text{progress} / N)$.
6. **Frontend State & UX Polish**: Real-time dashboard KPI cards, loading skeletons, error boundaries, empty states, and responsive accessibility improvements.
7. **Production Test Coverage**: Expanded to 89/89 passing automated tests.

---

### Phase 5 Pitches (30-Second, 2-Minute, and 5-Minute Technical)

#### 30-Second Interview Elevator Pitch
> *"I built the Project & Task Management System, a full-stack enterprise web platform engineered with the MERN stack. It replaces scattered spreadsheets and chats by centralizing project workspaces, task delegation, dependency DAG tracking with cycle prevention, automated overdue detection, role-aware dashboard analytics, and an immutable business audit trail. All four core entities—Users, Projects, Tasks, and Activities—are 100% database-backed in MongoDB with strict server-side RBAC and 89 automated tests."*

#### 2-Minute Interview Pitch
> *"The Project & Task Management System is an enterprise engineering management application built using MongoDB, Express, React, and Node.js. It addresses a fundamental business problem: delivery delays caused by fragmented communication, ambiguous task ownership, and untracked dependency deadlocks.*
>
> *We developed the project across five disciplined milestones:
> - In **Phase 1**, we designed a responsive React frontend with executive KPI cards, modal workflows, and client state architecture.
> - In **Phase 2**, we implemented a secure Node/Express backend with bcrypt password hashing, JWT HttpOnly authentication cookies, and server-side RBAC.
> - In **Phase 3**, we migrated Projects to MongoDB with manager assignment, atomic collision-safe code generation, and soft archiving.
> - In **Phase 4**, we replaced mock tasks with a database-backed Task Management Engine, featuring directed dependency graph modeling, iterative DFS cycle detection, blocked task prevention, and real-time project progress calculation.
> - In **Phase 5**, we delivered role-aware dashboard analytics using MongoDB aggregation pipelines, an enterprise activity audit trail tracking 16 business events, deadline risk escalation, and UI/UX state hardening.
>
> *Every data entity—Users, Projects, Tasks, and Activities—is fully persisted in MongoDB. The architecture strictly enforces resource-level authorization on the backend, ensuring users never see or modify unauthorized workstreams. The system is verified by 89 passing automated backend tests and clean frontend production builds."*

#### 5-Minute Deep-Dive Technical Explanation
> *"The architecture follows a classic layered design pattern:
>
> **1. Frontend Layer (React 19 + Vite)**:
> Built as a single-page application using React Router DOM, Vite for fast bundling, and pure Vanilla CSS variables for a dark-mode-ready, modern design system. State is managed via React Context (`AuthContext` and `ProjectContext`), with centralized HTTP communication through `apiService.js` using `credentials: 'include'` for automatic cookie transmission.
>
> **2. Transport & Security Middleware (Express 4)**:
> Protected by Helmet for HTTP header security, CORS configured strictly for frontend origin with credentials, an express-rate-limit general limiter, cookie-parser, and centralized async error handling. Incoming payloads and query parameters are validated against declarative Zod schemas before reaching business logic.
>
> **3. Authentication & RBAC**:
> Authentication uses bcrypt for salt-and-hash password verification and signed JWT tokens stored in `HttpOnly`, `SameSite=Lax` cookies to prevent XSS exfiltration. Role-Based Access Control classifies users as `ADMIN`, `PROJECT_MANAGER`, or `TEAM_MEMBER`. Resource-level authorization verifies that PMs only touch projects they lead, and Team Members only update progress and status on tasks assigned to them.
>
> **4. Business Logic & Dependency Graph Engine**:
> The service layer orchestrates business workflows across repositories. Task dependencies are modeled as a Directed Acyclic Graph (DAG). When adding a dependency $A \to B$, an iterative Depth-First Search algorithm explores outgoing edges from $B$ in $O(V + E)$ time; if $A$ is reachable, the operation is blocked to eliminate circular deadlocks. Tasks with incomplete prerequisites are dynamically computed as `isBlocked: true`.
>
> **5. Database & Aggregation Layer (MongoDB + Mongoose)**:
> We utilize 4 primary collections: `users`, `projects`, `tasks`, and `activities`. For dashboard analytics, rather than pulling all documents into Node memory, we leverage MongoDB aggregation pipelines: `$match`, `$group`, `$sum`, and `$avg` to calculate role-scoped metrics, project status distributions, upcoming 7-day deadlines, and team workloads.
>
> **6. Verification & Quality**:
> Verified with 89 automated tests covering authentication, RBAC, project lifecycle, task dependencies, cycle detection, audit logging, and dashboard scoping, alongside ESLint and Vite production builds with zero warnings."*

---

### Step-by-Step 5–7 Minute Live Demonstration Script

When demonstrating the application to recruiters or interviewers, follow this sequence:

1. **Step 1: Admin Overview & Live Analytics (1 min)**:
   - Log in as Admin Rajesh (`admin@thinqloud.com` / `AdminPassword123!`).
   - Show Executive Dashboard: point out the real-time KPI cards (Total Projects, Active Projects, Total Tasks, Completed Tasks, In Progress, Overdue).
   - Point out that these are not hardcoded numbers: they are computed via live MongoDB queries (`GET /api/dashboard`).
   - Show the **Upcoming Deadlines** widget (tasks due in next 7 days, excluding completed).
   - Show the **Recent Activity** audit feed showing who changed what and when.

2. **Step 2: Project Management & Team Assignment (1 min)**:
   - Navigate to `/projects`.
   - Click **New Project** and create `AI Telemetry Platform`.
   - Assign Priya Sundaram as Project Manager and add Team Members Sakshi and Amit.
   - Save and show that atomic code `PRJ-0006` is assigned.
   - Verify that an audit record (`PROJECT_CREATED`) is automatically created in the activity trail.

3. **Step 3: Task Creation & Dependency Graph Configuration (1.5 min)**:
   - Open the new project.
   - Create Task A: `Ingestion Pipeline Setup` (Assigned to Sakshi, Priority: High).
   - Create Task B: `Real-time Telemetry Dashboard` (Assigned to Amit, Priority: High).
   - Configure Dependency: Task B depends on Task A.
   - Show that Task B immediately gains `Blocked` status badge with prerequisite reference.
   - Try to mark Task B as `Completed`: show server rejection (*"Cannot complete task while blocking prerequisite dependencies remain incomplete"*).

4. **Step 4: Circular Dependency Prevention (1 min)**:
   - Attempt to add a reverse dependency: make Task A depend on Task B.
   - Show immediate HTTP 400 rejection: *"Circular dependency detected"*.
   - Explain to the interviewer: *"We ran an iterative DFS on the backend to detect the cycle before writing to MongoDB."*

5. **Step 5: Completion, Unblocking & Dynamic Progress Recalculation (1 min)**:
   - Mark Task A as `Completed` (progress reaches 100%, `completedAt` timestamp logged).
   - Show Task B automatically unblocked and ready for work.
   - Update Task B progress to 50%.
   - Show project overall progress updates dynamically to 75% ($\frac{100 + 50}{2}$).

6. **Step 6: Role-Based Access Scoping & Personal Workspace (1 min)**:
   - Log out and log in as Team Member Sakshi (`dev@thinqloud.com` / `DevPassword123!`).
   - Notice the Dashboard automatically transforms: metrics are now strictly scoped to Sakshi's assigned tasks and member projects.
   - Navigate to `/tasks/my` to show her personalized delivery queue.
   - Attempt to create a project or reassign a task: show that unauthorized actions are forbidden by server-side RBAC.

---

### Troubleshooting Quick-Reference Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **MongoDB not running** | Local `mongod` service stopped | Run `net start MongoDB` or start Docker container `mongod`. |
| **Backend fails on start** | Port 5000 in use or missing `.env` | Kill process on 5000 (`Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process`) and copy `.env.example` to `.env`. |
| **Frontend fails to connect** | CORS mismatch or API down | Verify backend is running on `http://localhost:5000` and `VITE_API_URL` points to `http://localhost:5000/api`. |
| **Demo login fails (401)** | Database unseeded or altered | Run `node scripts/seed.js` inside `backend/` to restore default accounts. |
| **Session cookie not sticking** | Browser blocking cross-origin cookies | Ensure frontend and backend both run on `localhost` and `credentials: 'include'` is configured. |
| **Port 5173 already in use** | Stray Vite dev server running | Run `npx kill-port 5173` or Vite will select `5174` (update CORS if so). |

---

## 22. COMPREHENSIVE INTERVIEW QUESTIONS & ANSWERS (75+ QUESTIONS ACROSS FULL SYSTEM)

### Category 1: Project Overview & Core Value Proposition
#### Q1: Tell me about your project.
> "The Project & Task Management System is an enterprise engineering collaboration platform built with the MERN stack (MongoDB, Express, React, Node.js). It provides end-to-end project tracking, task delegation, dependency DAG tracking with cycle prevention, automated overdue risk detection, role-aware executive analytics, and an immutable business audit trail. All entities—Users, Projects, Tasks, and Activities—are 100% database-backed in MongoDB with strict server-side RBAC and 89 automated tests."

#### Q2: What business problem does it solve?
> "It solves three core operational failures: first, delivery delays caused by fragmented communication across email and chat; second, execution paralysis when team members don't know who owns what or what is blocking what; third, managers discovering overdue deliverables too late to mitigate delivery risks."

#### Q3: Why is this application needed when tools like Jira or Trello exist?
> "Trello is too simple—it lacks dependency graph validation, cycle detection, and structured multi-level project governance. Jira is often bloated and overly complex for engineering teams. Our system balances ease of use with enterprise rigor: strict RBAC, automated cycle prevention, server-derived blocked/overdue states, and lightweight audit trails."

#### Q4: Who are the target users?
> "Three organizational roles:
> 1. Admins: oversee global portfolios, system users, and high-level completion velocity.
> 2. Project Managers: lead specific projects, assign tasks, sequence dependencies, and monitor deadlines.
> 3. Team Members: manage their personal task queues (`My Tasks`), log progress, and flag blockers."

#### Q5: What were the major development phases?
> "We executed 5 structured milestones: Phase 1 frontend foundation; Phase 2 backend auth and user RBAC; Phase 3 project persistence and manager assignment; Phase 4 task engine with dependency DAG and cycle detection; Phase 5 real dashboard analytics, audit trail, and hardening."

---

### Category 2: Frontend Architecture & React Concepts
#### Q6: Why did you choose React and Vite?
> "React provides a component-driven architecture with predictable unidirectional data flow. Vite offers near-instant hot module replacement (HMR) and optimized Rollup production builds, resulting in sub-second build times and minimal bundle size (~113 kB gzip)."

#### Q7: What is the difference between a SPA and a traditional multi-page application?
> "A Single-Page Application (SPA) loads a single HTML shell on initial request. Subsequent page transitions are handled client-side by React Router via dynamic JavaScript rendering without full page reloads, providing snappy desktop-like responsiveness."

#### Q8: How is state managed in your frontend?
> "We use React Context API: `AuthContext` manages user authentication, token session state, and role permissions; `ProjectContext` manages project collections, task lists, and live activities. Local UI state (modals, dropdowns, form inputs) uses `useState`."

#### Q9: What is the difference between props and state?
> "- **Props**: Immutable data passed downwards from parent to child components.
> - **State**: Mutable data maintained and managed within the component itself that triggers re-rendering upon modification via `setState`."

#### Q10: What are React Hooks and why do we use them?
> "Hooks (`useState`, `useEffect`, `useCallback`, `useContext`) allow functional components to manage state and lifecycle side effects without writing legacy class components, improving code readability and reuse."

#### Q11: How do Protected Routes work in React Router?
> "We wrap private routes inside a `<ProtectedRoute>` component. It inspects `currentUser` from `AuthContext`. If unauthenticated, it redirects to `/login`. If the route specifies required roles and the user lacks them, it renders an `Unauthorized` state."

#### Q12: Why did you choose Vanilla CSS over TailwindCSS?
> "Vanilla CSS with semantic custom properties (CSS variables) gives complete control over styling, avoids build-time utility purge overhead, eliminates external CSS framework lock-in, and simplifies enterprise theming."

#### Q13: How do you prevent layout shifts during async data loading?
> "We render dedicated `LoadingSpinner` components and skeleton placeholders with matching container dimensions to preserve layout geometry before data arrives."

#### Q14: How does the frontend handle empty states?
> "Every data container (Projects, Tasks, Activities, Deadlines) has an explicit empty state component with contextual guidance and action buttons (e.g. 'No tasks yet — Create Task')."

#### Q15: How does the frontend handle 401 and 403 API errors?
> "In `apiService.js`, if an HTTP 401 is received, the session is cleared and the user is redirected to `/login` with 'Session expired'. If 403 is received, a user-friendly error banner informs the user they lack sufficient permissions."

---

### Category 3: Backend Architecture & Node/Express
#### Q16: Why did you choose Node.js and Express?
> "Node.js offers high-concurrency non-blocking I/O ideal for RESTful JSON APIs. Express provides a minimalist, robust middleware pipeline allowing modular separation of routes, validators, controllers, and services."

#### Q17: Explain the backend layered architecture.
> "We enforce a strict 4-tier separation:
> 1. Routes: Define HTTP endpoints and attach middleware (`authenticate`, `validate`).
> 2. Controllers: Handle HTTP request parsing and response formatting.
> 3. Services: Encapsulate core business logic, permissions, and cross-model workflows.
> 4. Repositories: Encapsulate Mongoose database queries and aggregation pipelines."

#### Q18: What is middleware in Express?
> "A function that has access to `req`, `res`, and `next()`. Middleware can execute code, modify request/response objects, end the request cycle, or pass control to the next middleware (e.g., Helmet, CORS, cookie-parser, auth guards)."

#### Q19: What is the difference between `app.use()` and route handlers?
> "`app.use()` mounts middleware globally or on a path prefix for all HTTP methods, whereas route handlers (`app.get()`, `app.post()`) match specific HTTP verbs and paths."

#### Q20: Why keep controllers thin?
> "Thin controllers ensure zero business logic is tied to HTTP transport. This makes services reusable across REST APIs, background jobs, or CLI scripts, and simplifies unit testing."

#### Q21: How do you handle errors centrally in Express?
> "We implement a centralized error handling middleware (`error.middleware.js`) with 4 parameters `(err, req, res, next)`. It intercepts `ApiError` instances, Zod validation errors, and MongoDB CastErrors, returning consistent JSON responses and hiding stack traces in production."

#### Q22: What is the purpose of `asyncHandler`?
> "It is a higher-order wrapper that catches rejected promises from async controller functions and automatically passes errors to `next(err)`, avoiding boilerplate `try/catch` in every controller."

---

### Category 4: Database Design & MongoDB
#### Q23: Why MongoDB over a relational database like PostgreSQL?
> "MongoDB offers flexible JSON-like document modeling that aligns naturally with JavaScript objects. Its rich Aggregation Pipeline allows complex KPI grouping and deadline derivations directly inside the database engine without heavy SQL joins."

#### Q24: What is Mongoose?
> "Mongoose is an Object Data Modeling (ODM) library for MongoDB that provides schema definitions, type casting, validation, middleware hooks, and query helpers."

#### Q25: Explain the 4 core MongoDB collections.
> "1. `users`: Stores user credentials, roles, departments, and avatars.
> 2. `projects`: Stores project workspace details, manager and members arrays.
> 3. `tasks`: Stores deliverables, assignees, dates, status, progress, and dependencies.
> 4. `activities`: Stores immutable audit records of business operations."

#### Q26: What is the difference between an ObjectId reference and document embedding?
> "- **Embedding**: Storing related data directly inside the document. Good for 1:few data that doesn't change independently.
> - **Referencing (`ObjectId`)**: Storing pointers to other documents. Essential for many-to-many relationships (e.g., project members, task dependencies) to avoid data duplication and maintain consistency."

#### Q27: How does `.populate()` work in Mongoose?
> "It performs client-side relational joins: Mongoose executes a secondary `$in` query on the referenced collection and replaces `ObjectId` fields with the populated document objects before returning."

#### Q28: What indexes did you create and why?
> "We indexed `{ project: 1, status: 1 }` and `{ assignee: 1, status: 1 }` on Tasks for rapid filtering, `{ code: 1 }` unique index on Projects, `{ email: 1 }` unique index on Users, and `{ project: 1, createdAt: -1 }` on Activities."

#### Q29: What is a compound index?
> "An index covering multiple fields in a specific order (e.g., `{ project: 1, dueDate: 1 }`). It allows MongoDB to satisfy queries filtering on both fields simultaneously using a single index scan."

#### Q30: How do you prevent ReDoS (Regular Expression Denial of Service)?
> "We sanitize user-provided search inputs using an escape function that prefixes all regex metacharacters (`.*+?^${}()|[]\`) with backslashes before passing them to `$regex`."

---

### Category 5: Authentication, Authorization & Security
#### Q31: How does authentication work in your application?
> "The client sends credentials to `POST /api/auth/login`. The server verifies the email, compares password hashes with `bcrypt.compare()`, signs a JWT containing the user ID and role, and attaches it as an `HttpOnly` cookie in the HTTP response."

#### Q32: What is the difference between authentication and authorization?
> "- **Authentication**: Verifying *who you are* (identity verification via login/JWT).
> - **Authorization**: Verifying *what you are allowed to do* (permission checks via RBAC and resource ownership)."

#### Q33: Why store JWT in an `HttpOnly` cookie instead of `localStorage`?
> "Storing JWTs in `localStorage` leaves them accessible to any JavaScript running on the page, making them vulnerable to Cross-Site Scripting (XSS) theft. `HttpOnly` cookies cannot be accessed via JavaScript, providing robust protection against token exfiltration."

#### Q34: What cookie flags did you configure?
> "`httpOnly: true` (prevents JS access), `sameSite: 'lax'` (prevents CSRF while allowing top-level navigation), `secure: process.env.NODE_ENV === 'production'` (ensures HTTPS transmission in production), and `maxAge: 7 days`."

#### Q35: What is RBAC?
> "Role-Based Access Control: restricting system access based on the user's organizational role (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`)."

#### Q36: What is resource-level authorization?
> "Checking authorization against the specific database record being modified rather than just the user's role. For example, a Project Manager can only edit projects they lead, not projects managed by other PMs."

#### Q37: How do you prevent mass assignment vulnerabilities?
> "By defining strict Zod validation schemas that strip unpermitted fields, and never passing raw `req.body` directly to Mongoose `create()` or `update()`. Critical fields like `createdBy` are always populated from `req.user._id`."

#### Q38: How does rate limiting protect the application?
> "Using `express-rate-limit`, we cap requests (e.g., 300 requests per 15 minutes per IP). This mitigates brute-force credential stuffing and denial-of-service attacks."

#### Q39: What security headers does Helmet provide?
> "Helmet sets HTTP headers like `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, and Content Security Policy to defend against clickjacking, MIME sniffing, and cross-site injection."

#### Q40: How are passwords secured?
> "Using `bcryptjs` with an adaptive salt work factor of 10. Passwords are never stored in plaintext, and the `password` field is configured with `select: false` in the Mongoose schema so it is omitted from queries by default."

---

### Category 6: Task Management, Dependencies & Cycle Detection
#### Q41: How do task dependencies work?
> "A task can declare one or more prerequisite tasks within the same project. Until all prerequisites are marked `COMPLETED`, the dependent task is considered logically blocked."

#### Q42: What algorithm did you use for circular dependency detection?
> "Iterative Depth-First Search (DFS) on the directed dependency graph."

#### Q43: Walk me through the cycle detection algorithm step by step.
> "To check if Task A can depend on Task B:
> 1. Initialize an empty `visited` set and a `stack` containing `[Task B]`.
> 2. While the stack is not empty, pop the top task.
> 3. If the popped task equals Task A, a cycle path $B \rightsquigarrow A$ exists! Reject with HTTP 400.
> 4. If not visited, mark as visited, fetch its dependencies from MongoDB, and push them onto the stack.
> 5. If the stack empties without encountering Task A, the dependency is acyclic and safe to save."

#### Q44: What is the time and space complexity of your cycle detection?
> "Time complexity is $O(V + E)$ where $V$ is tasks and $E$ is dependencies in the project. Space complexity is $O(V)$ for the visited set and stack."

#### Q45: Why is the cycle check done iteratively rather than recursively?
> "Iterative DFS uses an explicit array stack on the heap, preventing JavaScript V8 call stack overflow errors on deep dependency chains."

#### Q46: Can a task depend on a task in another project?
> "No. Cross-project dependencies are explicitly forbidden to prevent workspace deadlocks and maintain strict project boundaries."

#### Q47: Can a task depend on itself?
> "No. Self-dependencies ($A \to A$) are caught immediately by checking `taskId === dependencyId`."

#### Q48: How is a task's `isBlocked` status determined?
> "It is derived dynamically during query populate: if any task in `dependencies` has `status !== 'COMPLETED'`, `isBlocked` is set to `true`."

#### Q49: Why don't you store `isBlocked` in the MongoDB Task document?
> "Because storing derived state leads to stale data: completing Task B would require finding and updating every task that depends on B. Deriving it dynamically guarantees 100% data consistency."

#### Q50: How do status and progress synchronize?
> "Setting `progress = 100` forces `status = 'COMPLETED'` and records `completedAt`. Setting `status = 'COMPLETED'` forces `progress = 100`. Reopening a completed task clears `completedAt` to `null` and resets progress if it was 100."

---

### Category 7: Analytics, Aggregations & Dashboard
#### Q51: How does the Dashboard API work?
> "`GET /api/dashboard` queries MongoDB using targeted `countDocuments` and Aggregation Pipelines to return role-scoped metrics, status distributions, upcoming deadlines, and recent activities in a single payload."

#### Q52: Why use MongoDB aggregation instead of calculating metrics in JavaScript?
> "Running aggregations in MongoDB pushes computation to the database engine, avoiding transferring thousands of raw documents over the network and drastically reducing Node.js memory and CPU load."

#### Q53: How does the Admin dashboard differ from the PM dashboard?
> "Admin sees global workspace metrics across all users, projects, and tasks. PM sees metrics strictly filtered to projects they manage or participate in (`$or: [{ manager: user._id }, { members: user._id }]`)."

#### Q54: What does the Team Member dashboard display?
> "Personalized workload: assigned tasks, uncompleted tasks, personal upcoming deadlines, and assigned project progress summaries."

#### Q55: How are upcoming deadlines identified?
> "Using MongoDB query `{ dueDate: { $gte: now, $lte: now + 7 days }, status: { $ne: 'COMPLETED' } }` sorted by `dueDate: 1`. Completed tasks are strictly excluded."

#### Q56: How is overdue status calculated?
> "A task is overdue when `dueDate < new Date()` and `status !== 'COMPLETED'`. Overdue days are calculated as $\text{ceil}\left(\frac{\text{now} - \text{dueDate}}{86400000}\right)$."

#### Q57: How is project progress calculated?
> "As the arithmetic mean of all task progress percentages in the project: $\text{round}\left(\frac{\sum \text{task.progress}}{N}\right)$. If $N = 0$, progress is 0%."

#### Q58: What is the team workload widget?
> "An aggregation that groups tasks by `assignee`, counting total tasks, open tasks, completed tasks, and overdue tasks per team member to highlight workload distribution."

---

### Category 8: Activity Logging & Audit Trail
#### Q59: What is the activity audit trail?
> "A persistent ledger in MongoDB (`activities` collection) that records key business events (creations, status transitions, member additions, dependency modifications) with actor, timestamp, and metadata."

#### Q60: How does activity logging avoid logging noisy GET requests?
> "Activity logging is invoked explicitly at the service layer during state-mutating business operations, not as HTTP-level middleware. Only meaningful business events are recorded."

#### Q61: How are activities authorization-scoped?
> "Admins can view global activities. PMs can only view activities related to projects they manage. Team Members only view activities for projects they belong to."

#### Q62: What happens if an activity log write fails?
> "The `logActivity` helper wraps creation in a `try/catch` and logs an internal warning. It never throws or aborts the primary business transaction, ensuring non-blocking audit logging."

---

### Category 9: Testing, Quality Assurance & Git
#### Q63: What testing framework did you use?
> "Vitest with Supertest for automated backend REST API integration testing, running against real test MongoDB database instances."

#### Q64: How many tests exist in the project?
> "89 automated tests across 6 suites: `auth.test.js` (8), `users.test.js` (10), `projects.test.js` (26), `tasks.test.js` (30), `activities.test.js` (9), and `dashboard.test.js` (6)."

#### Q65: How do you isolate tests between runs?
> "Each test suite connects to an isolated test database and runs `beforeEach` hooks that clear collections (`deleteMany({})`) and seed fresh test fixtures."

#### Q66: What negative security tests did you write?
> "Tests verifying that Team Members cannot create projects, PMs cannot edit projects they don't manage, unauthenticated requests return 401, invalid ObjectIds return 400, and circular dependencies are rejected."

#### Q67: What was your Git branching and commit strategy?
> "A linear, milestone-driven Git history on `main` where each major phase was committed as a clean conventional commit (`feat: complete Phase X ...`) only after all automated tests and builds passed."

#### Q68: Why avoid `git push --force`?
> "Force pushing overwrites remote commit history, potentially destroying collaborators' commits and erasing the verifiable evolutionary timeline of the codebase."

---

### Category 10: Scalability, Trade-Offs & Future Improvements
#### Q69: How would you scale this system to 100,000 active users?
> "1. Introduce Redis caching for read-heavy dashboard metrics and user sessions.
> 2. Implement MongoDB horizontal sharding on `tasks` by `project`.
> 3. Deploy Node.js backend as stateless containers behind an AWS ALB with horizontal pod autoscaling.
> 4. Offload heavy reports to background worker queues."

#### Q70: What trade-off did you make regarding WebSockets?
> "We chose short-polling and refresh buttons over WebSockets. WebSockets add persistent socket memory overhead and connection state complexity. For a task management tool where updates occur in minutes rather than milliseconds, HTTP polling provides superior simplicity and stability."

#### Q71: What trade-off did you make regarding soft deletes?
> "We implemented soft archiving on Projects (`status = 'ARCHIVED'`), but hard deletes on Tasks. Archiving projects preserves audit history for corporate governance, while hard-deleting draft/test tasks avoids unbounded orphan accumulation."

#### Q72: How would you handle file attachments in the future?
> "Store file metadata in MongoDB and upload binary assets directly to an S3-compatible object store using pre-signed upload URLs to avoid streaming large files through Node.js."

#### Q73: What is the biggest lesson you learned building this project?
> "Separation of concerns is paramount. By enforcing clean boundaries between React presentation, Express routing, service business rules, and MongoDB repositories, we migrated entire subsystems (from mock data to MongoDB) without breaking frontend components or destabilizing earlier phases."

#### Q74: If you had another sprint, what feature would you add?
> "Email notifications via SendGrid/SES for upcoming deadline warnings and automated daily standup digest emails for team members."

#### Q75: Why are you confident in this project for a production deployment?
> "Because it isn't an MVP toy: it features strict input validation with Zod, production security headers, HttpOnly cookie authentication, real DAG cycle detection algorithms, 100% database-backed entities, 89 passing automated tests, zero lint warnings, and a rock-solid Git audit history."




