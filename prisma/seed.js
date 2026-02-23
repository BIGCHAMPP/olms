import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');
  
  // Create admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' }
  });
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin');
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@olms.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    });
    console.log('Created admin user');
  } else {
    console.log('Admin user already exists');
  }
  
  // Create default branch
  const existingBranch = await prisma.branch.findFirst();
  
  if (!existingBranch) {
    await prisma.branch.create({
      data: {
        name: 'Main Branch',
        address: 'Default Branch Address',
        phone: '+91 1234567890',
        email: 'main@olms.com',
        status: 'ACTIVE',
      }
    });
    console.log('Created default branch');
  } else {
    console.log('Branch already exists');
  }
  
  // Initialize default settings
  const settings = [
    { key: 'default_interest_rate', value: '12', description: 'Default annual interest rate (%)' },
    { key: 'loan_to_value_ratio', value: '75', description: 'Maximum loan to value ratio (%)' },
    { key: 'penalty_rate', value: '2', description: 'Penalty interest rate for overdue (%)' },
    { key: 'yellow_zone_threshold', value: '80', description: 'LTV threshold for yellow zone (%)' },
    { key: 'red_zone_threshold', value: '90', description: 'LTV threshold for red zone (%)' },
    { key: 'overdue_days_red', value: '15', description: 'Days overdue for red zone' },
  ];
  
  for (const setting of settings) {
    const existing = await prisma.setting.findUnique({
      where: { key: setting.key }
    });
    
    if (!existing) {
      await prisma.setting.create({ data: setting });
      console.log(`Created setting: ${setting.key}`);
    }
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
