# Project & Task Management System

A production-grade, business-oriented Project & Task Management web platform built for the **Thinqloud Solutions Pvt. Ltd.** campus recruitment drive.

| Milestone | Status | Details |
| :--- | :--- | :--- |
| **Phase 1: Frontend Foundation** | **COMPLETE** | React 19, Vite, responsive UI, executive KPI dashboard, dynamic progress & overdue engines, task dependency matrix |
| **Phase 2: Backend, Real Auth & RBAC** | **COMPLETE** | Node.js, Express, MongoDB, Mongoose, JWT in HttpOnly cookies, bcrypt hashing, server-side RBAC, Zod validation |
| **Phase 3: Database Projects & Tasks** | *Pending Approval* | Migration of Projects, Tasks, and Dependencies to MongoDB models and REST CRUD |
| **Phase 4: Real-time & Collaboration** | *Upcoming* | Socket.IO live notifications, team activity streams, export reports |

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
- **State Management**: React Context API (`AuthContext`, `ProjectContext`) + localStorage mock synchronization
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Design Tokens (accessible, responsive, zero-framework bloat)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: Signed JSON Web Tokens (JWT) stored in `HttpOnly` browser cookies
- **Password Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) with 10 salt rounds
- **Validation**: [Zod](https://zod.dev/) request body and parameter validation
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

# Seed MongoDB with initial demo accounts
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
| **Admin** | Rajesh Verma | `admin@thinqloud.com` | `AdminPassword123!` | Full user management, workspace administration, all-team oversight |
| **Project Manager** | Priya Sundaram | `pm@thinqloud.com` | `ManagerPassword123!` | Project management, milestone planning, team user directory view |
| **Team Member** | Vikram Malhotra | `dev@thinqloud.com` | `DevPassword123!` | Personal workspace (`My Tasks`), task status & progress updates |
| **Team Member** | Amit Deshmukh | `amit.d@thinqloud.com` | `DevPassword123!` | Engineering task execution |
| **Team Member** | Neha Varma | `neha.v@thinqloud.com` | `DevPassword123!` | Design & QA task execution |

---

## 🧪 Automated Testing & Verification

### Run Backend Automated Tests
```bash
cd backend
npm test
```
*Executes 18 automated integration tests covering health checks, login flows, cookie security, session restoration, RBAC route guards, duplicate user conflicts, and Zod parameter validation.*

### Run Frontend Lint & Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 🧭 System Architecture & Request Flow

```
React Frontend (Vite)
   │
   │ HTTP JSON (credentials: 'include')
   ▼
Express Server (Port 5000)
   │
   ├─► Security (Helmet, CORS: localhost:5173, Rate Limiting)
   ├─► Validation (Zod schemas for bodies and ObjectId params)
   ├─► Authentication (JWT verified from HttpOnly cookie)
   ├─► Authorization (Server-side RBAC: ADMIN, PROJECT_MANAGER, TEAM_MEMBER)
   │
   ▼
Controllers ──► Services ──► Repositories ──► Mongoose ODM ──► MongoDB
```

---

## 📚 Project Documentation
- **[docs/phase-1.md](file:///d:/Project%20and%20Task%20Management/docs/phase-1.md)**: Phase 1 deliverables, component library, and dynamic business utilities.
- **[docs/phase-2.md](file:///d:/Project%20and%20Task%20Management/docs/phase-2.md)**: Phase 2 backend foundation, real authentication, RBAC matrix, and API contracts.
- **[docs/architecture.md](file:///d:/Project%20and%20Task%20Management/docs/architecture.md)**: Complete system design, data flow diagrams, and layer responsibilities.
- **[docs/PROJECT_WALKTHROUGH.md](file:///d:/Project%20and%20Task%20Management/docs/PROJECT_WALKTHROUGH.md)**: Comprehensive interview preparation guide, 30 backend & architecture Q&As, 2-minute elevator pitch, and step-by-step interview demo script.
