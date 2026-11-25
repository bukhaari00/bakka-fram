import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../apps/api/src/utils/security.js';
import { v4 as uuidv4 } from 'uuid';

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_iYnjx4fPCw8X@ep-lingering-cake-bdqks0e6-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log('Connecting to database...');

  // 1. Ensure Default Farm
  let farm = await prisma.farm.findFirst({ where: { code: 'BAKKA-01' } });
  if (!farm) {
    farm = await prisma.farm.create({
      data: {
        id: uuidv4(),
        name: 'Bakka Farm',
        code: 'BAKKA-01',
        location: 'Afgooye River Valley, Lower Shabelle',
        contact_phone: '+252-61-5550199',
        contact_email: 'info@bakkafarm.com',
        currency: 'USD',
        timezone: 'Africa/Mogadishu',
        default_language: 'en'
      }
    });
    console.log('Created default farm:', farm.id);
  } else {
    console.log('Default farm verified:', farm.id);
  }

  // 2. Ensure Roles
  const roles = ['ADMIN', 'MANAGER', 'STAFF', 'STUDENT', 'CUSTOMER'];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { id: uuidv4(), name: r, description: `Bakka Farm role: ${r}` }
    });
  }
  console.log('Roles verified.');

  // 3. Create or Update Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bakkafarm.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'BakkaAdmin2026!';
  const adminName = process.env.ADMIN_NAME || 'Bakka Farm Administrator';

  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      farm_id: farm.id,
      full_name: adminName,
      role_name: 'ADMIN',
      password_hash: passwordHash,
      is_active: true
    },
    create: {
      id: uuidv4(),
      farm_id: farm.id,
      email: adminEmail,
      username: 'admin',
      phone: '+252-61-5550100',
      password_hash: passwordHash,
      full_name: adminName,
      role_name: 'ADMIN',
      is_active: true
    }
  });

  console.log('--- ADMIN USER READY ---');
  console.log(`Email:    ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Role:     ${admin.role_name}`);
  console.log(`ID:       ${admin.id}`);
}

main()
  .catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
