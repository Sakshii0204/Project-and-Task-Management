import { connectDB, disconnectDB } from '../src/config/database.js';
import { User, USER_ROLES, USER_STATUS } from '../src/models/User.js';
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

    console.log('[Seed] Purging existing User collection...');
    await User.deleteMany({});

    console.log('[Seed] Hashing passwords and seeding accounts...');
    for (const seed of seedUsers) {
      const hashedPassword = await hashPassword(seed.rawPassword);
      await User.create({
        name: seed.name,
        email: seed.email,
        password: hashedPassword,
        role: seed.role,
        department: seed.department,
        status: seed.status,
        avatar: seed.avatar,
      });
    }

    console.log('===========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY — MONGODB USERS INITIALIZED');
    console.log('===========================================================');
    console.log('Demo Credentials for Authentication:');
    seedUsers.forEach((u) => {
      console.log(`- [${u.role.padEnd(15)}] ${u.email.padEnd(25)} Password: ${u.rawPassword}`);
    });
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
