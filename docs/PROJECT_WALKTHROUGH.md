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

## 26. 2-MINUTE PROJECT ELEVATOR PITCH (PHASE 2 UPDATED)

*(Practice speaking this aloud for your interview introduction)*:

> "Hello! I built the **Project & Task Management System** for the Thinqloud Solutions recruitment drive. 
>
> The business problem this system addresses is operational friction in engineering delivery teams—unclear task ownership, invisible blockers, unmonitored deadlines, and scattered communication across informal channels.
>
> To address this, I designed a multi-role enterprise platform tailored for three organizational roles: **Admins**, **Project Managers**, and **Team Members**.
>
> Across **Phase 1 and Phase 2**, we have delivered:
> 1. A responsive, component-driven **React 19 frontend** built with **Vite, React Router DOM, and a custom CSS design system**. It features dynamic executive KPIs, project completion meters, prerequisite task dependency tracking, and real-time overdue alerts computed on the fly.
> 2. A production-grade **MERN backend foundation** built on **Node.js, Express, MongoDB, and Mongoose**.
> 3. An enterprise security layer featuring **real JWT authentication stored in secure HttpOnly cookies**, **bcrypt password hashing with salt rounds**, and **server-side Role-Based Access Control (RBAC)** middleware.
> 4. Defensive API protections including **Helmet security headers, strict CORS configuration, Zod request validation, and IP rate limiting**.
>
> In accordance with our phase boundaries, **Phase 2 connects real authentication and user management to our MongoDB backend**, while projects and tasks currently operate on a reactive mock layer. This ensures that in Phase 3, we can seamlessly migrate project and task data models into MongoDB without breaking frontend contracts or introducing regressions.
>
> The backend achieves 100% test coverage across authentication and authorization suites, the frontend compiles with zero ESLint warnings, and session integrity automatically survives full browser reloads."

---

## 27. STEP-BY-STEP INTERVIEW DEMO WALKTHROUGH (PHASE 2 UPDATED)

Follow this exact sequence when demonstrating the application to interviewers:

### Step 1: Start Services & Database
- **Action**: Show that MongoDB is running on port 27017, the Express backend server is running on `http://localhost:5000`, and Vite frontend dev server is running on `http://localhost:5173`.
- **What to say**: *"Here we have our full-stack architecture running. Our Express backend connects to a local MongoDB instance named `project_task_management`, and our Vite React client runs on port 5173."*

### Step 2: Login as Admin & Explain Authentication Flow
- **Action**: Navigate to `/login`. Click the **'Admin'** demo quick-fill button (`admin@thinqloud.com`), then click **'Sign In to Workspace'**.
- **What to say**: *"When I click login, the React frontend submits a POST request to `/api/auth/login`. Our Express validation middleware validates the request using Zod. The backend retrieves the user from MongoDB, verifies the password using `bcrypt.compare`, signs a JWT containing the user ID, and returns it inside an HttpOnly cookie with `SameSite: Lax`. The frontend AuthContext receives the sanitized user profile without exposing any token to JavaScript."*

### Step 3: Executive Dashboard & Dynamic Metrics
- **Action**: Land on `/dashboard`. Highlight the 6 KPI cards across the top and project progress bars.
- **What to say**: *"Upon authentication, we land on the Executive Dashboard. These 6 KPI cards—Total Projects, Active Projects, Total Tasks, Completed, In-Progress, and Overdue—are dynamically computed in real-time from our data state rather than hardcoded."*

### Step 4: Refresh Browser & Demonstrate Session Restoration
- **Action**: Press `Ctrl + R` (or `F5`) in the browser to trigger a full page reload. Show the brief Loading Spinner before returning directly to `/dashboard`.
- **What to say**: *"Notice that when I refresh the page, the user session remains intact. Because we do not store tokens in volatile React state or insecure localStorage, `AuthContext` makes a background GET request to `/api/auth/me` with `credentials: 'include'`. Express verifies the HttpOnly cookie, fetches the active user from MongoDB, and restores the authenticated state seamlessly."*

### Step 5: Team Page with Real MongoDB Users
- **Action**: Click **'Team / Users'** in the sidebar. Show the list of users (`Rajesh Verma`, `Priya Sundaram`, `Vikram Malhotra`, etc.).
- **What to say**: *"The Team Directory now fetches real organization accounts directly from our MongoDB database via `GET /api/users`. Notice that Admin and Project Manager roles can view this directory, and each user displays their true database role and department."*

### Step 6: Logout & Session Invalidation
- **Action**: Click the User Profile badge in the header or sidebar and click **'Sign Out'**.
- **What to say**: *"Clicking Sign Out calls `POST /api/auth/logout`. The Express server immediately clears the HttpOnly cookie by setting its expiration to the past. The browser discards the token and redirects the user to `/login`."*

### Step 7: Login as Team Member & Demonstrate Server-Side RBAC
- **Action**: Click the **'Team Member'** demo button (`dev@thinqloud.com`), then log in.
- **What to say**: *"Now I log in as Vikram, an engineer with the `TEAM_MEMBER` role. Notice that administrative actions are hidden in the UI for optimal user experience. But more importantly, if Vikram attempts to invoke `GET /api/users` or `POST /api/users` directly via Postman or DevTools, our backend `authorize('ADMIN')` middleware rejects the request with HTTP `403 Forbidden`. The server is the true security perimeter, not client-side React code."*

### Step 8: Show ProtectedRoute vs Backend Security
- **Action**: Manually navigate to a restricted URL or explain route protection.
- **What to say**: *"In React, `ProtectedRoute` acts solely as client-side UX navigation guidance to prevent flash-of-unauthenticated-content. True security is enforced exclusively by Express middleware: `authenticate` checks token authenticity, and `authorize` verifies active MongoDB role permissions."*

### Step 9: Show Projects & Tasks (Strict Phase 2 Boundary)
- **Action**: Open **'Projects'** and **'Tasks'**. Show task dependency views and overdue warnings.
- **What to say**: *"Notice that Projects, Tasks, and Dependencies continue to function smoothly. In Phase 2, we adhered to a strict phase boundary: projects and tasks remain managed via our reactive Phase 1 mock store in localStorage. We avoided premature database migration so our backend foundation could be tested in isolation."*

### Step 10: Explain Phase 3 Migration Strategy
- **Action**: Open the Project Details view.
- **What to say**: *"In Phase 3, we will create Mongoose schemas for Projects and Tasks, replace `ProjectContext` mock calls with REST endpoints (`/api/projects`, `/api/tasks`), migrate relational user references to MongoDB ObjectIds, and add live notifications via Socket.IO."*

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
> "In Phase 3, we will define a Mongoose `Project` schema where `projectManager` and `teamMembers` reference MongoDB `User._id` values using `Schema.Types.ObjectId` with `ref: 'User'`. When querying projects, Mongoose `populate('projectManager', 'name email avatar')` will join user details dynamically."

