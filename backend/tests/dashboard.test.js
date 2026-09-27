import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
import { Task, TASK_STATUS, TASK_PRIORITY } from '../src/models/Task.js';
import { hashPassword } from '../src/utils/password.js';
import { generateToken, TOKEN_COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/ptms_dashboard_test';

describe('Dashboard Analytics & Scoping API Tests (Phase 5)', () => {
  let adminUser;
  let pmUser;
  let otherPmUser;
  let memberUser;
  let otherMemberUser;

  let adminToken;
  let pmToken;
  let memberToken;

  beforeAll(async () => {
    await connectDB(TEST_DB_URI);
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await Task.deleteMany({});
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
      name: 'Other PM',
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

    otherMemberUser = await User.create({
      name: 'Other Member',
      email: 'othermember@test.com',
      password: passwordHash,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.ACTIVE,
    });

    adminToken = generateToken(adminUser._id);
    pmToken = generateToken(pmUser._id);
    memberToken = generateToken(memberUser._id);
  });

  it('Admin dashboard returns system-wide metrics and KPIs', async () => {
    const project = await Project.create({
      name: 'Global Project',
      code: 'PRJ-301',
      description: 'Global project description',
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.HIGH,
      manager: pmUser._id,
      members: [pmUser._id, memberUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: adminUser._id,
    });

    await Task.create([
      {
        title: 'Task 1',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.COMPLETED,
        progress: 100,
        createdBy: pmUser._id,
      },
      {
        title: 'Task 2',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.BLOCKED,
        progress: 50,
        createdBy: pmUser._id,
      },
    ]);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
    expect(res.body.data.metrics.totalProjects).toBe(1);
    expect(res.body.data.metrics.totalTasks).toBe(2);
    expect(res.body.data.metrics.completedTasks).toBe(1);
    expect(res.body.data.metrics.blockedTasks).toBe(1);
    expect(res.body.data.metrics.overallTaskCompletionRate).toBe(50);
  });

  it('PM dashboard scopes metrics strictly to managed/member projects', async () => {
    const pmProject = await Project.create({
      name: 'PM Project',
      code: 'PRJ-302',
      description: 'PM project description',
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.HIGH,
      manager: pmUser._id,
      members: [memberUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    const otherProject = await Project.create({
      name: 'Secret Project',
      code: 'PRJ-303',
      description: 'Secret project description',
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.MEDIUM,
      manager: otherPmUser._id,
      members: [otherMemberUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: otherPmUser._id,
    });

    await Task.create([
      {
        title: 'PM Task',
        project: pmProject._id,
        assignee: memberUser._id,
        status: TASK_STATUS.TODO,
        createdBy: pmUser._id,
      },
      {
        title: 'Secret Task 1',
        project: otherProject._id,
        assignee: otherMemberUser._id,
        status: TASK_STATUS.TODO,
        createdBy: otherPmUser._id,
      },
      {
        title: 'Secret Task 2',
        project: otherProject._id,
        assignee: otherMemberUser._id,
        status: TASK_STATUS.TODO,
        createdBy: otherPmUser._id,
      },
    ]);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('PROJECT_MANAGER');
    expect(res.body.data.metrics.managedProjects).toBe(1);
    expect(res.body.data.metrics.totalTasks).toBe(1); // Not 3
  });

  it('Team Member dashboard scopes metrics strictly to assigned work', async () => {
    const project = await Project.create({
      name: 'Team Project',
      code: 'PRJ-304',
      description: 'Team project description',
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.LOW,
      manager: pmUser._id,
      members: [memberUser._id, otherMemberUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    await Task.create([
      {
        title: 'Member Task',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.IN_PROGRESS,
        progress: 40,
        createdBy: pmUser._id,
      },
      {
        title: 'Other Member Task',
        project: project._id,
        assignee: otherMemberUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
        createdBy: pmUser._id,
      },
    ]);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('TEAM_MEMBER');
    expect(res.body.data.metrics.assignedTasks).toBe(1);
    expect(res.body.data.metrics.inProgressTasks).toBe(1);
  });

  it('Upcoming deadlines exclude completed tasks and sort nearest first', async () => {
    const project = await Project.create({
      name: 'Deadline Project',
      code: 'PRJ-305',
      description: 'Deadline project description',
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.HIGH,
      manager: pmUser._id,
      members: [memberUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Due Soon Completed',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.COMPLETED,
        dueDate: inTwoDays,
        createdBy: pmUser._id,
      },
      {
        title: 'Due Soon Active Later',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: inFourDays,
        createdBy: pmUser._id,
      },
      {
        title: 'Due Soon Active Earlier',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.TODO,
        dueDate: inTwoDays,
        createdBy: pmUser._id,
      },
      {
        title: 'Due Far Active',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.TODO,
        dueDate: inTenDays,
        createdBy: pmUser._id,
      },
    ]);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

    expect(res.status).toBe(200);
    const deadlines = res.body.data.upcomingDeadlines;
    expect(deadlines.length).toBe(2);
    expect(deadlines[0].title).toBe('Due Soon Active Earlier');
    expect(deadlines[1].title).toBe('Due Soon Active Later');
  });

  it('calculates project progress accurately with Phase 4 formula', async () => {
    const project = await Project.create({
      name: 'Progress Project',
      code: 'PRJ-306',
      description: 'Progress project description',
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.MEDIUM,
      manager: pmUser._id,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    await Task.create([
      {
        title: 'Task A',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.COMPLETED,
        progress: 100,
        createdBy: pmUser._id,
      },
      {
        title: 'Task B',
        project: project._id,
        assignee: memberUser._id,
        status: TASK_STATUS.IN_PROGRESS,
        progress: 50,
        createdBy: pmUser._id,
      },
    ]);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

    expect(res.status).toBe(200);
    const progressList = res.body.data.projectProgress;
    const item = progressList.find((p) => p.code === 'PRJ-306');
    expect(item).toBeDefined();
    expect(item.progress).toBe(75); // (100 + 50) / 2 = 75
    expect(item.totalTasks).toBe(2);
    expect(item.completedTasks).toBe(1);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});
