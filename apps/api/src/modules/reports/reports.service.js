import { ROLES, TASK_STATUSES } from '@bakka/shared';

export class ReportsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Real database-backed dashboard metrics based on authenticated user's role
   */
  async getRoleDashboard({ farmId, user }) {
    switch (user.roleName) {
      case ROLES.ADMIN:
        return await this.getAdminDashboard({ farmId });
      case ROLES.FARM_MANAGER:
        return await this.getManagerDashboard({ farmId });
      case ROLES.FIELD_SUPERVISOR:
        return await this.getSupervisorDashboard({ farmId, userId: user.id });
      case ROLES.FARM_WORKER:
        return await this.getWorkerDashboard({ farmId, userId: user.id });
      case ROLES.STOREKEEPER:
        return await this.getStorekeeperDashboard({ farmId });
      case ROLES.ACCOUNTANT:
        return await this.getAccountantDashboard({ farmId });
      default:
        return await this.getAdminDashboard({ farmId });
    }
  }

  async getAdminDashboard({ farmId }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeSeason,
      fieldsCount,
      activePlantingsCount,
      tasksTodayCount,
      overdueTasksCount,
      lowStockItemsCount,
      salesAgg,
      expensesAgg,
      cashAccounts,
      recentActivity,
      syncConflictsCount
    ] = await Promise.all([
      this.prisma.season.findFirst({ where: { farm_id: farmId, status: 'ACTIVE' } }),
      this.prisma.field.count({ where: { farm_id: farmId, status: 'ACTIVE' } }),
      this.prisma.plantingBatch.count({ where: { farm_id: farmId, status: { in: ['PLANTED', 'GROWING', 'READY_TO_HARVEST'] } } }),
      this.prisma.task.count({ where: { farm_id: farmId, planned_date: today, status: { not: TASK_STATUSES.COMPLETED } } }),
      this.prisma.task.count({ where: { farm_id: farmId, planned_date: { lt: today }, status: { not: TASK_STATUSES.COMPLETED } } }),
      this.prisma.inventoryItem.count({ where: { farm_id: farmId, current_balance: { lte: 0 } } }),
      this.prisma.sale.aggregate({ where: { farm_id: farmId }, _sum: { total_amount: true, paid_amount: true } }),
      this.prisma.expense.aggregate({ where: { farm_id: farmId }, _sum: { amount: true } }),
      this.prisma.cashAccount.findMany({ where: { farm_id: farmId, is_active: true } }),
      this.prisma.auditLog.findMany({ where: { farm_id: farmId }, take: 10, orderBy: { created_at: 'desc' } }),
      this.prisma.syncConflict.count({ where: { farm_id: farmId, resolved: false } })
    ]);

    const totalCash = cashAccounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
    const totalSales = Number(salesAgg._sum?.total_amount || 0);
    const totalSalesCollected = Number(salesAgg._sum?.paid_amount || 0);
    const outstandingCustomerDebt = totalSales - totalSalesCollected;
    const totalExpenses = Number(expensesAgg._sum?.amount || 0);

    return {
      role: ROLES.ADMIN,
      activeSeason: activeSeason ? activeSeason.name : 'No Active Season',
      fieldsCount,
      activePlantingsCount,
      tasksTodayCount,
      overdueTasksCount,
      lowStockItemsCount,
      totalSalesInvoiced: totalSales,
      totalSalesCollected,
      outstandingCustomerDebt,
      totalExpenses,
      totalCashBalance: totalCash,
      syncConflictsCount,
      recentActivity
    };
  }

  async getManagerDashboard({ farmId }) {
    const [
      activePlantings,
      pendingTasks,
      observationsCount,
      lowStockItems
    ] = await Promise.all([
      this.prisma.plantingBatch.findMany({
        where: { farm_id: farmId, status: { in: ['PLANTED', 'GROWING', 'READY_TO_HARVEST'] } },
        include: { field: true, crop_type: true }
      }),
      this.prisma.task.findMany({
        where: { farm_id: farmId, status: { not: TASK_STATUSES.COMPLETED } },
        take: 10,
        orderBy: { planned_date: 'asc' }
      }),
      this.prisma.cropObservation.count({ where: { farm_id: farmId } }),
      this.prisma.inventoryItem.findMany({
        where: { farm_id: farmId, current_balance: { lte: 0 } },
        take: 5
      })
    ]);

    return {
      role: ROLES.FARM_MANAGER,
      activePlantings,
      pendingTasks,
      observationsCount,
      lowStockItems
    };
  }

  async getSupervisorDashboard({ farmId, userId }) {
    const tasks = await this.prisma.task.findMany({
      where: {
        farm_id: farmId,
        OR: [
          { supervisor_user_id: userId },
          { assignments: { some: { user_id: userId } } }
        ]
      },
      include: { assignments: { include: { user: true } }, field: true }
    });

    return {
      role: ROLES.FIELD_SUPERVISOR,
      mySupervisedTasks: tasks
    };
  }

  async getWorkerDashboard({ farmId, userId }) {
    const myTasks = await this.prisma.task.findMany({
      where: {
        farm_id: farmId,
        assignments: { some: { user_id: userId } },
        status: { not: TASK_STATUSES.COMPLETED }
      },
      include: { field: true, planting_batch: { include: { crop_type: true } } },
      orderBy: { planned_date: 'asc' }
    });

    return {
      role: ROLES.FARM_WORKER,
      assignedTasks: myTasks
    };
  }

  async getStorekeeperDashboard({ farmId }) {
    const [totalItems, lowStockItems, recentReceipts, recentIssues] = await Promise.all([
      this.prisma.inventoryItem.count({ where: { farm_id: farmId } }),
      this.prisma.inventoryItem.findMany({ where: { farm_id: farmId, current_balance: { lte: 0 } } }),
      this.prisma.stockReceipt.findMany({ where: { farm_id: farmId }, take: 5, orderBy: { receipt_date: 'desc' } }),
      this.prisma.stockIssue.findMany({ where: { farm_id: farmId }, take: 5, orderBy: { issue_date: 'desc' } })
    ]);

    return {
      role: ROLES.STOREKEEPER,
      totalItems,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentReceipts,
      recentIssues
    };
  }

  async getAccountantDashboard({ farmId }) {
    const [salesAgg, expensesAgg, cashAccounts, debtors, creditors] = await Promise.all([
      this.prisma.sale.aggregate({ where: { farm_id: farmId }, _sum: { total_amount: true, paid_amount: true } }),
      this.prisma.expense.aggregate({ where: { farm_id: farmId }, _sum: { amount: true } }),
      this.prisma.cashAccount.findMany({ where: { farm_id: farmId, is_active: true } }),
      this.prisma.customer.findMany({ where: { farm_id: farmId, current_balance: { gt: 0 } }, take: 10 }),
      this.prisma.supplier.findMany({ where: { farm_id: farmId, current_balance: { gt: 0 } }, take: 10 })
    ]);

    const totalInvoiced = Number(salesAgg._sum?.total_amount || 0);
    const totalCollected = Number(salesAgg._sum?.paid_amount || 0);
    const totalExpenses = Number(expensesAgg._sum?.amount || 0);
    const totalCash = cashAccounts.reduce((sum, a) => sum + Number(a.current_balance), 0);

    return {
      role: ROLES.ACCOUNTANT,
      totalInvoiced,
      totalCollected,
      outstandingCustomerDebt: totalInvoiced - totalCollected,
      totalExpenses,
      netCashFlow: totalCollected - totalExpenses,
      cashAccounts,
      topDebtors: debtors,
      topCreditors: creditors
    };
  }

  // --- Reports ---
  async getCropProductionReport({ farmId, seasonId }) {
    const where = { farm_id: farmId };
    if (seasonId) where.season_id = seasonId;

    const batches = await this.prisma.plantingBatch.findMany({
      where,
      include: {
        crop_type: true,
        field: true,
        season: true,
        harvest_records: true
      }
    });

    return batches.map(b => {
      const harvestedQty = b.harvest_records.reduce((sum, h) => sum + Number(h.quantity), 0);
      const laborCost = b.harvest_records.reduce((sum, h) => sum + Number(h.labor_cost || 0), 0);
      return {
        batchCode: b.batch_code,
        crop: b.crop_type.name,
        field: b.field.name,
        season: b.season.name,
        plantedArea: Number(b.planted_area),
        areaUnit: b.area_unit,
        totalHarvested: harvestedQty,
        harvestUnit: b.harvest_records[0]?.unit || 'KG',
        laborCost,
        status: b.status
      };
    });
  }
}
