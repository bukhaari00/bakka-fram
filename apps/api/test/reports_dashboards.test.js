import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from '../src/modules/reports/reports.service.js';
import { ROLES } from '@bakka/shared';

describe('Bakka Farm Role-Specific Dashboards & Reports Tests', () => {
  let mockPrisma;
  let reportsService;

  beforeEach(() => {
    mockPrisma = {
      season: { findFirst: vi.fn() },
      field: { count: vi.fn() },
      plantingBatch: { count: vi.fn(), findMany: vi.fn() },
      task: { count: vi.fn(), findMany: vi.fn() },
      inventoryItem: { count: vi.fn(), findMany: vi.fn() },
      sale: { aggregate: vi.fn() },
      expense: { aggregate: vi.fn() },
      cashAccount: { findMany: vi.fn() },
      auditLog: { findMany: vi.fn() },
      syncConflict: { count: vi.fn() },
      cropObservation: { count: vi.fn() },
      stockReceipt: { findMany: vi.fn() },
      stockIssue: { findMany: vi.fn() },
      customer: { findMany: vi.fn() },
      supplier: { findMany: vi.fn() }
    };

    reportsService = new ReportsService(mockPrisma);
  });

  it('aggregates real database metrics for Admin dashboard without fake figures', async () => {
    mockPrisma.season.findFirst.mockResolvedValue({ name: 'Gu Season 2026' });
    mockPrisma.field.count.mockResolvedValue(8);
    mockPrisma.plantingBatch.count.mockResolvedValue(12);
    mockPrisma.task.count.mockResolvedValue(4);
    mockPrisma.inventoryItem.count.mockResolvedValue(2);
    mockPrisma.sale.aggregate.mockResolvedValue({
      _sum: { total_amount: 15400.0, paid_amount: 12000.0 }
    });
    mockPrisma.expense.aggregate.mockResolvedValue({
      _sum: { amount: 6200.0 }
    });
    mockPrisma.cashAccount.findMany.mockResolvedValue([
      { current_balance: 5000.0 },
      { current_balance: 7000.0 }
    ]);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.syncConflict.count.mockResolvedValue(0);

    const adminDash = await reportsService.getRoleDashboard({
      farmId: 'farm-1',
      user: { roleName: ROLES.ADMIN, id: 'admin-1' }
    });

    expect(adminDash.role).toBe(ROLES.ADMIN);
    expect(adminDash.activeSeason).toBe('Gu Season 2026');
    expect(adminDash.fieldsCount).toBe(8);
    expect(adminDash.totalSalesInvoiced).toBe(15400.0);
    expect(adminDash.totalSalesCollected).toBe(12000.0);
    expect(adminDash.outstandingCustomerDebt).toBe(3400.0); // 15400 - 12000
    expect(adminDash.totalExpenses).toBe(6200.0);
    expect(adminDash.totalCashBalance).toBe(12000.0); // 5000 + 7000
  });

  it('delivers tailored metrics for Worker: assigned tasks only', async () => {
    mockPrisma.task.findMany.mockResolvedValue([
      { id: 'task-1', title: 'Weed Plot 2', status: 'PENDING' },
      { id: 'task-2', title: 'Harvest Papaya', status: 'IN_PROGRESS' }
    ]);

    const workerDash = await reportsService.getRoleDashboard({
      farmId: 'farm-1',
      user: { roleName: ROLES.FARM_WORKER, id: 'worker-42' }
    });

    expect(workerDash.role).toBe(ROLES.FARM_WORKER);
    expect(workerDash.assignedTasks).toHaveLength(2);
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          assignments: { some: { user_id: 'worker-42' } }
        })
      })
    );
  });

  it('delivers tailored metrics for Accountant: invoiced sales, cash collected, debts and expenses', async () => {
    mockPrisma.sale.aggregate.mockResolvedValue({
      _sum: { total_amount: 20000.0, paid_amount: 15000.0 }
    });
    mockPrisma.expense.aggregate.mockResolvedValue({
      _sum: { amount: 8000.0 }
    });
    mockPrisma.cashAccount.findMany.mockResolvedValue([{ current_balance: 7000.0 }]);
    mockPrisma.customer.findMany.mockResolvedValue([{ name: 'Market A', current_balance: 5000.0 }]);
    mockPrisma.supplier.findMany.mockResolvedValue([{ name: 'Seed Co', current_balance: 1200.0 }]);

    const accountantDash = await reportsService.getRoleDashboard({
      farmId: 'farm-1',
      user: { roleName: ROLES.ACCOUNTANT, id: 'acc-1' }
    });

    expect(accountantDash.role).toBe(ROLES.ACCOUNTANT);
    expect(accountantDash.totalInvoiced).toBe(20000.0);
    expect(accountantDash.totalCollected).toBe(15000.0);
    expect(accountantDash.outstandingCustomerDebt).toBe(5000.0);
    expect(accountantDash.netCashFlow).toBe(7000.0); // 15000 collected - 8000 expenses
    expect(accountantDash.topDebtors).toHaveLength(1);
  });
});
