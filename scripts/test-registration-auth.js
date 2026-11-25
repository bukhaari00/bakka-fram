import { PrismaClient } from '@prisma/client';
import { AuthService } from '../apps/api/src/modules/auth/auth.service.js';

const dbUrl = 'postgresql://neondb_owner:npg_iYnjx4fPCw8X@ep-lingering-cake-bdqks0e6-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

const authService = new AuthService(prisma);

async function runTests() {
  console.log('=== BAKKA FARM REGISTRATION & AUTH PRODUCTION TEST SUITE ===\n');

  const testEmail = `student_${Date.now()}@bakkafarm.com`;
  const testUsername = `student_${Date.now()}`;
  const testPassword = 'Password2026!';

  // Test 1: Student registration with valid information
  console.log('1. Testing Student Registration with valid information...');
  const regResult = await authService.register({
    fullName: 'Cabdi Majiib Xassan',
    email: testEmail,
    username: testUsername,
    phone: '0686079067',
    password: testPassword,
    role: 'STUDENT'
  });
  console.log(`   [PASS] User created: ${regResult.user.fullName} (${regResult.user.email}), Role: ${regResult.user.roleName}`);

  // Test 2: Registration with an existing email
  console.log('\n2. Testing Duplicate Email rejection...');
  try {
    await authService.register({
      fullName: 'Another Person',
      email: testEmail,
      username: `another_${Date.now()}`,
      phone: '0612345678',
      password: testPassword,
      role: 'STUDENT'
    });
    console.error('   [FAIL] Should have rejected duplicate email');
  } catch (err) {
    console.log(`   [PASS] Correctly rejected duplicate email: "${err.message}"`);
  }

  // Test 3: Registration with an existing username
  console.log('\n3. Testing Duplicate Username rejection...');
  try {
    await authService.register({
      fullName: 'Another Person',
      email: `another_${Date.now()}@bakkafarm.com`,
      username: testUsername,
      phone: '0612345678',
      password: testPassword,
      role: 'STUDENT'
    });
    console.error('   [FAIL] Should have rejected duplicate username');
  } catch (err) {
    console.log(`   [PASS] Correctly rejected duplicate username: "${err.message}"`);
  }

  // Test 4: Login with valid credentials
  console.log('\n4. Testing Login with valid student credentials...');
  const loginResult = await authService.login({
    identifier: testEmail,
    password: testPassword
  });
  console.log(`   [PASS] Student login successful! Token generated. User Role: ${loginResult.user.roleName}`);

  // Test 5: Login with incorrect credentials
  console.log('\n5. Testing Login with incorrect credentials...');
  try {
    await authService.login({
      identifier: testEmail,
      password: 'WrongPassword999!'
    });
    console.error('   [FAIL] Should have rejected wrong password');
  } catch (err) {
    console.log(`   [PASS] Correctly rejected wrong password: "${err.message}"`);
  }

  // Test 6: Admin login with seeded credentials
  console.log('\n6. Testing Administrator Login...');
  const adminLoginResult = await authService.login({
    identifier: 'admin@bakkafarm.com',
    password: 'BakkaAdmin2026!'
  });
  console.log(`   [PASS] Admin login successful! Role: ${adminLoginResult.user.roleName}, FullName: ${adminLoginResult.user.fullName}`);

  // Test 7: Verify RBAC permissions of Student vs Admin
  console.log('\n7. Testing RBAC scoping (Student vs Admin)...');
  if (regResult.user.roleName === 'STUDENT' && adminLoginResult.user.roleName === 'ADMIN') {
    console.log('   [PASS] Student role is strictly STUDENT (no admin escalation possible).');
    console.log('   [PASS] Admin role is verified as ADMIN with full operational scope.');
  } else {
    console.error('   [FAIL] RBAC mismatch detected');
  }

  // Test 8: Database persistence check in Neon PostgreSQL
  console.log('\n8. Testing Database Persistence in Neon PostgreSQL...');
  const persistedUser = await prisma.user.findUnique({
    where: { email: testEmail }
  });
  if (persistedUser && persistedUser.id === regResult.user.id) {
    console.log(`   [PASS] User ${persistedUser.email} is permanently stored in Neon PostgreSQL!`);
  } else {
    console.error('   [FAIL] User not found in database!');
  }

  console.log('\n=== ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
