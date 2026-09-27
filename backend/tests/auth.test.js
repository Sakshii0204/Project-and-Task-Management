import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';
import { generateToken, TOKEN_COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/ptms_auth_test';

describe('Auth & Health API Tests', () => {
  beforeAll(async () => {
    await connectDB(TEST_DB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Seed test users
    const adminPassword = await hashPassword('AdminPassword123!');
    await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: adminPassword,
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    const inactivePassword = await hashPassword('InactivePassword123!');
    await User.create({
      name: 'Inactive Test',
      email: 'inactive@test.com',
      password: inactivePassword,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.INACTIVE,
    });
  });

  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('running');
  });

  it('POST /api/auth/login should authenticate valid user and set HttpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@test.com');
    expect(res.body.data.user.password).toBeUndefined();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = cookies.find((c) => c.startsWith(`${TOKEN_COOKIE_NAME}=`));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain('HttpOnly');
  });

  it('POST /api/auth/login should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should reject non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'SomePassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should reject inactive user with 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'inactive@test.com',
        password: 'InactivePassword123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return current user when cookie is present', async () => {
    const user = await User.findOne({ email: 'admin@test.com' });
    const token = generateToken(user._id);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${token}`]);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('admin@test.com');
    expect(meRes.body.data.user.role).toBe(USER_ROLES.ADMIN);
  });

  it('POST /api/auth/logout should clear authentication cookie', async () => {
    const user = await User.findOne({ email: 'admin@test.com' });
    const token = generateToken(user._id);

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${token}`]);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const logoutCookies = logoutRes.headers['set-cookie'];
    const tokenCookie = logoutCookies.find((c) => c.startsWith(`${TOKEN_COOKIE_NAME}=`));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain('Expires=Thu, 01 Jan 1970');
  });
});
