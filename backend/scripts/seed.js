import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
import { Task, TASK_STATUS, TASK_PRIORITY } from '../src/models/Task.js';
import { Activity } from '../src/models/Activity.js';
import { hashPassword } from '../src/utils/password.js';

const seedUsers = [
  {
    name: 'Rajesh Kulkarni',
    email: 'admin@thinqloud.com',
    rawPassword: 'AdminPassword123!',
    role: USER_ROLES.ADMIN,
    department: 'Engineering Leadership',
    status: USER_STATUS.ACTIVE,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Priya Sundaram',
    email: 'pm@thinqloud.com',
    rawPassword: 'ManagerPassword123!',
    role: USER_ROLES.PROJECT_MANAGER,
    department: 'Product Delivery',
    status: USER_STATUS.ACTIVE,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sakshi Sharma',
    email: 'dev@thinqloud.com',
    rawPassword: 'DevPassword123!',
    role: USER_ROLES.TEAM_MEMBER,
    department: 'Platform Engineering',
    status: USER_STATUS.ACTIVE,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Amit Deshmukh',
    email: 'amit.d@thinqloud.com',
    rawPassword: 'DevPassword123!',
    role: USER_ROLES.TEAM_MEMBER,
    department: 'Core Services',
    status: USER_STATUS.ACTIVE,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Neha Verma',
    email: 'neha.v@thinqloud.com',
    rawPassword: 'DevPassword123!',
    role: USER_ROLES.TEAM_MEMBER,
    department: 'Experience Design',
    status: USER_STATUS.ACTIVE,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vikram Joshi',
    email: 'vikram.j@thinqloud.com',
    rawPassword: 'DevPassword123!',
    role: USER_ROLES.TEAM_MEMBER,
    department: 'QA & Security',
    status: USER_STATUS.ACTIVE,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Purging existing Activity, Task, Project, and User collections...');
    await Activity.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Hashing passwords and seeding accounts...');
    const userMap = {};
    for (const seed of seedUsers) {
      const hashedPassword = await hashPassword(seed.rawPassword);
      const createdUser = await User.create({
        name: seed.name,
        email: seed.email,
        password: hashedPassword,
        role: seed.role,
        department: seed.department,
        status: seed.status,
        avatar: seed.avatar,
      });
      userMap[seed.email] = createdUser;
    }

    console.log('[Seed] Seeding realistic enterprise projects...');
    const adminUser = userMap['admin@thinqloud.com'];
    const pmUser = userMap['pm@thinqloud.com'];
    const devUser = userMap['dev@thinqloud.com'];
    const amitUser = userMap['amit.d@thinqloud.com'];
    const nehaUser = userMap['neha.v@thinqloud.com'];
    const vikramUser = userMap['vikram.j@thinqloud.com'];

    const projectsToSeed = [
      {
        name: 'Enterprise Cloud Migration',
        code: 'PRJ-0001',
        description:
          'Migrate monolithic on-premise transactional systems to multi-region AWS cloud infrastructure with Kubernetes container orchestration and automated disaster recovery.',
        manager: pmUser._id,
        members: [pmUser._id, devUser._id, amitUser._id, vikramUser._id, adminUser._id],
        status: PROJECT_STATUS.ACTIVE,
        priority: PROJECT_PRIORITY.CRITICAL,
        category: 'Infrastructure',
        budget: '$180,000',
        startDate: new Date('2026-08-01'),
        dueDate: new Date('2026-11-30'),
        createdBy: adminUser._id,
      },
      {
        name: 'E-Commerce Payment Gateway 2.0',
        code: 'PRJ-0002',
        description:
          'Architect next-gen PCI-DSS compliant checkout and payment service integrating UPI, Stripe, Razorpay with sub-second failover and dynamic fraud detection.',
        manager: pmUser._id,
        members: [pmUser._id, devUser._id, amitUser._id, nehaUser._id],
        status: PROJECT_STATUS.ACTIVE,
        priority: PROJECT_PRIORITY.HIGH,
        category: 'Fintech & Security',
        budget: '$120,000',
        startDate: new Date('2026-07-10'),
        dueDate: new Date('2026-10-25'),
        createdBy: pmUser._id,
      },
      {
        name: 'HRMS Portal Modernization',
        code: 'PRJ-0003',
        description:
          'Redesign company-wide Human Resource Management System with unified employee onboarding, performance appraisals, leave management, and payroll analytics dashboard.',
        manager: adminUser._id,
        members: [adminUser._id, devUser._id, nehaUser._id],
        status: PROJECT_STATUS.ON_HOLD,
        priority: PROJECT_PRIORITY.MEDIUM,
        category: 'Internal Operations',
        budget: '$65,000',
        startDate: new Date('2026-06-01'),
        dueDate: new Date('2026-12-15'),
        createdBy: adminUser._id,
      },
      {
        name: 'Customer Analytics Engine',
        code: 'PRJ-0004',
        description:
          'AI-driven behavioral analytics pipeline processing real-time telemetry events to identify churn signals, feature adoption bottlenecks, and predictive NPS trends.',
        manager: pmUser._id,
        members: [pmUser._id, amitUser._id, nehaUser._id, devUser._id],
        status: PROJECT_STATUS.PLANNING,
        priority: PROJECT_PRIORITY.HIGH,
        category: 'Data Engineering',
        budget: '$95,000',
        startDate: new Date('2026-09-01'),
        dueDate: new Date('2027-01-31'),
        createdBy: pmUser._id,
      },
      {
        name: 'Mobile Banking Application',
        code: 'PRJ-0005',
        description:
          'Native iOS and Android retail banking experience featuring biometric authentication, scheduled UPI mandates, investment portfolios, and expense insights.',
        manager: adminUser._id,
        members: [adminUser._id, pmUser._id, devUser._id, amitUser._id, vikramUser._id],
        status: PROJECT_STATUS.ACTIVE,
        priority: PROJECT_PRIORITY.CRITICAL,
        category: 'Mobile Applications',
        budget: '$210,000',
        startDate: new Date('2026-05-15'),
        dueDate: new Date('2026-11-15'),
        createdBy: adminUser._id,
      },
    ];

    const projectDocs = [];
    for (const proj of projectsToSeed) {
      const doc = await Project.create(proj);
      projectDocs.push(doc);
    }
    const [cloudProj, paymentProj, hrmsProj, analyticsProj, mobileProj] = projectDocs;

    console.log('[Seed] Seeding realistic enterprise tasks across projects...');

    // Project 1: Cloud Migration Dependency Chain
    const task1 = await Task.create({
      title: 'Architect VPC & Multi-Region Transit Gateways',
      description: 'Define CIDR blocks, private subnets, NAT gateways, and peering across AWS regions.',
      project: cloudProj._id,
      assignee: devUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.COMPLETED,
      progress: 100,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-08-20'),
      completedAt: new Date('2026-08-18'),
      dependencies: [],
    });

    const task2 = await Task.create({
      title: 'Provision EKS Kubernetes Cluster Infrastructure',
      description: 'Deploy managed node groups with Terraform, configure CoreDNS and autoscaler.',
      project: cloudProj._id,
      assignee: devUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 75,
      startDate: new Date('2026-08-21'),
      dueDate: new Date('2026-10-15'),
      dependencies: [task1._id],
    });

    const task3 = await Task.create({
      title: 'Containerize and Migrate Core Services onto EKS',
      description: 'Helm charts deployment, secret management via Secrets Manager.',
      project: cloudProj._id,
      assignee: amitUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.BLOCKED,
      progress: 0,
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-11-10'),
      dependencies: [task2._id],
    });

    const task4 = await Task.create({
      title: 'Disaster Recovery and Failover Testing',
      description: 'Simulate region outage and verify automated Route 53 health-check failover.',
      project: cloudProj._id,
      assignee: adminUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-08-05'),
      dueDate: new Date('2026-09-15'), // Overdue
      dependencies: [task3._id],
    });

    // Project 2: E-Commerce Payment Gateway
    const task5 = await Task.create({
      title: 'PCI-DSS Compliance Tokenization Vault',
      description: 'Implement tokenization service using AES-256 GCM encryption keys.',
      project: paymentProj._id,
      assignee: devUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 50,
      startDate: new Date('2026-07-15'),
      dueDate: new Date('2026-10-10'),
      dependencies: [],
    });

    const task6 = await Task.create({
      title: 'Unified UPI Deep Linking & Webhook Handler',
      description: 'Integrate NPCI UPI rails with idempotency key deduplication.',
      project: paymentProj._id,
      assignee: amitUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-10-20'),
      dependencies: [task5._id],
    });

    const task7 = await Task.create({
      title: 'Checkout UI & Payment Modal Components',
      description: 'Build accessible payment sheet with instant error recovery.',
      project: paymentProj._id,
      assignee: nehaUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.COMPLETED,
      progress: 100,
      startDate: new Date('2026-08-10'),
      dueDate: new Date('2026-09-20'),
      completedAt: new Date('2026-09-18'),
      dependencies: [],
    });

    const task8 = await Task.create({
      title: 'Refund Automation & Settlement Reconciliation',
      description: 'Process batch merchant settlements with webhook dispatch.',
      project: paymentProj._id,
      assignee: vikramUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 40,
      startDate: new Date('2026-09-10'),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Upcoming due in 3 days!
      dependencies: [],
    });

    // Project 3: HRMS Portal
    const task9 = await Task.create({
      title: 'Employee Onboarding & Document Verification Workflow',
      description: 'Automate PDF document verification, e-signatures, and profile activation.',
      project: hrmsProj._id,
      assignee: devUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-06-15'),
      dueDate: new Date('2026-08-15'), // Overdue
      dependencies: [],
    });

    const task10 = await Task.create({
      title: 'Payroll Tax Calculator & Payslip Generator',
      description: 'Configure new tax regime brackets and generate monthly PDF payslips.',
      project: hrmsProj._id,
      assignee: nehaUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 30,
      startDate: new Date('2026-07-01'),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Upcoming due in 5 days!
      dependencies: [],
    });

    // Project 4: Customer Analytics Engine
    const task11 = await Task.create({
      title: 'Kafka Event Pipeline & Clickstream Ingestion',
      description: 'Stream client telemetry events at 50,000 eps into ClickHouse cluster.',
      project: analyticsProj._id,
      assignee: amitUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-09-01'),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Upcoming due in 4 days!
      dependencies: [],
    });

    const task12 = await Task.create({
      title: 'Churn Prediction Model Feature Store',
      description: 'Transform user interaction frequency into ML feature vectors.',
      project: analyticsProj._id,
      assignee: devUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-09-15'),
      dueDate: new Date('2026-11-30'),
      dependencies: [task11._id],
    });

    // Project 5: Mobile Banking Application
    const task13 = await Task.create({
      title: 'Biometric FaceID & Fingerprint Authentication Module',
      description: 'Integrate Keychain & Android KeyStore hardware-backed keystores.',
      project: mobileProj._id,
      assignee: devUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.COMPLETED,
      progress: 100,
      startDate: new Date('2026-05-20'),
      dueDate: new Date('2026-06-30'),
      completedAt: new Date('2026-06-28'),
      dependencies: [],
    });

    const task14 = await Task.create({
      title: 'Scheduled UPI Auto-Debit Mandate Interface',
      description: 'Build user flow for recurring utility bill subscriptions and mutual funds.',
      project: mobileProj._id,
      assignee: amitUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 60,
      startDate: new Date('2026-07-01'),
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Upcoming due in 6 days!
      dependencies: [task13._id],
    });

    const task15 = await Task.create({
      title: 'Investment Portfolio Real-Time Net Worth Graph',
      description: 'Render interactive SVG portfolio charts with daily NAV sync.',
      project: mobileProj._id,
      assignee: nehaUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-10-31'),
      dependencies: [],
    });

    const task16 = await Task.create({
      title: 'End-to-End Penetration Testing & OWASP Mobile Review',
      description: 'Static and dynamic vulnerability testing against reverse engineering and certificate pinning bypass.',
      project: mobileProj._id,
      assignee: vikramUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-07-15'),
      dueDate: new Date('2026-08-30'), // Overdue
      dependencies: [task14._id],
    });

    const totalSeededTasks = [
      task1, task2, task3, task4, task5, task6, task7, task8,
      task9, task10, task11, task12, task13, task14, task15, task16
    ];

    console.log('[Seed] Seeding audit trail and business activity records...');
    await Activity.create([
      {
        actor: adminUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'PROJECT',
        entityId: cloudProj._id,
        project: cloudProj._id,
        description: 'Created project "Enterprise Cloud Migration"',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        actor: pmUser._id,
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task1._id,
        project: cloudProj._id,
        description: 'Created task "Architect VPC & Multi-Region Transit Gateways"',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        actor: devUser._id,
        action: 'TASK_STATUS_CHANGED',
        entityType: 'TASK',
        entityId: task1._id,
        project: cloudProj._id,
        description: 'Marked task "Architect VPC & Multi-Region Transit Gateways" as COMPLETED',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        actor: pmUser._id,
        action: 'TASK_DEPENDENCY_ADDED',
        entityType: 'TASK',
        entityId: task2._id,
        project: cloudProj._id,
        description: 'Added dependency on task "Architect VPC & Multi-Region Transit Gateways"',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        actor: devUser._id,
        action: 'TASK_PROGRESS_CHANGED',
        entityType: 'TASK',
        entityId: task2._id,
        project: cloudProj._id,
        description: 'Updated progress of "Provision EKS Kubernetes Cluster Infrastructure" to 75%',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        actor: nehaUser._id,
        action: 'TASK_STATUS_CHANGED',
        entityType: 'TASK',
        entityId: task7._id,
        project: paymentProj._id,
        description: 'Completed "Checkout UI & Payment Modal Components"',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        actor: adminUser._id,
        action: 'PROJECT_MEMBER_ADDED',
        entityType: 'PROJECT',
        entityId: mobileProj._id,
        project: mobileProj._id,
        description: 'Added Vikram Joshi to project "Mobile Banking Application"',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('===========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY — MONGODB USERS, PROJECTS, TASKS, ACTIVITIES');
    console.log('===========================================================');
    console.log('Demo Credentials for Authentication:');
    seedUsers.forEach((u) => {
      console.log(`- [${u.role.padEnd(15)}] ${u.email.padEnd(25)} Password: ${u.rawPassword}`);
    });
    console.log('-----------------------------------------------------------');
    console.log(`Seeded ${projectsToSeed.length} projects successfully in MongoDB.`);
    console.log(`Seeded ${totalSeededTasks.length} tasks successfully with realistic dependencies.`);
    console.log(`Seeded realistic activity audit trail records in MongoDB.`);
    console.log('===========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
