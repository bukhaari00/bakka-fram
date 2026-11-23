import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bakka Farm Management Database Schema & Migration Tests', () => {
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  const migrationPath = path.resolve(__dirname, '../prisma/migrations/20261123000000_init/migration.sql');

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');

  it('prohibits obsolete training-center tables and concepts', () => {
    const forbidden = [
      'students', 'courses', 'certificates', 'classes', 'cohorts',
      'enrollments', 'instructors', 'grades', 'Student', 'Course',
      'Certificate', 'ClassSession', 'Enrollment'
    ];

    for (const term of forbidden) {
      expect(schemaContent).not.toMatch(new RegExp(`model\\s+${term}\\b`, 'i'));
      expect(migrationContent).not.toMatch(new RegExp(`CREATE TABLE\\s+\`${term}\``, 'i'));
    }
  });

  it('contains all 10 domain clusters across MySQL tables', () => {
    const requiredTables = [
      // 1. Identity & Access
      'users', 'roles', 'permissions', 'role_permissions', 'user_devices', 'sessions',
      // 2. Farm Setup
      'farms', 'farm_settings', 'fields', 'seasons', 'units',
      // 3. Crops & Planting
      'crop_types', 'crop_varieties', 'planting_batches', 'crop_observations',
      // 4. Work Operations
      'tasks', 'task_assignments', 'task_activity_logs', 'irrigation_events',
      // 5. Inventory & Stock Ledger
      'inventory_items', 'inventory_locations', 'stock_receipts', 'stock_receipt_lines',
      'stock_issues', 'stock_issue_lines', 'stock_adjustments', 'stock_ledger',
      // 6. Harvest & Produce Storage
      'harvest_records', 'produce_lots', 'produce_movements',
      // 7. Commerce (Customers & Sales)
      'customers', 'sales', 'sale_lines', 'customer_payments',
      // 8. Procurement (Suppliers & Purchases)
      'suppliers', 'purchases', 'purchase_lines', 'supplier_payments',
      // 9. Finance & Expenses
      'expense_categories', 'expenses', 'cash_accounts', 'cash_transactions',
      // 10. Platform & Synchronization
      'sync_operations', 'sync_conflicts', 'audit_logs', 'attachments'
    ];

    for (const table of requiredTables) {
      expect(migrationContent).toContain(`CREATE TABLE \`${table}\``);
    }
  });

  it('enforces UUID compatibility, foreign keys, and indexes on tenant entities', () => {
    // Check farm_id foreign keys
    expect(migrationContent).toContain('`farm_id` CHAR(36) NOT NULL');
    expect(migrationContent).toContain('CONSTRAINT `fields_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`)');
    expect(migrationContent).toContain('CONSTRAINT `tasks_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`)');
    expect(migrationContent).toContain('CONSTRAINT `stock_ledger_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`)');
    expect(migrationContent).toContain('CONSTRAINT `sales_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`)');
  });

  it('enforces DECIMAL types for money and agricultural measurements', () => {
    expect(migrationContent).toContain('`total_area` DECIMAL(14, 3) NOT NULL');
    expect(migrationContent).toContain('`total_amount` DECIMAL(14, 2)');
    expect(migrationContent).toContain('`running_balance` DECIMAL(14, 3)');
    expect(migrationContent).toContain('`quantity` DECIMAL(14, 3)');
  });

  it('initializes Prisma Client with all expected models', () => {
    const prisma = new PrismaClient();
    const expectedDelegates = [
      'user', 'role', 'permission', 'rolePermission', 'userDevice', 'session',
      'farm', 'farmSetting', 'field', 'season', 'unit',
      'cropType', 'cropVariety', 'plantingBatch', 'cropObservation',
      'task', 'taskAssignment', 'taskActivityLog', 'irrigationEvent',
      'inventoryItem', 'inventoryLocation', 'stockReceipt', 'stockReceiptLine',
      'stockIssue', 'stockIssueLine', 'stockAdjustment', 'stockLedger',
      'harvestRecord', 'produceLot', 'produceMovement',
      'customer', 'sale', 'saleLine', 'customerPayment',
      'supplier', 'purchase', 'purchaseLine', 'supplierPayment',
      'expenseCategory', 'expense', 'cashAccount', 'cashTransaction',
      'syncOperation', 'syncConflict', 'auditLog', 'attachment'
    ];

    for (const delegate of expectedDelegates) {
      expect(prisma[delegate]).toBeDefined();
    }
  });
});
