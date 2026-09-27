import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
import { Project, PROJECT_STATUS, PROJECT_PRIORITY } from '../src/models/Project.js';
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

    console.log('[Seed] Purging existing User and Project collections...');
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

    for (const proj of projectsToSeed) {
      await Project.create(proj);
    }

    console.log('===========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY — MONGODB USERS & PROJECTS');
    console.log('===========================================================');
    console.log('Demo Credentials for Authentication:');
    seedUsers.forEach((u) => {
      console.log(`- [${u.role.padEnd(15)}] ${u.email.padEnd(25)} Password: ${u.rawPassword}`);
    });
    console.log('-----------------------------------------------------------');
    console.log(`Seeded ${projectsToSeed.length} projects successfully in MongoDB.`);
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
