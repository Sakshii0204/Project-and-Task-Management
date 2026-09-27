# Phase 2 Implementation Report — Project & Task Management System

## Phase 2 Objective
Establish the production-ready Node.js, Express, MongoDB, and Mongoose backend foundation with secure JWT authentication stored in HttpOnly cookies, server-side Role-Based Access Control (RBAC), Zod request validation, and centralized error handling.

Connect the existing Phase 1 React frontend to the real backend authentication and user management APIs, while strictly preserving Phase 1 mock projects, tasks, and activities for migration in later phases.

---

## Target Architecture

```
Browser (React Frontend)
   │
   │ HTTP / JSON with credentials (HttpOnly Cookie)
   ▼
Express REST API Server (Port 5000)
   │
   ├─► Security Middleware (Helmet, CORS with credentials, Rate Limiter)
   │
   ├─► Authentication Middleware (verifyToken from cookie, load active user)
   │
   ├─► Authorization / RBAC Middleware (check user.role against allowed roles)
   │
   ├─► Validation Middleware (Zod schema validation on body and params)
   │
   ▼
Controllers (req/res translation, status codes, cookies)
   │
   ▼
Services (business logic, duplicate checks, hashing)
   │
   ▼
Repositories / Data Access Layer (Mongoose query isolation)
   │
   ▼
Mongoose ODM & MongoDB (project_task_management database)
```

---

## Backend Directory Structure

```
backend/
├── scripts/
│   └── seed.js                 # Database seeder with bcrypt-hashed demo accounts
├── src/
│   ├── config/
│   │   ├── database.js         # Mongoose centralized connection & teardown
│   │   └── env.js              # Environment variable validation & fallback
│   ├── controllers/
│   │   ├── auth.controller.js  # login, me, logout handlers
│   │   └── user.controller.js  # list, getById, create, update, updateStatus handlers
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT cookie verification & user hydration
│   │   ├── authorize.middleware.js # Server-side RBAC role enforcer
│   │   ├── error.middleware.js     # Centralized error handler with Mongoose & Zod mapping
│   │   ├── notFound.middleware.js  # 404 handler for unknown endpoints
│   │   └── validate.middleware.js  # Zod schema validation middleware
│   ├── models/
│   │   └── User.js             # Mongoose schema with roles, statuses, toJSON transform
│   ├── repositories/
│   │   └── user.repository.js  # Data access layer isolating Mongoose queries
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth routes with rate limiting
│   │   └── user.routes.js      # /api/users routes with RBAC guards
│   ├── services/
│   │   ├── auth.service.js     # Auth logic, credential comparison, safe user return
│   │   └── user.service.js     # User management logic, email conflict checks
│   ├── utils/
│   │   ├── ApiError.js         # Custom operational error class
│   │   ├── asyncHandler.js     # Async wrapper eliminating try/catch boilerplate
│   │   ├── jwt.js              # Token signing, verification, and cookie options
│   │   └── password.js         # bcrypt hashing and comparison
│   ├── validators/
│   │   ├── auth.validator.js   # Zod login & registration schemas
│   │   └── user.validator.js   # Zod user creation, update, status, and ID schemas
│   ├── app.js                  # Express app setup, security middlewares, route mounting
│   └── server.js               # HTTP listener and graceful shutdown handling
├── tests/
│   ├── auth.test.js            # Auth endpoints automated test suite
│   └── users.test.js           # RBAC and user management automated test suite
├── .env.example
├── package.json
└── README.md
```

---

## Database Configuration

- **Database Engine**: MongoDB v8.0+
- **ODM**: Mongoose v8.14+
- **Default Database Name**: `project_task_management`
- **Connection Logic**: Implemented in [database.js](file:///d:/Project%20and%20Task%20Management/backend/src/config/database.js).
  - Handles connect and disconnect events.
  - Intercepts uncaught exceptions and `SIGINT`/`SIGTERM` signals for graceful socket closure.
  - Fail-fast mechanism on startup failure: exits with code 1 if connection fails.

---

## User Schema

Implemented in [User.js](file:///d:/Project%20and%20Task%20Management/backend/src/models/User.js):

| Field | Type | Modifiers / Rules | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, trimmed, max 100 chars | Full name of the user |
| `email` | String | Required, unique index, lowercase, trimmed | Primary user email identifier |
| `password` | String | Required, minlength 8, select: false | bcrypt-hashed password hash |
| `role` | String | Enum: `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER` | Role identifier for server-side RBAC |
| `department` | String | Trimmed, default: `'Engineering'` | User department |
| `status` | String | Enum: `ACTIVE`, `INACTIVE`, default: `ACTIVE` | Account status |
| `avatar` | String | Trimmed, default: `''` | Profile avatar URL |
| `createdAt` | Date | Managed by timestamps | Creation timestamp |
| `updatedAt` | Date | Managed by timestamps | Last update timestamp |

### Security Measures in Schema:
- `select: false` prevents accidental leakage of password hash in Mongoose queries.
- `toJSON` transform automatically strips `password` and `__v` from all serialized outputs.

---

## Authentication Flow

```
1. Client POST /api/auth/login { email, password }
2. validateBody(loginSchema) verifies valid email format & presence of password.
3. authController delegates to authService.login(email, password).
4. userRepository retrieves user with +password explicit selector.
5. Service verifies user exists and user.status === 'ACTIVE'.
6. passwordUtils.comparePassword(password, user.password) compares hash using bcrypt.
7. jwtUtils.generateToken(user._id) signs token containing { userId } with JWT_SECRET.
8. authController sets HttpOnly cookie:
     res.cookie('token', token, {
       httpOnly: true,
       secure: NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 86400000
     });
9. Controller responds with 200 OK and safe user profile (without password hash).
10. Frontend React AuthContext stores safe user object in memory.
```

---

## Session Restoration Flow (`GET /api/auth/me`)

```
1. Browser opens or refreshes.
2. AuthContext triggers restoreSession() calling GET /api/auth/me with credentials: 'include'.
3. Browser automatically attaches the 'token' HttpOnly cookie.
4. authenticate middleware extracts token from req.cookies.token.
5. jwt.verify() checks signature and expiration.
6. User lookup by ID confirms user exists and status is ACTIVE.
7. Safe user is attached to req.user.
8. authController.getMe responds with 200 OK and user payload.
9. AuthContext updates state: currentUser = user, isAuthenticated = true, isLoading = false.
```

---

## RBAC Architecture

Server-side authorization is enforced through [authorize.middleware.js](file:///d:/Project%20and%20Task%20Management/backend/src/middleware/authorize.middleware.js):

- `authorize('ADMIN')`: Only Admin users may access the route.
- `authorize('ADMIN', 'PROJECT_MANAGER')`: Admins and Project Managers can access the route.
- `authorize('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')`: All authenticated active users have access.

### Route Access Control Matrix:

| Endpoint | Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | Authenticate user & issue HttpOnly cookie |
| `/api/auth/logout` | POST | Authenticated | Clear cookie & terminate session |
| `/api/auth/me` | GET | Authenticated | Fetch current user session |
| `/api/health` | GET | Public | Health check |
| `/api/users` | GET | `ADMIN`, `PROJECT_MANAGER` | List users for team allocation |
| `/api/users` | POST | `ADMIN` | Create new organization user |
| `/api/users/:id` | GET | `ADMIN`, `PROJECT_MANAGER` | View individual user details |
| `/api/users/:id` | PATCH | `ADMIN` | Update name, role, department |
| `/api/users/:id/status`| PATCH | `ADMIN` | Update user status (ACTIVE/INACTIVE) |

---

## Security Implementations

1. **Helmet**: Configured security headers against cross-site scripting and sniffing.
2. **CORS**: Explicitly restricted to client URL `http://localhost:5173` with `credentials: true`. Wildcard `*` origins are rejected.
3. **HttpOnly Cookies**: JWT is inaccessible to JavaScript (`document.cookie`), mitigating XSS token theft.
4. **Rate Limiting**:
   - `authLimiter`: Strict 10 requests per 15 minutes for authentication endpoints to prevent brute-force attacks.
5. **bcrypt Password Hashing**: Passwords are salted (10 rounds) and hashed before persistence.
6. **No Password Leakage**: Passwords omitted via Mongoose `select: false` and schema `toJSON` deletion.
7. **Fail-Safe Startup**: [env.js](file:///d:/Project%20and%20Task%20Management/backend/src/config/env.js) checks required variables (`MONGODB_URI`, `JWT_SECRET`) and crashes cleanly with descriptive errors if absent.

---

## Request Validation (Zod)

Implemented in `src/validators/`:
- **Auth Validation**: Validates email format, presence of password.
- **User Creation**: Requires valid name, email format, minimum 8-character password, allowed role enum, allowed status enum.
- **User Update**: Whitelists only mutable fields (`name`, `role`, `department`). Disallows password updates through generic endpoint.
- **MongoDB ObjectId**: Validates 24-character hexadecimal ObjectId before database execution, preventing invalid BSON cast crashes.

---

## Error Handling Architecture

- [ApiError.js](file:///d:/Project%20and%20Task%20Management/backend/src/utils/ApiError.js): Subclass of `Error` carrying status code and structured errors.
- [asyncHandler.js](file:///d:/Project%20and%20Task%20Management/backend/src/utils/asyncHandler.js): Wraps all async route handlers, routing rejections directly to the centralized error middleware.
- [error.middleware.js](file:///d:/Project%20and%20Task%20Management/backend/src/middleware/error.middleware.js):
  - Handles Zod validation errors -> `400 Bad Request`.
  - Handles MongoDB duplicate key errors (code 11000) -> `409 Conflict`.
  - Handles Mongoose CastError -> `400 Bad Request`.
  - Handles JsonWebTokenError / TokenExpiredError -> `401 Unauthorized`.
  - Strips stack traces in production environment.

---

## Seed Accounts

Seeded via `npm run seed` in [seed.js](file:///d:/Project%20and%20Task%20Management/backend/scripts/seed.js):

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Rajesh Verma** | `ADMIN` | `admin@thinqloud.com` | `AdminPassword123!` |
| **Priya Sundaram** | `PROJECT_MANAGER` | `pm@thinqloud.com` | `ManagerPassword123!` |
| **Vikram Malhotra** | `TEAM_MEMBER` | `dev@thinqloud.com` | `DevPassword123!` |
| **Amit Deshmukh** | `TEAM_MEMBER` | `amit.d@thinqloud.com` | `DevPassword123!` |
| **Neha Varma** | `TEAM_MEMBER` | `neha.v@thinqloud.com` | `DevPassword123!` |

---

## Automated Test Results

Automated tests written in Vitest + Supertest with dedicated isolated test databases:
- **`tests/auth.test.js`** (8 tests):
  - Health check returns 200
  - Successful login sets HttpOnly cookie and returns safe user
  - Invalid password rejected with 401
  - Unknown email rejected with 401
  - Inactive user rejected with 403
  - Protected /auth/me returns current user
  - /auth/me without token rejected with 401
  - Logout clears authentication cookie
- **`tests/users.test.js`** (10 tests):
  - Admin can list all users
  - Team member cannot list users (403 Forbidden)
  - Admin can create new user
  - Non-admin cannot create user (403 Forbidden)
  - Duplicate email rejected with 409 Conflict
  - Invalid email rejected with 400 Bad Request
  - Admin can update user details
  - Admin can update user status
  - Unknown user returns 404
  - Invalid MongoDB ID returns 400 Bad Request

**Result: 18 / 18 tests passing.**

---

## Known Limitations & Phase 3 Boundary

1. **Projects & Tasks are Mock-Driven**: Projects and tasks remain stored in localStorage via `ProjectContext`. No Project or Task Mongoose models exist in Phase 2.
2. **ID Compatibility**: Backend MongoDB users use 24-character ObjectIds (`_id`). Frontend compatibility layers in `apiService.js` and `TeamPage.jsx` gracefully bridge MongoDB IDs and legacy mock IDs (`user-1`, `user-2`) by matching both ID and user full name.
3. **Password Resets**: Dedicated password change and email reset workflows will be implemented in later phases.
