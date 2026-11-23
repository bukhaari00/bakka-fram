import { hashPassword } from '../utils/security.js';
import { v4 as uuidv4 } from 'uuid';
import {
  ROLES,
  PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS
} from '@bakka/shared';

/**
 * Safe development seed for Bakka Farm Management System
 * Never commits hard-coded production secrets.
 * Reads bootstrap credentials from environment variables.
 */
export async function seedDatabase(prisma) {
  console.log('--- Starting Bakka Farm Database Seed ---');

  // 1. Seed Roles
  console.log('Seeding canonical roles...');
  const roleMap = {};
  for (const roleName of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        id: uuidv4(),
        name: roleName,
        description: `Bakka Farm role: ${roleName}`
      }
    });
    roleMap[roleName] = role;
  }

  // 2. Seed Permissions
  console.log('Seeding fine-grained permissions...');
  const permissionMap = {};
  for (const [code, desc] of Object.entries(PERMISSIONS)) {
    const [module] = desc.split(':');
    const perm = await prisma.permission.upsert({
      where: { code: desc },
      update: { description: `Allows ${desc}`, module },
      create: {
        id: uuidv4(),
        code: desc,
        description: `Allows ${desc}`,
        module
      }
    });
    permissionMap[desc] = perm;
  }

  // 3. Map Role Permissions
  console.log('Mapping role-permission matrix...');
  for (const [roleName, permCodes] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
    const role = roleMap[roleName];
    for (const code of permCodes) {
      const perm = permissionMap[code];
      if (role && perm) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: perm.id
            }
          },
          update: {},
          create: {
            id: uuidv4(),
            role_id: role.id,
            permission_id: perm.id
          }
        });
      }
    }
  }

  // 4. Seed Default Farm Profile
  console.log('Seeding demo farm: Bakka Farm...');
  const farm = await prisma.farm.upsert({
    where: { code: 'BAKKA-01' },
    update: {
      name: 'Bakka Farm',
      location: 'Afgooye River Valley, Lower Shabelle',
      contact_phone: '+252-61-5550199',
      contact_email: 'info@bakkafarm.com',
      currency: 'USD',
      timezone: 'Africa/Mogadishu',
      default_language: 'en'
    },
    create: {
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

  // 5. Seed Units of Measurement
  console.log('Seeding units of measurement...');
  const defaultUnits = [
    { name: 'Hectare', symbol: 'HA', category: 'AREA', factor: 10000 },
    { name: 'Acre', symbol: 'ACRE', category: 'AREA', factor: 4046.86 },
    { name: 'Square Meter', symbol: 'SQM', category: 'AREA', factor: 1 },
    { name: 'Kilogram', symbol: 'KG', category: 'WEIGHT', factor: 1 },
    { name: 'Gram', symbol: 'G', category: 'WEIGHT', factor: 0.001 },
    { name: 'Metric Ton', symbol: 'TON', category: 'WEIGHT', factor: 1000 },
    { name: 'Bag (50kg)', symbol: 'BAG_50KG', category: 'WEIGHT', factor: 50 },
    { name: 'Liter', symbol: 'L', category: 'VOLUME', factor: 1 },
    { name: 'Crate', symbol: 'CRATE', category: 'COUNT', factor: 1 },
    { name: 'Piece', symbol: 'PC', category: 'COUNT', factor: 1 }
  ];

  for (const u of defaultUnits) {
    await prisma.unit.upsert({
      where: {
        farm_id_symbol: {
          farm_id: farm.id,
          symbol: u.symbol
        }
      },
      update: {
        name: u.name,
        category: u.category,
        conversion_factor_to_base: u.factor
      },
      create: {
        id: uuidv4(),
        farm_id: farm.id,
        name: u.name,
        symbol: u.symbol,
        category: u.category,
        conversion_factor_to_base: u.factor
      }
    });
  }

  // 6. Seed Expense Categories
  console.log('Seeding expense categories...');
  const expenseCats = [
    'Labor & Field Wages',
    'Fuel & Machinery',
    'Seeds & Seedlings',
    'Fertilizers & Nutrients',
    'Crop Protection & Pesticides',
    'Irrigation & Water Power',
    'Repairs & Maintenance',
    'Packaging & Crates',
    'Transport & Logistics',
    'Farm Utilities & Rent'
  ];

  for (const cat of expenseCats) {
    await prisma.expenseCategory.upsert({
      where: {
        farm_id_name: {
          farm_id: farm.id,
          name: cat
        }
      },
      update: {},
      create: {
        id: uuidv4(),
        farm_id: farm.id,
        name: cat,
        description: `Expenditures related to ${cat}`
      }
    });
  }

  // 7. Seed Initial Cash Accounts
  console.log('Seeding cash accounts...');
  const cashAccounts = [
    { name: 'Main Farm Safe', type: 'CASH', balance: 2500.00 },
    { name: 'Hormuud EVC Plus Mobile', type: 'MOBILE_MONEY', balance: 1850.00 },
    { name: 'Premier Bank Commercial', type: 'BANK', balance: 12000.00 }
  ];

  for (const acc of cashAccounts) {
    await prisma.cashAccount.upsert({
      where: {
        farm_id_name: {
          farm_id: farm.id,
          name: acc.name
        }
      },
      update: { current_balance: acc.balance },
      create: {
        id: uuidv4(),
        farm_id: farm.id,
        name: acc.name,
        account_type: acc.type,
        current_balance: acc.balance,
        currency: 'USD'
      }
    });
  }

  // 8. Bootstrap Initial Admin User (Safe Development Only)
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@bakkafarm.com';
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'BakkaAdminSecure2026!';
  const adminName = process.env.BOOTSTRAP_ADMIN_NAME || 'Bakka Farm Admin';

  const passwordHash = await hashPassword(adminPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      farm_id: farm.id,
      full_name: adminName,
      role_name: ROLES.ADMIN,
      is_active: true
    },
    create: {
      id: uuidv4(),
      farm_id: farm.id,
      email: adminEmail,
      phone: '+252-61-5550100',
      password_hash: passwordHash,
      full_name: adminName,
      role_name: ROLES.ADMIN,
      is_active: true
    }
  });

  console.log(`Admin user bootstrapped: ${adminUser.email} (Role: ${adminUser.role_name})`);
  console.log('--- Seed Completed Successfully ---');
  return { farm, adminUser };
}

// Standalone execution support
if (process.argv[1]?.endsWith('seed.js')) {
  import('@prisma/client').then(async ({ PrismaClient }) => {
    const prisma = new PrismaClient();
    try {
      await seedDatabase(prisma);
    } catch (err) {
      console.error('Seed execution error:', err);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });
}
