import { Router } from 'express';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { createAuthMiddleware, requirePermission } from '../../middleware/auth.js';
import { PERMISSIONS } from '@bakka/shared';

export function createFinanceRouter(prisma) {
  const router = Router();
  const financeService = new FinanceService(prisma);
  const financeController = new FinanceController(financeService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  // Customers
  router.get('/customers', requirePermission(PERMISSIONS.CUSTOMERS_VIEW), financeController.listCustomers);
  router.post('/customers', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), financeController.createCustomer);

  // Sales
  router.post('/sales', requirePermission(PERMISSIONS.SALES_MANAGE), financeController.recordSale);
  router.post('/payments', requirePermission(PERMISSIONS.PAYMENTS_MANAGE), financeController.recordPayment);

  // Expenses
  router.get('/expenses', requirePermission(PERMISSIONS.EXPENSES_VIEW), financeController.listExpenses);
  router.post('/expenses', requirePermission(PERMISSIONS.EXPENSES_MANAGE), financeController.recordExpense);

  // Cash Ledger Summary
  router.get('/cash-summary', requirePermission(PERMISSIONS.FINANCE_REPORTS), financeController.cashSummary);

  return router;
}
