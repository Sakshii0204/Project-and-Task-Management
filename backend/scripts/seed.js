import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
import { Task, TASK_STATUS, TASK_PRIORITY } from '../src/models/Task.js';
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
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Purging existing Task, Project, and User collections...');
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

    const projectsToSeed = [
      {
        name: 'Enterprise Cloud Migration',
        code: 'PRJ-0001',
        description:
          'Migrate monolithic on-premise transactional systems to multi-region AWS cloud infrastructure with Kubernetes container orchestration and automated disaster recovery.',
        manager: pmUser._id,
        members: [pmUser._id, devUser._id, amitUser._id, adminUser._id],
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
        members: [adminUser._id, pmUser._id, devUser._id, amitUser._id],
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
    const [cloudProj, paymentProj, hrmsProj] = projectDocs;

    console.log('[Seed] Seeding realistic enterprise tasks with dependency chains...');
    // Project 1: Cloud Migration Dependency Chain
    // T1: VPC & Network (COMPLETED, progress=100)
    // T2: Kubernetes Cluster (IN_PROGRESS, progress=70, depends on T1)
    // T3: Microservices Deployment (BLOCKED, progress=0, depends on T2)
    // T4: Security & Penetration Audit (TODO, progress=0, depends on T3, overdue demonstration)
    const task1 = await Task.create({
      title: 'Architect VPC & Multi-Region Transit Gateways',
      description: 'Define CIDR blocks, private subnets, NAT gateways, and peering across AWS ap-south-1 and us-east-1 regions.',
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
      description: 'Deploy managed node groups with Terraform, configure CoreDNS, cluster autoscaler, and Calico network policies.',
      project: cloudProj._id,
      assignee: devUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 70,
      startDate: new Date('2026-08-21'),
      dueDate: new Date('2026-10-15'),
      dependencies: [task1._id],
    });

    const task3 = await Task.create({
      title: 'Containerize and Migrate Core Services onto EKS',
      description: 'Helm charts deployment, secret management via AWS Secrets Manager, and ingress controller routing.',
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
      description: 'Simulate region outage and verify automated Route 53 health-check failover to backup cluster.',
      project: cloudProj._id,
      assignee: adminUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-08-05'),
      dueDate: new Date('2026-09-15'), // Overdue date
      dependencies: [task3._id],
    });

    // Project 2: E-Commerce Payment Gateway
    const task5 = await Task.create({
      title: 'PCI-DSS Compliance Tokenization Vault',
      description: 'Implement tokenization service using AES-256 GCM encryption keys stored in HSM.',
      project: paymentProj._id,
      assignee: devUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.CRITICAL,
      status: TASK_STATUS.IN_PROGRESS,
      progress: 45,
      startDate: new Date('2026-07-15'),
      dueDate: new Date('2026-10-10'),
      dependencies: [],
    });

    const task6 = await Task.create({
      title: 'Unified UPI Deep Linking & Webhook Handler',
      description: 'Integrate NPCI UPI rails with idempotency key deduplication and auto-refund webhooks.',
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
      description: 'Build sleek, accessible payment sheet with instant error recovery and fallback payment modes.',
      project: paymentProj._id,
      assignee: nehaUser._id,
      createdBy: pmUser._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-08-10'),
      dueDate: new Date('2026-10-25'),
      dependencies: [],
    });

    // Project 3: HRMS Portal
    const task8 = await Task.create({
      title: 'Employee Onboarding & Document Verification Workflow',
      description: 'Automate PDF document verification, e-signatures, and profile activation.',
      project: hrmsProj._id,
      assignee: devUser._id,
      createdBy: adminUser._id,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      progress: 0,
      startDate: new Date('2026-06-15'),
      dueDate: new Date('2026-08-15'), // Overdue date
      dependencies: [],
    });

    const totalSeededTasks = [task1, task2, task3, task4, task5, task6, task7, task8];

    console.log('===========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY — MONGODB USERS, PROJECTS, TASKS');
    console.log('===========================================================');
    console.log('Demo Credentials for Authentication:');
    seedUsers.forEach((u) => {
      console.log(`- [${u.role.padEnd(15)}] ${u.email.padEnd(25)} Password: ${u.rawPassword}`);
    });
    console.log('-----------------------------------------------------------');
    console.log(`Seeded ${projectsToSeed.length} projects successfully in MongoDB.`);
    console.log(`Seeded ${totalSeededTasks.length} tasks successfully with realistic dependencies.`);
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
