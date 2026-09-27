import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
import { Task, TASK_STATUS, TASK_PRIORITY } from '../src/models/Task.js';
import { Activity } from '../src/models/Activity.js';
import { hashPassword } from '../src/utils/password.js';
import { generateToken, TOKEN_COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/ptms_activities_test';

describe('Activity & Audit Trail API Tests (Phase 5)', () => {
  let adminUser;
  let pmUser;
  let otherPmUser;
  let memberUser;
  let adminToken;
  let pmToken;
  let otherPmToken;
  let memberToken;

  beforeAll(async () => {
    await connectDB(TEST_DB_URI);
  });

  afterAll(async () => {
    await Activity.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    await Activity.deleteMany({});
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

    adminToken = generateToken(adminUser._id);
    pmToken = generateToken(pmUser._id);
    otherPmToken = generateToken(otherPmUser._id);
    memberToken = generateToken(memberUser._id);
  });

  it('generates activity record on project creation', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
      .send({
        name: 'Alpha Project',
        description: 'First test project',
        priority: PROJECT_PRIORITY.HIGH,
        manager: pmUser._id.toString(),
        startDate: '2026-10-01',
        dueDate: '2026-12-31',
      });

    expect(res.status).toBe(201);

    const activities = await Activity.find({ entityType: 'PROJECT' });
    expect(activities.length).toBe(1);
    expect(activities[0].action).toBe('PROJECT_CREATED');
    expect(activities[0].actor.toString()).toBe(adminUser._id.toString());
    expect(activities[0].project.toString()).toBe(res.body.data.project._id.toString());
  });

  it('generates activity record on task creation', async () => {
    const project = await Project.create({
      name: 'Dev Project',
      code: 'PRJ-201',
      description: 'Dev project description',
      manager: pmUser._id,
      members: [pmUser._id, memberUser._id],
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.HIGH,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
      .send({
        title: 'Build API',
        project: project._id.toString(),
        priority: TASK_PRIORITY.HIGH,
        assignee: memberUser._id.toString(),
      });

    expect(res.status).toBe(201);

    const activities = await Activity.find({ entityType: 'TASK', action: 'TASK_CREATED' });
    expect(activities.length).toBe(1);
    expect(activities[0].actor.toString()).toBe(pmUser._id.toString());
    expect(activities[0].project.toString()).toBe(project._id.toString());
  });

  it('generates activity record on task status and progress update', async () => {
    const project = await Project.create({
      name: 'Workflow Project',
      code: 'PRJ-202',
      description: 'Workflow project',
      manager: pmUser._id,
      members: [memberUser._id],
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.MEDIUM,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    const task = await Task.create({
      title: 'Setup DB',
      project: project._id,
      assignee: memberUser._id,
      status: TASK_STATUS.TODO,
      progress: 0,
      createdBy: pmUser._id,
    });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}/status`)
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
      .send({
        status: TASK_STATUS.IN_PROGRESS,
        progress: 50,
      });

    expect(res.status).toBe(200);

    const activities = await Activity.find({
      entityId: task._id,
      action: { $in: ['TASK_STATUS_CHANGED', 'TASK_PROGRESS_CHANGED'] },
    });
    expect(activities.length).toBeGreaterThanOrEqual(1);
  });

  it('generates activity record on project archive', async () => {
    const project = await Project.create({
      name: 'Archive Me',
      code: 'PRJ-203',
      description: 'Archive project',
      manager: pmUser._id,
      members: [pmUser._id],
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.LOW,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    const res = await request(app)
      .patch(`/api/projects/${project._id}/archive`)
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

    expect(res.status).toBe(200);

    const activity = await Activity.findOne({ action: 'PROJECT_ARCHIVED' });
    expect(activity).not.toBeNull();
    expect(activity.project.toString()).toBe(project._id.toString());
  });

  it('Admin can view all activities across projects', async () => {
    const projectA = await Project.create({
      name: 'Project A',
      code: 'PRJ-204',
      description: 'Desc A',
      manager: pmUser._id,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: adminUser._id,
    });
    const projectB = await Project.create({
      name: 'Project B',
      code: 'PRJ-205',
      description: 'Desc B',
      manager: otherPmUser._id,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: otherPmUser._id,
    });

    await Activity.create([
      {
        actor: adminUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projectA._id,
        project: projectA._id,
        description: 'Created Project A',
      },
      {
        actor: otherPmUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projectB._id,
        project: projectB._id,
        description: 'Created Project B',
      },
    ]);

    const res = await request(app)
      .get('/api/activities')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('PM only sees activities for managed or member projects', async () => {
    const projectA = await Project.create({
      name: 'Project A',
      code: 'PRJ-206',
      description: 'Desc A',
      manager: pmUser._id,
      members: [pmUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });
    const projectB = await Project.create({
      name: 'Project B',
      code: 'PRJ-207',
      description: 'Desc B',
      manager: otherPmUser._id,
      members: [otherPmUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: otherPmUser._id,
    });

    await Activity.create([
      {
        actor: pmUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projectA._id,
        project: projectA._id,
        description: 'Activity in PM Project',
      },
      {
        actor: otherPmUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projectB._id,
        project: projectB._id,
        description: 'Activity in Other PM Project',
      },
    ]);

    const res = await request(app)
      .get('/api/activities')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].description).toBe('Activity in PM Project');
  });

  it('Team Member does not see unauthorized project activities', async () => {
    const projectA = await Project.create({
      name: 'Project A',
      code: 'PRJ-208',
      description: 'Desc A',
      manager: pmUser._id,
      members: [memberUser._id],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });
    const projectB = await Project.create({
      name: 'Project B',
      code: 'PRJ-209',
      description: 'Desc B',
      manager: otherPmUser._id,
      members: [],
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: otherPmUser._id,
    });

    await Activity.create([
      {
        actor: pmUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projectA._id,
        project: projectA._id,
        description: 'Allowed Activity',
      },
      {
        actor: otherPmUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: projectB._id,
        project: projectB._id,
        description: 'Forbidden Activity',
      },
    ]);

    const res = await request(app)
      .get('/api/activities')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].description).toBe('Allowed Activity');
  });

  it('supports pagination and entityType filtering', async () => {
    const project = await Project.create({
      name: 'Project P',
      code: 'PRJ-210',
      description: 'Pagination project',
      manager: pmUser._id,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: pmUser._id,
    });

    for (let i = 1; i <= 5; i++) {
      await Activity.create({
        actor: adminUser._id,
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: project._id,
        project: project._id,
        description: `Task ${i}`,
      });
    }

    const res = await request(app)
      .get('/api/activities?entityType=TASK&page=1&limit=3')
      .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.pages).toBe(2);
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/activities');
    expect(res.status).toBe(401);
  });
});
