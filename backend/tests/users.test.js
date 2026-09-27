import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';
import { generateToken, TOKEN_COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/ptms_users_test';

describe('Users & RBAC API Tests', () => {
  let adminCookie;
  let pmCookie;
  let memberCookie;

  beforeAll(async () => {
    await connectDB(TEST_DB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    const pw = await hashPassword('TestPassword123!');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin_test@test.com',
      password: pw,
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    const pm = await User.create({
      name: 'PM User',
      email: 'pm_test@test.com',
      password: pw,
      role: USER_ROLES.PROJECT_MANAGER,
      status: USER_STATUS.ACTIVE,
    });

    const member = await User.create({
      name: 'Member User',
      email: 'member_test@test.com',
      password: pw,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.ACTIVE,
    });

    adminCookie = [`${TOKEN_COOKIE_NAME}=${generateToken(admin._id)}`];
    pmCookie = [`${TOKEN_COOKIE_NAME}=${generateToken(pm._id)}`];
    memberCookie = [`${TOKEN_COOKIE_NAME}=${generateToken(member._id)}`];
  });

  it('TEAM_MEMBER should be denied from listing all users (403)', async () => {
    const res = await request(app).get('/api/users').set('Cookie', memberCookie);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PROJECT_MANAGER should be allowed to view user directory (200)', async () => {
    const res = await request(app).get('/api/users').set('Cookie', pmCookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(3);
  });

  it('PROJECT_MANAGER should be denied from creating a user (403)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', pmCookie)
      .send({
        name: 'New Dev',
        email: 'newdev@test.com',
        password: 'Password123!',
        role: USER_ROLES.TEAM_MEMBER,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('ADMIN should be allowed to create a user (201)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'Aarav Sharma',
        email: 'aarav@test.com',
        password: 'SecurePassword123!',
        role: USER_ROLES.TEAM_MEMBER,
        department: 'Engineering',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('aarav@test.com');
    expect(res.body.data.user.password).toBeUndefined(); // Password hash never exposed
  });

  it('ADMIN creating user with duplicate email should be rejected with 409', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'Duplicate Admin',
        email: 'admin_test@test.com',
        password: 'SecurePassword123!',
        role: USER_ROLES.TEAM_MEMBER,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('ADMIN creating user with invalid email format should be rejected with 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'Bad Email User',
        email: 'not-an-email',
        password: 'SecurePassword123!',
        role: USER_ROLES.TEAM_MEMBER,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('ADMIN creating user with invalid role should be rejected with 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'Bad Role User',
        email: 'badrole@test.com',
        password: 'SecurePassword123!',
        role: 'SUPER_HERO',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('ADMIN should be allowed to update user status (200)', async () => {
    const targetUser = await User.findOne({ email: 'member_test@test.com' });

    const res = await request(app)
      .patch(`/api/users/${targetUser._id}/status`)
      .set('Cookie', adminCookie)
      .send({
        status: USER_STATUS.INACTIVE,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.status).toBe(USER_STATUS.INACTIVE);
  });

  it('GET /api/users/:id with invalid MongoDB ObjectId should return 400', async () => {
    const res = await request(app)
      .get('/api/users/not-a-valid-object-id')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/users/:id with unknown non-existent ObjectId should return 404', async () => {
    const res = await request(app)
      .get('/api/users/507f1f77bcf86cd799439011')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
