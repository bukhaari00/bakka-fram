import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const createItemSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  category: z.string(),
  defaultUnit: z.string().optional(),
  reorderLevel: z.number().nonnegative().optional(),
  requiresExpiry: z.boolean().optional(),
  notes: z.string().optional()
});

const receiptLineSchema = z.object({
  itemId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitCost: z.number().nonnegative().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional()
});

const recordReceiptSchema = z.object({
  receiptNumber: z.string().min(2),
  receiptDate: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  invoiceReference: z.string().optional(),
  lines: z.array(receiptLineSchema).min(1),
  notes: z.string().optional()
});

const issueLineSchema = z.object({
  itemId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitCost: z.number().nonnegative().optional()
});

const recordIssueSchema = z.object({
  issueNumber: z.string().min(2),
  issueDate: z.string().optional(),
  purpose: z.string().min(2),
  fieldId: z.string().uuid().optional(),
  plantingBatchId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  issuedToUserId: z.string().uuid().optional(),
  lines: z.array(issueLineSchema).min(1),
  notes: z.string().optional(),
  allowNegativeOverride: z.boolean().optional()
});

export class InventoryController {
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
  }

  list = async (req, res, next) => {
    try {
      const items = await this.inventoryService.listItems({
        farmId: req.user.farmId,
        category: req.query.category,
        lowStockOnly: req.query.lowStockOnly === 'true'
      });
      return successResponse(res, items);
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const validated = createItemSchema.parse(req.body);
      const item = await this.inventoryService.createItem({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, item, 201);
    } catch (err) { next(err); }
  };

  recordReceipt = async (req, res, next) => {
    try {
      const validated = recordReceiptSchema.parse(req.body);
      const receipt = await this.inventoryService.recordReceipt({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, receipt, 201);
    } catch (err) { next(err); }
  };

  recordIssue = async (req, res, next) => {
    try {
      const validated = recordIssueSchema.parse(req.body);
      const issue = await this.inventoryService.recordIssue({
        farmId: req.user.farmId,
        ...validated,
        userPermissions: req.user.permissions,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, issue, 201);
    } catch (err) { next(err); }
  };

  reconcile = async (req, res, next) => {
    try {
      const result = await this.inventoryService.reconcileBalance({
        farmId: req.user.farmId,
        itemId: req.params.itemId
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };
}
