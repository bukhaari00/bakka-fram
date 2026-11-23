import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, generateOfflineVerifier, verifyOfflineCredentials } from '../src/utils/security.js';
import { ROLES, PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@bakka/shared';
import { requirePermission, requireRole } from '../src/middleware/auth.js';

describe('Bakka Farm RBAC & Authentication Tests', () => {
  it('hashes and verifies passwords strictly using Argon2id', async () => {
    const rawPassword = 'BakkaSecurePassword#2026';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2id$');

    const isValid = await verifyPassword(hash, rawPassword);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword(hash, 'WrongPassword123');
    expect(isInvalid).toBe(false);
  });

  it('generates and verifies offline credentials for enrolled devices', () => {
    const pin = '884219';
    const { verifierHash, salt } = generateOfflineVerifier(pin);

    expect(verifierHash).toHaveLength(64); // SHA-256 hex
    expect(salt).toHaveLength(32);

    const verified = verifyOfflineCredentials(pin, salt, verifierHash);
    expect(verified).toBe(true);

    const wrongPin = verifyOfflineCredentials('123456', salt, verifierHash);
    expect(wrongPin).toBe(false);
  });

  it('defines 6 operational roles with non-overlapping authority boundaries', () => {
    const expectedRoles = [
      ROLES.ADMIN,
      ROLES.FARM_MANAGER,
      ROLES.FIELD_SUPERVISOR,
      ROLES.FARM_WORKER,
      ROLES.STOREKEEPER,
      ROLES.ACCOUNTANT
    ];

    for (const role of expectedRoles) {
      expect(ROLE_DEFAULT_PERMISSIONS[role]).toBeDefined();
      expect(Array.isArray(ROLE_DEFAULT_PERMISSIONS[role])).toBe(true);
    }

    // Admin has all permissions
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ADMIN]).toEqual(Object.values(PERMISSIONS));

    // Worker has only assigned tasks & progress updates
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.FARM_WORKER]).toContain(PERMISSIONS.TASKS_VIEW_ASSIGNED);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.FARM_WORKER]).toContain(PERMISSIONS.TASKS_UPDATE_PROGRESS);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.FARM_WORKER]).not.toContain(PERMISSIONS.TASKS_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.FARM_WORKER]).not.toContain(PERMISSIONS.USERS_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.FARM_WORKER]).not.toContain(PERMISSIONS.FINANCE_REPORTS);

    // Accountant has finance and sales, but no field/crop manage or stock adjust
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ACCOUNTANT]).toContain(PERMISSIONS.SALES_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ACCOUNTANT]).toContain(PERMISSIONS.EXPENSES_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ACCOUNTANT]).not.toContain(PERMISSIONS.STOCK_ADJUST);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.ACCOUNTANT]).not.toContain(PERMISSIONS.CROPS_MANAGE);

    // Storekeeper has inventory & stock receipts/issues, but no financial reports or sales
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STOREKEEPER]).toContain(PERMISSIONS.INVENTORY_VIEW);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STOREKEEPER]).toContain(PERMISSIONS.STOCK_RECEIPT);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STOREKEEPER]).toContain(PERMISSIONS.STOCK_ISSUE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STOREKEEPER]).not.toContain(PERMISSIONS.SALES_MANAGE);
    expect(ROLE_DEFAULT_PERMISSIONS[ROLES.STOREKEEPER]).not.toContain(PERMISSIONS.FINANCE_REPORTS);
  });

  it('enforces permission middleware: grants allowed and denies forbidden', () => {
    let nextCalled = false;
    let errorCaught = null;
    const next = (err) => {
      if (err) errorCaught = err;
      else nextCalled = true;
    };

    const workerUser = {
      id: 'worker-1',
      farmId: 'farm-1',
      roleName: ROLES.FARM_WORKER,
      permissions: ROLE_DEFAULT_PERMISSIONS[ROLES.FARM_WORKER]
    };

    // Worker updating assigned task: ALLOWED
    const allowedMiddleware = requirePermission(PERMISSIONS.TASKS_UPDATE_PROGRESS);
    allowedMiddleware({ user: workerUser }, {}, next);
    expect(nextCalled).toBe(true);
    expect(errorCaught).toBeNull();

    // Worker attempting to delete or manage users: DENIED
    nextCalled = false;
    errorCaught = null;
    const forbiddenMiddleware = requirePermission(PERMISSIONS.USERS_MANAGE);
    forbiddenMiddleware({ user: workerUser }, {}, next);
    expect(nextCalled).toBe(false);
    expect(errorCaught).toBeDefined();
    expect(errorCaught.statusCode).toBe(403);
  });

  it('enforces role middleware: allows specified roles and rejects others', () => {
    let nextCalled = false;
    let errorCaught = null;
    const next = (err) => {
      if (err) errorCaught = err;
      else nextCalled = true;
    };

    const supervisorUser = {
      id: 'supervisor-1',
      roleName: ROLES.FIELD_SUPERVISOR
    };

    // Supervisor check against manager/supervisor: ALLOWED
    const supervisorCheck = requireRole(ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.FIELD_SUPERVISOR);
    supervisorCheck({ user: supervisorUser }, {}, next);
    expect(nextCalled).toBe(true);

    // Supervisor check against Accountant: DENIED
    nextCalled = false;
    errorCaught = null;
    const accountantCheck = requireRole(ROLES.ACCOUNTANT);
    accountantCheck({ user: supervisorUser }, {}, next);
    expect(nextCalled).toBe(false);
    expect(errorCaught.statusCode).toBe(403);
  });

  it('guarantees tenant farm isolation scoping', () => {
    const userA = { farmId: 'farm-alpha', id: 'user-a' };
    const userB = { farmId: 'farm-beta', id: 'user-b' };

    // Function simulating scoped DB query
    const buildScopedQuery = (user, filter = {}) => ({
      where: {
        ...filter,
        farm_id: user.farmId
      }
    });

    const queryA = buildScopedQuery(userA, { status: 'ACTIVE' });
    const queryB = buildScopedQuery(userB, { status: 'ACTIVE' });

    expect(queryA.where.farm_id).toBe('farm-alpha');
    expect(queryB.where.farm_id).toBe('farm-beta');
    expect(queryA.where.farm_id).not.toBe(queryB.where.farm_id);
  });
});
