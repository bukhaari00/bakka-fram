import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { UsersService } from '../src/modules/users/users.service.js';
import { ROLES, PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';

describe('Authentication & User Management Integration Tests', () => {
  let mockPrisma;
  let authService;
  let usersService;
  let userStore = [];
  let sessionStore = [];

  const defaultFarm = {
    id: 'farm-001',
    name: 'Bakka Operations',
    code: 'BAKKA-01'
  };

  beforeEach(() => {
    userStore = [];
    sessionStore = [];

    mockPrisma = {
      farm: {
        findFirst: vi.fn().mockResolvedValue(defaultFarm),
        create: vi.fn().mockResolvedValue(defaultFarm)
      },
      user: {
        findUnique: vi.fn(async ({ where }) => {
          if (where.email) return userStore.find(u => u.email === where.email) || null;
          if (where.id) return userStore.find(u => u.id === where.id) || null;
          return null;
        }),
        findFirst: vi.fn(async ({ where }) => {
          if (where.OR) {
            for (const cond of where.OR) {
              if (cond.email) {
                const found = userStore.find(u => u.email === cond.email);
                if (found) return found;
              }
              if (cond.username) {
                const found = userStore.find(u => u.username === cond.username);
                if (found) return found;
              }
            }
            return null;
          }
          if (where.username) {
            return userStore.find(u => u.username === where.username) || null;
          }
          if (where.id) {
            return userStore.find(u => u.id === where.id) || null;
          }
          return userStore[0] || null;
        }),
        findMany: vi.fn(async ({ where }) => {
          let list = [...userStore];
          if (where?.role_name && where.role_name !== 'ALL') {
            list = list.filter(u => u.role_name === where.role_name);
          }
          if (where?.OR) {
            // search mock
            list = list.filter(u => u.full_name.includes('Test') || u.email.includes('test'));
          }
          return list;
        }),
        create: vi.fn(async ({ data }) => {
          const created = {
            ...data,
            id: data.id || `u-${Date.now()}`,
            created_at: new Date(),
            updated_at: new Date(),
            farm: defaultFarm
          };
          userStore.push(created);
          return created;
        }),
        update: vi.fn(async ({ where, data }) => {
          const idx = userStore.findIndex(u => u.id === where.id);
          if (idx === -1) throw new Error('Not found');
          userStore[idx] = { ...userStore[idx], ...data, updated_at: new Date() };
          return userStore[idx];
        }),
        delete: vi.fn(async ({ where }) => {
          const idx = userStore.findIndex(u => u.id === where.id);
          if (idx !== -1) userStore.splice(idx, 1);
          return { id: where.id };
        })
      },
      session: {
        create: vi.fn(async ({ data }) => {
          sessionStore.push(data);
          return data;
        }),
        delete: vi.fn(async () => ({})),
        deleteMany: vi.fn(async () => ({}))
      },
      userDevice: {
        upsert: vi.fn(async () => ({ device_id: 'dev-1', enrolled_at: new Date() })),
        deleteMany: vi.fn(async () => ({}))
      },
      auditLog: {
        create: vi.fn(async () => ({}))
      }
    };

    authService = new AuthService(mockPrisma);
    usersService = new UsersService(mockPrisma);
  });

  it('registers a new user and assigns STUDENT role by default (never Admin)', async () => {
    const res = await authService.register({
      fullName: 'Sahal Jaamac',
      email: 'sahal@example.com',
      username: 'sahal_j',
      phone: '+252-61-1234567',
      password: 'SecurePassword123'
    });

    expect(res).toBeDefined();
    expect(res.token).toBeDefined();
    expect(res.user.email).toBe('sahal@example.com');
    expect(res.user.username).toBe('sahal_j');
    expect(res.user.roleName).toBe(ROLES.STUDENT);
    expect(res.user.roleName).not.toBe(ROLES.ADMIN);
  });

  it('rejects duplicate email and duplicate username registration', async () => {
    await authService.register({
      fullName: 'User One',
      email: 'duplicate@example.com',
      username: 'userone',
      phone: '+252-61-0000001',
      password: 'Password123'
    });

    // Try same email
    await expect(authService.register({
      fullName: 'User Two',
      email: 'duplicate@example.com',
      username: 'usertwo',
      phone: '+252-61-0000002',
      password: 'Password123'
    })).rejects.toThrow('email address already exists');

    // Try same username
    await expect(authService.register({
      fullName: 'User Three',
      email: 'unique@example.com',
      username: 'userone',
      phone: '+252-61-0000003',
      password: 'Password123'
    })).rejects.toThrow('username is already taken');
  });

  it('allows login using either email or username', async () => {
    await authService.register({
      fullName: 'Cali Nuur',
      email: 'cali@example.com',
      username: 'cali_nuur',
      phone: '+252-61-5551122',
      password: 'Password456'
    });

    // Login via Email
    const emailLogin = await authService.login({
      identifier: 'cali@example.com',
      password: 'Password456'
    });
    expect(emailLogin.token).toBeDefined();
    expect(emailLogin.user.username).toBe('cali_nuur');

    // Login via Username
    const usernameLogin = await authService.login({
      identifier: 'cali_nuur',
      password: 'Password456'
    });
    expect(usernameLogin.token).toBeDefined();
    expect(usernameLogin.user.email).toBe('cali@example.com');
  });

  it('supports admin user management: create, edit, deactivate, and delete user', async () => {
    // 1. Create User as Admin
    const created = await usersService.createUser({
      farmId: 'farm-001',
      email: 'staff1@example.com',
      username: 'staff_one',
      password: 'StaffPass#2026',
      fullName: 'Farax Staff',
      roleName: ROLES.STAFF,
      actorUserId: 'admin-001'
    });
    expect(created.role_name).toBe(ROLES.STAFF);

    // 2. Update user
    const updated = await usersService.updateUser({
      farmId: 'farm-001',
      userId: created.id,
      fullName: 'Farax Updated',
      actorUserId: 'admin-001'
    });
    expect(updated.full_name).toBe('Farax Updated');

    // 3. Deactivate user
    const deactivated = await usersService.toggleActiveStatus({
      farmId: 'farm-001',
      userId: created.id,
      isActive: false,
      actorUserId: 'admin-001'
    });
    expect(deactivated.is_active).toBe(false);

    // 4. Delete user
    const deleted = await usersService.deleteUser({
      farmId: 'farm-001',
      userId: created.id,
      actorUserId: 'admin-001'
    });
    expect(deleted.success).toBe(true);
  });

  it('verifies RBAC permissions matrix for Admin, Staff, and Student', () => {
    // Admin has all permissions
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ADMIN].length).toBeGreaterThan(25);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ADMIN]).toContain(PERMISSIONS.USERS_MANAGE);

    // Staff has operational permissions but cannot manage users
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STAFF]).toContain(PERMISSIONS.TASKS_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STAFF]).not.toContain(PERMISSIONS.USERS_MANAGE);

    // Student has restricted student permissions only
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STUDENT]).toContain(PERMISSIONS.TASKS_VIEW_ASSIGNED);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STUDENT]).not.toContain(PERMISSIONS.TASKS_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STUDENT]).not.toContain(PERMISSIONS.USERS_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STUDENT]).not.toContain(PERMISSIONS.STOCK_RECEIPT);
  });
});
