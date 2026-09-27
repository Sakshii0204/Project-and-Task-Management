# Project & Task Management System

A production-grade, business-oriented Project & Task Management web platform built for the **Thinqloud Solutions Pvt. Ltd.** campus recruitment drive.

| Milestone | Status | Details |
| :--- | :--- | :--- |
| **Phase 1: Frontend Foundation** | **COMPLETE** | React 19, Vite, responsive UI, executive KPI dashboard, dynamic progress & overdue engines, task dependency matrix |
| **Phase 2: Backend, Real Auth & RBAC** | **COMPLETE** | Node.js, Express, MongoDB, Mongoose, JWT in HttpOnly cookies, bcrypt hashing, server-side RBAC, Zod validation |
| **Phase 3: Real Database Projects & Teams**| **COMPLETE** | MongoDB Project schema, Mongoose relationships (`ObjectId`), manager & team membership, resource-level RBAC, code generator (`PRJ-XXXX`), archive workflow |
| **Phase 4: Database Tasks & Engine** | **COMPLETE** | Mongoose Task schema, real task dependencies (DAG), DFS cycle detection, dynamic progress calculation, assignment engine, 74/74 tests passing |
| **Phase 5: Real-time & Presentation Polish** | *NOT STARTED* | Socket.IO live notifications, team activity streams, export reports |

---

## 📌 Current Persistence Architecture
- **Users**: **MongoDB Database** (Mongoose `User` model, bcrypt password hash)
- **Authentication**: **Backend API** (Signed JWT in `HttpOnly` cookie, session restoration via `/api/auth/me`)
- **Authorization**: **Server-Side RBAC & Resource-Level Security** (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`)
- **Projects**: **MongoDB Database** (Mongoose `Project` model, manager & member `ObjectId` references)
- **Tasks**: **MongoDB Database** (Mongoose `Task` model, project & assignee references, real DAG dependencies)
- **Dependencies**: **Directed Graph Engine** (Iterative DFS cycle prevention, derived `isBlocked` / `blockingDependencies`)
- **Project Progress**: **Database-Derived Truth** ($\text{SUM}(\text{progress}) / N$ across MongoDB tasks)

---

## 📌 Business Problem & Scope
Enterprises face severe delivery bottlenecks due to scattered communications, unclear task accountability, invisible blocker dependencies, and unmanaged overdue milestones. This platform delivers:
- **Executive Portfolio Tracking**: Multi-workspace visibility with dynamic progress percentages and budget health.
- **Task Management**: Hierarchical assignments with priority levels, status workflows, and deadlines.
- **Task Dependencies**: Upstream and downstream blocker tracking (`Blocked By`, `Depends On`).
- **Deadline Intelligence**: Dynamic algorithm computing real-time overdue discrepancies (`dueDate < now`).
- **Enterprise Security & RBAC**: Real authentication and server-enforced role access (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management**: React Context API (`AuthContext`, `ProjectContext`) + localStorage mock task synchronization
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Design Tokens (accessible, responsive, zero-framework bloat)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: Signed JSON Web Tokens (JWT) stored in `HttpOnly` browser cookies
- **Password Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) with 10 salt rounds
- **Validation**: [Zod](https://zod.dev/) request body, query, and parameter validation
- **Security Middleware**: [Helmet](https://helmetjs.github.io/), [CORS](https://www.npmjs.com/package/cors) (credentials enabled), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- **Testing**: [Vitest](https://vitest.dev/) + [Supertest](https://www.npmjs.com/package/supertest)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on v22)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 (or MongoDB Atlas URI)
- npm v9+

---

### Step 1: Backend Setup & Seeding

Open **Terminal 1**:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Seed MongoDB with initial demo accounts and projects
npm run seed

# Run backend development server (starts on http://localhost:5000)
npm run dev
```

#### Backend Environment Variables (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/project_task_management
JWT_SECRET=super_secure_development_jwt_secret_thinqloud_2026
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

---

### Step 2: Frontend Setup

Open **Terminal 2**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Start Vite development server (starts on http://localhost:5173)
npm run dev
```

#### Frontend Environment Variables (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Seeded Demo Accounts (Real MongoDB Authentication)

The login screen features one-click autofill buttons mapped to real accounts seeded in MongoDB:

| Role | Name | Email | Seed Password | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Rajesh Kulkarni | `admin@thinqloud.com` | `AdminPassword123!` | Full user & project administration, manager reassignment, system oversight |
| **Project Manager** | Priya Sundaram | `pm@thinqloud.com` | `ManagerPassword123!` | Project management, member assignments, status updates, team directory view |
| **Team Member** | Sakshi Sharma | `dev@thinqloud.com` | `DevPassword123!` | Personal workspace (`My Tasks`), task status & progress updates |
| **Team Member** | Amit Deshmukh | `amit.d@thinqloud.com` | `DevPassword123!` | Core engineering task execution |
| **Team Member** | Neha Verma | `neha.v@thinqloud.com` | `DevPassword123!` | Experience design task execution |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with email/password and set HttpOnly session cookie
- `GET /api/auth/me`: Restore active session from cookie
- `POST /api/auth/logout`: Clear authentication cookie

### User Management (`/api/users`)
- `GET /api/users`: List users (ADMIN, PROJECT_MANAGER)
- `POST /api/users`: Create user (ADMIN)
- `GET /api/users/:id`: Get user details (ADMIN, PROJECT_MANAGER)
- `PATCH /api/users/:id`: Update user profile (ADMIN)
- `PATCH /api/users/:id/status`: Update user status (ADMIN)

### Project Management (`/api/projects`)
- `GET /api/projects`: List projects scoped by role (Supports `search`, `status`, `priority`, `page`, `limit`)
- `POST /api/projects`: Create project with unique code generation (ADMIN, PROJECT_MANAGER)
- `GET /api/projects/:id`: Get project details with populated manager and members
- `PATCH /api/projects/:id`: Update project configuration (ADMIN, Project Manager of project)
- `PATCH /api/projects/:id/status`: Update project status (ADMIN, Project Manager of project)
- `PATCH /api/projects/:id/archive`: Soft delete / archive project (ADMIN, Project Manager of project)
- `POST /api/projects/:id/members`: Add member to project (ADMIN, Project Manager of project)
- `DELETE /api/projects/:id/members/:userId`: Remove member from project (ADMIN, Project Manager of project)
- `PATCH /api/projects/:id/manager`: Reassign project lead (ADMIN)

### Task Management (`/api/tasks`)
- `POST /api/tasks`: Create task with project and assignee verification (ADMIN, PROJECT_MANAGER)
- `GET /api/tasks`: List tasks with search, priority/status filter, pagination (scoped by role)
- `GET /api/tasks/my`: List personal tasks assigned to authenticated user
- `GET /api/tasks/overdue`: List overdue tasks scoped by role
- `GET /api/tasks/project/:projectId/metrics`: Get project progress and task counts
- `GET /api/tasks/:id`: Get task details with populated dependencies
- `PATCH /api/tasks/:id`: Update task fields (full access for Admin/PM, status/progress for assigned member)
- `PATCH /api/tasks/:id/status`: Update status (auto-synchronizes progress)
- `PATCH /api/tasks/:id/progress`: Update progress (auto-synchronizes status)
- `POST /api/tasks/:id/dependencies`: Add prerequisite dependency with DFS cycle detection
- `DELETE /api/tasks/:id/dependencies/:dependencyId`: Remove prerequisite dependency
- `DELETE /api/tasks/:id`: Delete task and cleanup dependency references

---

## 🧪 Automated Testing & Verification

### Run Backend Automated Tests
```bash
cd backend
npm test
```
*Executes 74 automated integration tests covering authentication, session cookies, RBAC route guards, user operations, project creation, member assignments, task lifecycle, DFS circular dependency detection, blocked task enforcement, overdue derivation, and real project progress calculations.*

### Run Frontend Lint & Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 📚 Project Documentation
- **[docs/phase-1.md](file:///d:/Project%20and%20Task%20Management/docs/phase-1.md)**: Phase 1 deliverables, component library, and dynamic business utilities.
- **[docs/phase-2.md](file:///d:/Project%20and%20Task%20Management/docs/phase-2.md)**: Phase 2 backend foundation, real authentication, RBAC matrix, and API contracts.
- **[docs/phase-3.md](file:///d:/Project%20and%20Task%20Management/docs/phase-3.md)**: Phase 3 Project and Team Management implementation report, schema design, and resource authorization.
- **[docs/phase-4.md](file:///d:/Project%20and%20Task%20Management/docs/phase-4.md)**: Phase 4 Task Management Engine, DFS cycle detection, DAG dependencies, and MongoDB integration.
- **[docs/architecture.md](file:///d:/Project%20and%20Task%20Management/docs/architecture.md)**: Complete system design, data flow diagrams, and layer responsibilities.
- **[docs/PROJECT_WALKTHROUGH.md](file:///d:/Project%20and%20Task%20Management/docs/PROJECT_WALKTHROUGH.md)**: Comprehensive interview preparation guide, 30 Phase 2 Q&As, 25 Phase 3 Q&As, updated 2-minute elevator pitch, and step-by-step interview demo script.
