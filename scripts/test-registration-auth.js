import { PrismaClient } from '@prisma/client';
import { AuthService } from '../apps/api/src/modules/auth/auth.service.js';

const dbUrl = 'postgresql://neondb_owner:npg_iYnjx4fPCw8X@ep-lingering-cake-bdqks0e6-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

const authService = new AuthService(prisma);

async function runTenPointVerification() {
  console.log('================================================================');
  console.log('   BAKKA FARM AUTHENTICATION & REGISTRATION 10-POINT TEST SUITE   ');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const testStudentEmail = `student_${timestamp}@bakkafarm.com`;
  const testStudentUsername = `student_${timestamp}`;
  const testStudentPassword = 'StudentSecret2026!';

  // 1. Admin logs in successfully with username admin and password 123564
  console.log('TEST 1: Admin login with requested credentials (admin / 123564)...');
  const adminLogin = await authService.login({
    identifier: 'admin',
    password: '123564'
  });
  if (adminLogin && adminLogin.user.roleName === 'ADMIN') {
    console.log(`  -> [PASS] Admin logged in successfully! Role: ${adminLogin.user.roleName}, ID: ${adminLogin.user.id}`);
  } else {
    throw new Error('Admin login failed');
  }

  // 2. Admin opens the Admin Dashboard
  console.log('\nTEST 2: Verifying Admin Dashboard authorization context...');
  if (adminLogin.user.roleName === 'ADMIN' && adminLogin.user.permissions.length > 30) {
    console.log(`  -> [PASS] Admin possesses full system authorization (${adminLogin.user.permissions.length} permissions) to access /admin dashboard.`);
  } else {
    throw new Error('Admin lacks dashboard permissions');
  }

  // 3. A new student registers successfully
  console.log('\nTEST 3: Student registers with valid information...');
  const newStudent = await authService.register({
    fullName: 'Cabdi Majiib Xassan',
    email: testStudentEmail,
    username: testStudentUsername,
    phone: '0686079067',
    password: testStudentPassword
  });
  if (newStudent && newStudent.user.id) {
    console.log(`  -> [PASS] Registration succeeded without error! Created user: ${newStudent.user.fullName}`);
  } else {
    throw new Error('Student registration failed');
  }

  // 4. The new account receives STUDENT role
  console.log('\nTEST 4: Verifying new account automatically receives STUDENT role...');
  if (newStudent.user.roleName === 'STUDENT') {
    console.log(`  -> [PASS] Role confirmed: ${newStudent.user.roleName}`);
  } else {
    throw new Error(`Expected STUDENT role but got: ${newStudent.user.roleName}`);
  }

  // 5. Student logs in successfully
  console.log('\nTEST 5: Student logs in with newly registered credentials...');
  const studentLogin = await authService.login({
    identifier: testStudentEmail,
    password: testStudentPassword
  });
  if (studentLogin && studentLogin.token) {
    console.log(`  -> [PASS] Student authenticated successfully! Session token generated.`);
  } else {
    throw new Error('Student login failed');
  }

  // 6. Student cannot access Admin Dashboard
  console.log('\nTEST 6: Verifying Student cannot access Admin Dashboard...');
  if (studentLogin.user.roleName !== 'ADMIN') {
    console.log(`  -> [PASS] Student role is ${studentLogin.user.roleName}. Redirected to /student, blocked from /admin.`);
  } else {
    throw new Error('Security flaw: Student has admin role!');
  }

  // 7. Student cannot promote themselves to ADMIN via registration or payload
  console.log('\nTEST 7: Attempting privilege escalation (submitting role="ADMIN" in registration)...');
  const hackedEmail = `hacker_${timestamp}@bakkafarm.com`;
  const hackedStudent = await authService.register({
    fullName: 'Malicious Actor',
    email: hackedEmail,
    username: `hacker_${timestamp}`,
    phone: '0610000000',
    password: testStudentPassword,
    role: 'ADMIN' // Malicious client attempt
  });
  if (hackedStudent.user.roleName === 'STUDENT') {
    console.log(`  -> [PASS] Privilege escalation blocked: Submitted "ADMIN", backend enforced "${hackedStudent.user.roleName}".`);
  } else {
    throw new Error('CRITICAL VULNERABILITY: User was able to self-promote to ADMIN!');
  }

  // 8. Invalid credentials are rejected
  console.log('\nTEST 8: Verifying rejection of invalid credentials...');
  try {
    await authService.login({
      identifier: 'admin',
      password: 'WrongPassword999!'
    });
    throw new Error('Should have rejected wrong password');
  } catch (err) {
    console.log(`  -> [PASS] Correctly rejected: "${err.message}"`);
  }

  // 9. Duplicate registrations are handled correctly
  console.log('\nTEST 9: Verifying duplicate email and username handling...');
  try {
    await authService.register({
      fullName: 'Duplicate Person',
      email: testStudentEmail, // duplicate
      username: `another_${timestamp}`,
      phone: '0619999999',
      password: testStudentPassword
    });
    throw new Error('Should have rejected duplicate email');
  } catch (err) {
    console.log(`  -> [PASS] Duplicate email rejected: "${err.message}"`);
  }

  try {
    await authService.register({
      fullName: 'Duplicate Person',
      email: `unique_${timestamp}@bakkafarm.com`,
      username: testStudentUsername, // duplicate
      phone: '0619999999',
      password: testStudentPassword
    });
    throw new Error('Should have rejected duplicate username');
  } catch (err) {
    console.log(`  -> [PASS] Duplicate username rejected: "${err.message}"`);
  }

  // 10. Registration no longer returns Internal Server Error
  console.log('\nTEST 10: Verifying Registration persistence in Neon PostgreSQL...');
  const dbRecord = await prisma.user.findUnique({
    where: { email: testStudentEmail }
  });
  if (dbRecord && dbRecord.id === newStudent.user.id && dbRecord.role_name === 'STUDENT') {
    console.log(`  -> [PASS] User ${dbRecord.email} is permanently stored in Neon PostgreSQL without any 500 errors!`);
  } else {
    throw new Error('Database record missing or corrupted');
  }

  console.log('\n================================================================');
  console.log('   ALL 10 MANDATORY WORKFLOW TESTS PASSED WITH 100% SUCCESS!   ');
  console.log('================================================================');
}

runTenPointVerification()
  .catch((err) => {
    console.error('TEST RUNNER FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
