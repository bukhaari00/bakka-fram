import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';
import { STOCK_MOVEMENT_TYPES, PERMISSIONS } from '@bakka/shared';

export class InventoryService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async listItems({ farmId, category, lowStockOnly }) {
    const where = { farm_id: farmId };
    if (category) where.category = category;

    const items = await this.prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return items.map(item => {
      const isLowStock = Number(item.current_balance) <= Number(item.reorder_level);
      return {
        ...item,
        is_low_stock: isLowStock
      };
    }).filter(item => lowStockOnly ? item.is_low_stock : true);
  }

  async createItem({ farmId, name, code, category, defaultUnit = 'KG', reorderLevel = 0, requiresExpiry = false, notes, actorUserId, req }) {
    const item = await this.prisma.inventoryItem.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        code,
        category,
        default_unit: defaultUnit,
        reorder_level: reorderLevel,
        current_balance: 0,
        requires_expiry: requiresExpiry,
        notes
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'INVENTORY_ITEM_CREATED',
      entityType: 'InventoryItem',
      entityId: item.id,
      newValues: { name, code, category, reorderLevel },
      req
    });

    return item;
  }

  /**
   * Transactional Stock Receipt
   * Appends to StockReceipt, StockReceiptLine, and StockLedger (+qty)
   */
  async recordReceipt({
    farmId,
    supplierId,
    receiptNumber,
    receiptDate,
    invoiceReference,
    lines, // [{ itemId, locationId, quantity, unit, unitCost, batchNumber, expiryDate }]
    notes,
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const receiptId = uuidv4();
      let totalReceiptAmount = 0;

      for (const line of lines) {
        totalReceiptAmount += Number(line.quantity) * Number(line.unitCost || 0);
      }

      const receipt = await tx.stockReceipt.create({
        data: {
          id: receiptId,
          farm_id: farmId,
          supplier_id: supplierId || null,
          receipt_number: receiptNumber,
          receipt_date: new Date(receiptDate || Date.now()),
          invoice_reference: invoiceReference || null,
          total_amount: totalReceiptAmount,
          recorded_by_user_id: actorUserId,
          notes
        }
      });

      for (const line of lines) {
        const lineTotal = Number(line.quantity) * Number(line.unitCost || 0);

        await tx.stockReceiptLine.create({
          data: {
            id: uuidv4(),
            receipt_id: receiptId,
            item_id: line.itemId,
            location_id: line.locationId || null,
            quantity: line.quantity,
            unit: line.unit,
            unit_cost: line.unitCost || 0,
            total_cost: lineTotal,
            batch_number: line.batchNumber || null,
            expiry_date: line.expiryDate ? new Date(line.expiryDate) : null
          }
        });

        const currentItem = await tx.inventoryItem.findUnique({
          where: { id: line.itemId }
        });

        if (!currentItem) {
          throw new AppError(`Item ${line.itemId} not found`, 404);
        }

        const newBalance = Number(currentItem.current_balance) + Number(line.quantity);

        // Append to immutable Stock Ledger
        await tx.stockLedger.create({
          data: {
            id: uuidv4(),
            farm_id: farmId,
            item_id: line.itemId,
            location_id: line.locationId || null,
            movement_type: STOCK_MOVEMENT_TYPES.RECEIPT,
            quantity: line.quantity,
            running_balance: newBalance,
            reference_type: 'StockReceipt',
            reference_id: receiptId,
            recorded_by_user_id: actorUserId,
            notes: `Receipt #${receiptNumber}`
          }
        });

        // Update item balance
        await tx.inventoryItem.update({
          where: { id: line.itemId },
          data: {
            current_balance: newBalance,
            version: { increment: 1 }
          }
        });
      }

      await logAudit(tx, {
        farmId,
        userId: actorUserId,
        action: 'STOCK_RECEIPT_RECORDED',
        entityType: 'StockReceipt',
        entityId: receipt.id,
        newValues: { receiptNumber, lineCount: lines.length, totalAmount: totalReceiptAmount },
        req
      });

      return receipt;
    });
  }

  /**
   * Transactional Stock Issue
   * Prevents negative stock unless override permitted
   */
  async recordIssue({
    farmId,
    issueNumber,
    issueDate,
    purpose,
    fieldId,
    plantingBatchId,
    taskId,
    issuedToUserId,
    lines, // [{ itemId, locationId, quantity, unit, unitCost }]
    notes,
    allowNegativeOverride = false,
    userPermissions = [],
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const issueId = uuidv4();

      // Pre-flight check balances for all lines
      for (const line of lines) {
        const item = await tx.inventoryItem.findUnique({
          where: { id: line.itemId }
        });

        if (!item) {
          throw new AppError(`Inventory item ${line.itemId} not found.`, 404);
        }

        const available = Number(item.current_balance);
        const requested = Number(line.quantity);

        if (available < requested) {
          if (!allowNegativeOverride) {
            throw new AppError(
              `Insufficient stock for '${item.name}'. Available: ${available} ${item.default_unit}, Requested: ${requested}. Negative stock disallowed.`,
              400
            );
          }

          if (!userPermissions.includes(PERMISSIONS.STOCK_OVERRIDE_NEGATIVE)) {
            throw new AppError(
              `Negative stock override required for '${item.name}', but user lacks 'stock:override_negative' permission.`,
              403
            );
          }
        }
      }

      const issue = await tx.stockIssue.create({
        data: {
          id: issueId,
          farm_id: farmId,
          issue_number: issueNumber,
          issue_date: new Date(issueDate || Date.now()),
          purpose,
          field_id: fieldId || null,
          planting_batch_id: plantingBatchId || null,
          task_id: taskId || null,
          issued_to_user_id: issuedToUserId || null,
          recorded_by_user_id: actorUserId,
          notes
        }
      });

      for (const line of lines) {
        const item = await tx.inventoryItem.findUnique({ where: { id: line.itemId } });
        const newBalance = Number(item.current_balance) - Number(line.quantity);

        await tx.stockIssueLine.create({
          data: {
            id: uuidv4(),
            issue_id: issueId,
            item_id: line.itemId,
            location_id: line.locationId || null,
            quantity: line.quantity,
            unit: line.unit,
            unit_cost: line.unitCost || 0,
            total_cost: Number(line.quantity) * Number(line.unitCost || 0)
          }
        });

        // Append to immutable Stock Ledger
        await tx.stockLedger.create({
          data: {
            id: uuidv4(),
            farm_id: farmId,
            item_id: line.itemId,
            location_id: line.locationId || null,
            movement_type: STOCK_MOVEMENT_TYPES.ISSUE,
            quantity: line.quantity,
            running_balance: newBalance,
            reference_type: 'StockIssue',
            reference_id: issueId,
            recorded_by_user_id: actorUserId,
            notes: `Issue #${issueNumber}: ${purpose}`
          }
        });

        await tx.inventoryItem.update({
          where: { id: line.itemId },
          data: {
            current_balance: newBalance,
            version: { increment: 1 }
          }
        });
      }

      await logAudit(tx, {
        farmId,
        userId: actorUserId,
        action: 'STOCK_ISSUE_RECORDED',
        entityType: 'StockIssue',
        entityId: issue.id,
        newValues: { issueNumber, purpose, lineCount: lines.length },
        req
      });

      return issue;
    });
  }

  /**
   * Reconcile Item Balance from Ledger
   */
  async reconcileBalance({ farmId, itemId }) {
    const movements = await this.prisma.stockLedger.findMany({
      where: { farm_id: farmId, item_id: itemId },
      orderBy: { created_at: 'asc' }
    });

    let calculatedBalance = 0;
    for (const mov of movements) {
      const qty = Number(mov.quantity);
      if ([STOCK_MOVEMENT_TYPES.RECEIPT, STOCK_MOVEMENT_TYPES.ADJUSTMENT_ADD].includes(mov.movement_type)) {
        calculatedBalance += qty;
      } else if ([STOCK_MOVEMENT_TYPES.ISSUE, STOCK_MOVEMENT_TYPES.ADJUSTMENT_SUBTRACT].includes(mov.movement_type)) {
        calculatedBalance -= qty;
      }
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        current_balance: calculatedBalance,
        version: { increment: 1 }
      }
    });

    return {
      itemId,
      movementCount: movements.length,
      reconciledBalance: calculatedBalance,
      updatedBalance: updated.current_balance
    };
  }
}
