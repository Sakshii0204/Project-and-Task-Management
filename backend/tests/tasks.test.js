import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
import { Task, TASK_STATUS, TASK_PRIORITY } from '../src/models/Task.js';
import { hashPassword } from '../src/utils/password.js';
import { generateToken, TOKEN_COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/ptms_tasks_test';

describe('Task Management & Dependencies Test Suite (Phase 4)', () => {
  let adminUser;
  let pmUser;
  let otherPmUser;
  let memberUser;
  let memberUser2;
  let inactiveUser;

  let adminToken;
  let pmToken;
  let otherPmToken;
  let memberToken;

  let activeProject;
  let archivedProject;
  let otherProject;

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
      name: 'Other PM User',
      email: 'otherpm@test.com',
      password: passwordHash,
      role: USER_ROLES.PROJECT_MANAGER,
      status: USER_STATUS.ACTIVE,
    });

    memberUser = await User.create({
      name: 'Team Member 1',
      email: 'member1@test.com',
      password: passwordHash,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.ACTIVE,
    });

    memberUser2 = await User.create({
      name: 'Team Member 2',
      email: 'member2@test.com',
      password: passwordHash,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.ACTIVE,
    });

    inactiveUser = await User.create({
      name: 'Inactive Dev',
      email: 'inactive@test.com',
      password: passwordHash,
      role: USER_ROLES.TEAM_MEMBER,
      status: USER_STATUS.INACTIVE,
    });

    adminToken = generateToken(adminUser._id);
    pmToken = generateToken(pmUser._id);
    otherPmToken = generateToken(otherPmUser._id);
    memberToken = generateToken(memberUser._id);

    activeProject = await Project.create({
      name: 'Active Cloud Project',
      code: 'PRJ-101',
      description: 'Active cloud deployment project',
      manager: pmUser._id,
      members: [pmUser._id, memberUser._id, memberUser2._id],
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.HIGH,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-11-30'),
      createdBy: adminUser._id,
    });

    archivedProject = await Project.create({
      name: 'Archived Project',
      code: 'PRJ-102',
      description: 'Legacy decommissioned project',
      manager: pmUser._id,
      members: [pmUser._id, memberUser._id],
      status: PROJECT_STATUS.ARCHIVED,
      priority: PROJECT_PRIORITY.LOW,
      startDate: new Date('2026-05-01'),
      dueDate: new Date('2026-07-31'),
      createdBy: adminUser._id,
      isArchived: true,
    });

    otherProject = await Project.create({
      name: 'Other PM Project',
      code: 'PRJ-103',
      description: 'Project managed by different PM',
      manager: otherPmUser._id,
      members: [otherPmUser._id, memberUser2._id],
      status: PROJECT_STATUS.ACTIVE,
      priority: PROJECT_PRIORITY.MEDIUM,
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-12-31'),
      createdBy: otherPmUser._id,
    });
  });

  describe('1. Task Creation & RBAC / Validation', () => {
    it('ADMIN can create a task in any active project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          title: 'Infrastructure Provisioning',
          description: 'Deploy VPC and subnets',
          project: activeProject._id.toString(),
          assignee: memberUser._id.toString(),
          priority: TASK_PRIORITY.HIGH,
          startDate: '2026-09-01T00:00:00.000Z',
          dueDate: '2026-09-30T00:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Infrastructure Provisioning');
      expect(res.body.data.task.status).toBe(TASK_STATUS.TODO);
      expect(res.body.data.task.progress).toBe(0);
      expect(res.body.data.task.createdBy._id.toString()).toBe(adminUser._id.toString());
    });

    it('PROJECT_MANAGER can create a task in a project they manage', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({
          title: 'Setup Kubernetes Cluster',
          description: 'EKS cluster configuration',
          project: activeProject._id.toString(),
          assignee: memberUser._id.toString(),
          priority: TASK_PRIORITY.CRITICAL,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Setup Kubernetes Cluster');
    });

    it('PROJECT_MANAGER cannot create a task in an unrelated project they do not manage', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({
          title: 'Unauthorized Task',
          project: otherProject._id.toString(),
          assignee: memberUser2._id.toString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/manage/i);
    });

    it('TEAM_MEMBER cannot create tasks', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({
          title: 'Member Create Attempt',
          project: activeProject._id.toString(),
          assignee: memberUser._id.toString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('rejects task creation on archived project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          title: 'Task on Archived Project',
          project: archivedProject._id.toString(),
          assignee: memberUser._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/archived/i);
    });

    it('rejects assignee who is inactive', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          title: 'Task for Inactive User',
          project: activeProject._id.toString(),
          assignee: inactiveUser._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/active/i);
    });

    it('rejects assignee who is not a member of the project', async () => {
      // otherPmUser is not a member of activeProject
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          title: 'Non-member Assignee',
          project: activeProject._id.toString(),
          assignee: otherPmUser._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/member of this project/i);
    });

    it('rejects startDate greater than dueDate', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          title: 'Invalid Dates Task',
          project: activeProject._id.toString(),
          assignee: memberUser._id.toString(),
          startDate: '2026-10-15T00:00:00.000Z',
          dueDate: '2026-09-01T00:00:00.000Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects progress outside 0-100', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({
          title: 'Invalid Progress',
          project: activeProject._id.toString(),
          assignee: memberUser._id.toString(),
          progress: 150,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Dependency Rules & DFS Cycle Detection', () => {
    let taskA;
    let taskB;
    let taskC;
    let crossTask;

    beforeEach(async () => {
      taskA = await Task.create({
        title: 'Task A (Database Design)',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: adminUser._id,
      });

      taskB = await Task.create({
        title: 'Task B (Backend API)',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: adminUser._id,
      });

      taskC = await Task.create({
        title: 'Task C (Frontend Integration)',
        project: activeProject._id,
        assignee: memberUser2._id,
        createdBy: adminUser._id,
      });

      crossTask = await Task.create({
        title: 'Cross Project Task',
        project: otherProject._id,
        assignee: memberUser2._id,
        createdBy: otherPmUser._id,
      });
    });

    it('successfully adds valid dependency (Task B depends on Task A)', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskB._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskA._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.dependencies.length).toBe(1);
      expect(res.body.data.task.dependencies[0]._id.toString()).toBe(taskA._id.toString());
    });

    it('rejects self-dependency (Task A depends on Task A)', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskA._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskA._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot depend on itself/i);
    });

    it('rejects cross-project dependency', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskA._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: crossTask._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/same project/i);
    });

    it('rejects duplicate dependency', async () => {
      // Add first time
      await request(app)
        .post(`/api/tasks/${taskB._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskA._id.toString() });

      // Add second time
      const res = await request(app)
        .post(`/api/tasks/${taskB._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskA._id.toString() });

      expect([400, 409]).toContain(res.status);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('detects and rejects circular dependency (A -> B -> C -> A)', async () => {
      // Chain: B depends on A
      await request(app)
        .post(`/api/tasks/${taskB._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskA._id.toString() });

      // Chain: C depends on B
      await request(app)
        .post(`/api/tasks/${taskC._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskB._id.toString() });

      // Attempt: A depends on C (Forms cycle: A -> C -> B -> A)
      const res = await request(app)
        .post(`/api/tasks/${taskA._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskC._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/circular dependency/i);
    });

    it('removes dependency cleanly', async () => {
      await request(app)
        .post(`/api/tasks/${taskB._id}/dependencies`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`])
        .send({ dependencyId: taskA._id.toString() });

      const removeRes = await request(app)
        .delete(`/api/tasks/${taskB._id}/dependencies/${taskA._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(removeRes.status).toBe(200);
      expect(removeRes.body.success).toBe(true);
      expect(removeRes.body.data.task.dependencies.length).toBe(0);
    });
  });

  describe('3. Blocked Logic & Execution Constraints', () => {
    let prereqTask;
    let dependentTask;

    beforeEach(async () => {
      prereqTask = await Task.create({
        title: 'Prerequisite API',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.IN_PROGRESS,
        progress: 50,
      });

      dependentTask = await Task.create({
        title: 'Dependent UI Screen',
        project: activeProject._id,
        assignee: memberUser2._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
        dependencies: [prereqTask._id],
      });
    });

    it('correctly marks dependent task as blocked when prerequisite is not completed', async () => {
      const res = await request(app)
        .get(`/api/tasks/${dependentTask._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.task.isBlocked).toBe(true);
      expect(res.body.data.task.blockingDependencies.length).toBe(1);
    });

    it('rejects marking a blocked task COMPLETED while prerequisite remains incomplete', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${dependentTask._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ status: TASK_STATUS.COMPLETED });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/prerequisite|incomplete/i);
    });

    it('allows marking dependent task COMPLETED once prerequisite is COMPLETED', async () => {
      // Complete prerequisite
      await request(app)
        .patch(`/api/tasks/${prereqTask._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ status: TASK_STATUS.COMPLETED });

      // Verify dependent task is now unblocked
      const checkRes = await request(app)
        .get(`/api/tasks/${dependentTask._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);
      expect(checkRes.body.data.task.isBlocked).toBe(false);

      // Complete dependent task
      const completeRes = await request(app)
        .patch(`/api/tasks/${dependentTask._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`])
        .send({ status: TASK_STATUS.COMPLETED });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.task.status).toBe(TASK_STATUS.COMPLETED);
      expect(completeRes.body.data.task.progress).toBe(100);
      expect(completeRes.body.data.task.completedAt).toBeDefined();
    });
  });

  describe('4. Status & Progress Consistency', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await Task.create({
        title: 'Feature Testing',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
      });
    });

    it('setting progress to 100 automatically sets status to COMPLETED and sets completedAt', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTask._id}/progress`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({ progress: 100 });

      expect(res.status).toBe(200);
      expect(res.body.data.task.progress).toBe(100);
      expect(res.body.data.task.status).toBe(TASK_STATUS.COMPLETED);
      expect(res.body.data.task.completedAt).toBeDefined();
    });

    it('setting status to COMPLETED automatically sets progress to 100', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({ status: TASK_STATUS.COMPLETED });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe(TASK_STATUS.COMPLETED);
      expect(res.body.data.task.progress).toBe(100);
      expect(res.body.data.task.completedAt).toBeDefined();
    });

    it('reopening a completed task clears completedAt and resets progress if still 100', async () => {
      // First complete
      await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({ status: TASK_STATUS.COMPLETED });

      // Reopen to IN_PROGRESS
      const reopenRes = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({ status: TASK_STATUS.IN_PROGRESS });

      expect(reopenRes.status).toBe(200);
      expect(reopenRes.body.data.task.status).toBe(TASK_STATUS.IN_PROGRESS);
      expect(reopenRes.body.data.task.completedAt).toBeNull();
      expect(reopenRes.body.data.task.progress).toBeLessThan(100);
    });
  });

  describe('5. Role Authorization & Team Member Field Restrictions', () => {
    let teamMemberTask;

    beforeEach(async () => {
      teamMemberTask = await Task.create({
        title: 'Team Member Task',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
      });
    });

    it('TEAM_MEMBER can update status and progress of their own assigned task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${teamMemberTask._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({
          status: TASK_STATUS.IN_PROGRESS,
          progress: 35,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe(TASK_STATUS.IN_PROGRESS);
      expect(res.body.data.task.progress).toBe(35);
    });

    it('TEAM_MEMBER cannot reassign their task or change title/project', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${teamMemberTask._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({
          assignee: memberUser2._id.toString(),
          title: 'Hacked Title',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only update status and progress/i);
    });

    it('TEAM_MEMBER cannot update tasks assigned to other team members', async () => {
      const otherMemberTask = await Task.create({
        title: 'Member 2 Task',
        project: activeProject._id,
        assignee: memberUser2._id,
        createdBy: pmUser._id,
      });

      const res = await request(app)
        .patch(`/api/tasks/${otherMemberTask._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`])
        .send({ status: TASK_STATUS.IN_PROGRESS });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Overdue, My Tasks, and Role Scoping', () => {
    beforeEach(async () => {
      // Past due task
      await Task.create({
        title: 'Overdue Task Member 1',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      });

      // Completed late task (should NOT be overdue)
      await Task.create({
        title: 'Late Completed Task',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.COMPLETED,
        progress: 100,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      });

      // Future task
      await Task.create({
        title: 'Future Task Member 1',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.IN_PROGRESS,
        progress: 50,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Task for Member 2 in other project
      await Task.create({
        title: 'Overdue Task Member 2',
        project: otherProject._id,
        assignee: memberUser2._id,
        createdBy: otherPmUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    });

    it('GET /api/tasks/my returns only authenticated user assigned tasks', async () => {
      const res = await request(app)
        .get('/api/tasks/my')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(3);
      res.body.data.tasks.forEach((t) => {
        expect(t.assignee._id.toString()).toBe(memberUser._id.toString());
      });
    });

    it('GET /api/tasks/overdue returns overdue tasks scoped to role', async () => {
      // Member 1 receives only their overdue task
      const memberRes = await request(app)
        .get('/api/tasks/overdue')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${memberToken}`]);

      expect(memberRes.status).toBe(200);
      expect(memberRes.body.data.tasks.length).toBe(1);
      expect(memberRes.body.data.tasks[0].title).toBe('Overdue Task Member 1');

      // Admin receives all overdue tasks across system
      const adminRes = await request(app)
        .get('/api/tasks/overdue')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.tasks.length).toBe(2);
    });
  });

  describe('7. Project Progress & Metrics Calculation', () => {
    it('accurately calculates project progress as SUM(progress) / totalTasks', async () => {
      await Task.create({
        title: 'T1',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.COMPLETED,
        progress: 100,
      });

      await Task.create({
        title: 'T2',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.IN_PROGRESS,
        progress: 50,
      });

      await Task.create({
        title: 'T3',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: pmUser._id,
        status: TASK_STATUS.TODO,
        progress: 0,
      });

      // Expected progress: (100 + 50 + 0) / 3 = 50%
      const res = await request(app)
        .get(`/api/tasks/project/${activeProject._id}/metrics`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${pmToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.progress).toBe(50);
      expect(res.body.data.metrics.totalTasks).toBe(3);
      expect(res.body.data.metrics.completedTasks).toBe(1);
      expect(res.body.data.metrics.inProgressTasks).toBe(1);
      expect(res.body.data.metrics.todoTasks).toBe(1);
    });
  });

  describe('8. Security & Input Sanitization', () => {
    it('unauthenticated request is rejected with 401', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    it('never leaks user password in populated task responses', async () => {
      const created = await Task.create({
        title: 'Security Sanitization Check',
        project: activeProject._id,
        assignee: memberUser._id,
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .get(`/api/tasks/${created._id}`)
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.task.assignee.password).toBeUndefined();
      expect(res.body.data.task.createdBy.password).toBeUndefined();
    });

    it('invalid ObjectId param returns 400', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-valid-object-id')
        .set('Cookie', [`${TOKEN_COOKIE_NAME}=${adminToken}`]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
