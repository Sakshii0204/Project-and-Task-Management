import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
import { hashPassword } from '../src/utils/password.js';
import { generateToken, TOKEN_COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/ptms_projects_test';

describe('Project Management & RBAC API Tests (Phase 3)', () => {
  let adminUser;
  let pmUser;
  let memberUser;
  let otherPmUser;
  let inactiveUser;

  let adminToken;
  let pmToken;
  let memberToken;
  let otherPmToken;

  beforeAll(async () => {
    await connectDB(TEST_DB_URI);
  });

  afterAll(async () => {
    await Project.deleteMany({});
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await hashPassword('Password123!');

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: passwordHash,
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    pmUser = await User.create({
      name: 'PM User',
      email: 'pm@test.com',
      password: passwordHash,
      role: USER_ROLES.PROJECT_MANAGER,
      status: USER_STATUS.ACTIVE,
    });

    otherPmUser = await User.create({
      name: 'Other PM User',
      email: 'otherpm@test.com',
      password: passwordHash,
      role: USER_ROLES.PROJECT_MANAGER,
      status: USER_STATUS.ACTIVE,
    });

    memberUser = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      password: passwordHash,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.ACTIVE,
    });

    inactiveUser = await User.create({
      name: 'Inactive User',
      email: 'inactive@test.com',
      password: passwordHash,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.INACTIVE,
    });

    adminToken = generateToken(adminUser._id);
    pmToken = generateToken(pmUser._id);
    otherPmToken = generateToken(otherPmUser._id);
    memberToken = generateToken(memberUser._id);
  });

  // ==========================================
  // CREATE PROJECT TESTS
  // ==========================================
  describe('POST /api/projects', () => {
    it('Admin can create a project successfully', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          name: 'Cloud Infrastructure Upgrade',
          description: 'Migrating infrastructure to AWS',
          manager: pmUser._id.toString(),
          members: [memberUser._id.toString()],
          priority: PROJECT_PRIORITY.HIGH,
          status: PROJECT_STATUS.PLANNING,
          startDate: '2026-10-01',
          dueDate: '2026-12-31',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toBeDefined();
      expect(res.body.data.project.name).toBe('Cloud Infrastructure Upgrade');
      expect(res.body.data.project.code).toMatch(/^PRJ-\d{4}$/);
      expect(res.body.data.project.manager._id).toBe(pmUser._id.toString());
      expect(res.body.data.project.members.length).toBe(2); // pm + member
    });

    it('Project Manager can create a project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({
          name: 'Payment Integration',
          description: 'UPI and card checkout',
          manager: pmUser._id.toString(),
          members: [memberUser._id.toString()],
          startDate: '2026-10-01',
          dueDate: '2026-11-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.code).toBeDefined();
    });

    it('Team Member cannot create a project (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({
          name: 'Unauthorized Project',
          manager: pmUser._id.toString(),
          startDate: '2026-10-01',
          dueDate: '2026-11-15',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Unauthenticated request is rejected with 401', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({
          name: 'No Auth Project',
          manager: pmUser._id.toString(),
          startDate: '2026-10-01',
          dueDate: '2026-11-15',
        });

      expect(res.status).toBe(401);
    });

    it('Rejects invalid date sequence (startDate > dueDate)', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          name: 'Backwards Timeline',
          manager: pmUser._id.toString(),
          startDate: '2026-12-31',
          dueDate: '2026-10-01',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Start date cannot be after due date');
    });

    it('Rejects inactive manager or invalid manager role', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          name: 'Inactive Manager Project',
          manager: inactiveUser._id.toString(),
          startDate: '2026-10-01',
          dueDate: '2026-11-15',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('inactive');
    });
  });

  // ==========================================
  // LIST PROJECTS & RBAC SCOPING
  // ==========================================
  describe('GET /api/projects', () => {
    let project1, project2, archivedProject;

    beforeEach(async () => {
      // project1 managed by pmUser, member is memberUser
      project1 = await Project.create({
        name: 'Alpha Project',
        code: 'PRJ-0001',
        description: 'First Project',
        manager: pmUser._id,
        members: [pmUser._id, memberUser._id],
        status: PROJECT_STATUS.ACTIVE,
        priority: PROJECT_PRIORITY.HIGH,
        startDate: new Date('2026-09-01'),
        dueDate: new Date('2026-12-01'),
        createdBy: adminUser._id,
      });

      // project2 managed by otherPmUser, member is adminUser only
      project2 = await Project.create({
        name: 'Beta Project',
        code: 'PRJ-0002',
        description: 'Second Project',
        manager: otherPmUser._id,
        members: [otherPmUser._id, adminUser._id],
        status: PROJECT_STATUS.PLANNING,
        priority: PROJECT_PRIORITY.LOW,
        startDate: new Date('2026-10-01'),
        dueDate: new Date('2027-01-01'),
        createdBy: otherPmUser._id,
      });

      archivedProject = await Project.create({
        name: 'Old Archived Project',
        code: 'PRJ-0003',
        description: 'Archived work',
        manager: pmUser._id,
        members: [pmUser._id],
        status: PROJECT_STATUS.ARCHIVED,
        archivedAt: new Date(),
        startDate: new Date('2025-01-01'),
        dueDate: new Date('2025-06-01'),
        createdBy: pmUser._id,
      });
    });

    it('Admin can list all non-archived projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it('Project Manager sees only managed/member projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].name).toBe('Alpha Project');
    });

    it('Team Member sees only projects they belong to', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].name).toBe('Alpha Project');
    });

    it('Search filtering works for name and code', async () => {
      const res = await request(app)
        .get('/api/projects?search=Alpha')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].code).toBe('PRJ-0001');
    });

    it('Pagination works correctly', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&limit=1')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.pagination.limit).toBe(1);
      expect(res.body.data.pagination.total).toBe(2);
      expect(res.body.data.pagination.pages).toBe(2);
    });

    it('Populated user fields never leak password hashes', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(200);
      const proj = res.body.data.projects[0];
      expect(proj.manager.password).toBeUndefined();
      expect(proj.members[0].password).toBeUndefined();
    });
  });

  // ==========================================
  // GET BY ID & RESOURCE AUTHORIZATION
  // ==========================================
  describe('GET /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Private PM Project',
        code: 'PRJ-0099',
        manager: pmUser._id,
        members: [pmUser._id],
        status: PROJECT_STATUS.ACTIVE,
        startDate: new Date('2026-10-01'),
        dueDate: new Date('2026-12-01'),
        createdBy: pmUser._id,
      });
    });

    it('Admin can view any project details', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('Private PM Project');
    });

    it('Unauthorized PM or Team Member is rejected with 403', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${otherPmToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Rejects invalid ObjectId with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/projects/not-a-valid-id')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(400);
    });

    it('Returns 404 for non-existent project', async () => {
      const nonExistent = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/projects/${nonExistent}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // UPDATE, STATUS & ARCHIVE
  // ==========================================
  describe('PATCH /api/projects/:id operations', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Initial Name',
        code: 'PRJ-0077',
        manager: pmUser._id,
        members: [pmUser._id],
        status: PROJECT_STATUS.PLANNING,
        startDate: new Date('2026-10-01'),
        dueDate: new Date('2026-12-01'),
        createdBy: pmUser._id,
      });
    });

    it('Project Manager can update their own project configuration', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({
          name: 'Renamed Project',
          description: 'Updated description',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('Renamed Project');
    });

    it('Unrelated PM cannot update project (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${otherPmToken}`])
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(403);
    });

    it('Status update works via dedicated endpoint', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ status: PROJECT_STATUS.COMPLETED });

      expect(res.status).toBe(200);
      expect(res.body.data.project.status).toBe(PROJECT_STATUS.COMPLETED);
    });

    it('Archive workflow sets status ARCHIVED and populates archivedAt', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}/archive`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.project.status).toBe(PROJECT_STATUS.ARCHIVED);
      expect(res.body.data.project.archivedAt).toBeDefined();
    });
  });

  // ==========================================
  // MEMBERSHIP & MANAGER REASSIGNMENT
  // ==========================================
  describe('Members & Manager Management', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Team Project',
        code: 'PRJ-0088',
        manager: pmUser._id,
        members: [pmUser._id],
        status: PROJECT_STATUS.ACTIVE,
        startDate: new Date('2026-10-01'),
        dueDate: new Date('2026-12-01'),
        createdBy: pmUser._id,
      });
    });

    it('PM can add an active member to the project', async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ userId: memberUser._id.toString() });

      expect(res.status).toBe(200);
      const memberIds = res.body.data.project.members.map((m) => m._id.toString());
      expect(memberIds).toContain(memberUser._id.toString());
    });

    it('Rejects duplicate member addition (409 Conflict)', async () => {
      await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ userId: memberUser._id.toString() });

      const res = await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ userId: memberUser._id.toString() });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already a member');
    });

    it('PM can remove a member from the project', async () => {
      // First add member
      await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ userId: memberUser._id.toString() });

      // Then remove member
      const res = await request(app)
        .delete(`/api/projects/${project._id}/members/${memberUser._id.toString()}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

      expect(res.status).toBe(200);
      const memberIds = res.body.data.project.members.map((m) => m._id.toString());
      expect(memberIds).not.toContain(memberUser._id.toString());
    });

    it('Cannot remove designated Project Manager from members without reassigning first', async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}/members/${pmUser._id.toString()}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot remove the designated Project Manager');
    });

    it('Admin can reassign project manager', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}/manager`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ manager: otherPmUser._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.project.manager._id).toBe(otherPmUser._id.toString());
      const memberIds = res.body.data.project.members.map((m) => m._id.toString());
      expect(memberIds).toContain(otherPmUser._id.toString());
    });

    it('Non-admin cannot reassign project manager (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}/manager`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ manager: otherPmUser._id.toString() });

      expect(res.status).toBe(403);
    });
  });
});
