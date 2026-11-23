import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { createAuthMiddleware, requirePermission } from '../../middleware/auth.js';
import { PERMISSIONS } from '@bakka/shared';

export function createInventoryRouter(prisma) {
  const router = Router();
  const inventoryService = new InventoryService(prisma);
  const inventoryController = new InventoryController(inventoryService);
  const authenticate = createAuthMiddleware(prisma);

  router.use(authenticate);

  router.get('/', requirePermission(PERMISSIONS.INVENTORY_VIEW), inventoryController.list);
  router.post('/', requirePermission(PERMISSIONS.INVENTORY_MANAGE), inventoryController.create);
  router.post('/receipts', requirePermission(PERMISSIONS.STOCK_RECEIPT), inventoryController.recordReceipt);
  router.post('/issues', requirePermission(PERMISSIONS.STOCK_ISSUE), inventoryController.recordIssue);
  router.post('/:itemId/reconcile', requirePermission(PERMISSIONS.STOCK_ADJUST), inventoryController.reconcile);

  return router;
}
