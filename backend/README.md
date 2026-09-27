# Project & Task Management System — Backend API (Phase 2)

Node.js, Express, and MongoDB backend foundation providing secure JWT authentication via HttpOnly cookies, password hashing with bcrypt, Zod validation, and server-side Role-Based Access Control (RBAC).

---

## 🛠️ Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Signed JSON Web Tokens (JWT) stored in HttpOnly cookies
- **Security**: bcryptjs, Helmet, CORS with credentials, express-rate-limit
- **Validation**: Zod schema validation
- **Testing**: Vitest + Supertest

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/project_task_management
JWT_SECRET=super_secret_jwt_key_project_task_management_2026_secure
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database
Seeds 1 Admin, 1 Project Manager, and 3 Team Members with bcrypt-hashed passwords:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Health endpoint: `http://localhost:5000/api/health`

### 5. Run Automated Tests
```bash
npm test
```

---

## 🔑 Seed Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@thinqloud.com` | `AdminPassword123!` |
| **Project Manager** | `pm@thinqloud.com` | `ManagerPassword123!` |
| **Team Member** | `dev@thinqloud.com` | `DevPassword123!` |
| **Team Member** | `amit.d@thinqloud.com` | `DevPassword123!` |
| **Team Member** | `neha.v@thinqloud.com` | `DevPassword123!` |

---

## 📡 API Endpoints

### Health
- `GET /api/health` — Service health check (Public)

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Login with email and password, receives HttpOnly cookie (Public, Rate-limited)
- `GET /api/auth/me` — Fetch currently authenticated user session (Authenticated)
- `POST /api/auth/logout` — Clear session cookie (Authenticated)

### User Management (`/api/users`)
- `GET /api/users` — List team members (Admin, Project Manager)
- `POST /api/users` — Create new team member (Admin only)
- `GET /api/users/:id` — Retrieve user profile by ID (Admin, Project Manager, or Self)
- `PATCH /api/users/:id` — Update user metadata (Admin only)
- `PATCH /api/users/:id/status` — Activate/deactivate user (Admin only)
