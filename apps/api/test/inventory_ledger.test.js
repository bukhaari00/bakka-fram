import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../src/modules/inventory/inventory.service.js';
import { STOCK_MOVEMENT_TYPES, PERMISSIONS } from '@bakka/shared';

describe('Bakka Farm Inventory & Immutable Stock Ledger Tests', () => {
  let mockPrisma;
  let inventoryService;

  beforeEach(() => {
    mockPrisma = {
      inventoryItem: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
      },
      stockReceipt: { create: vi.fn() },
      stockReceiptLine: { create: vi.fn() },
      stockIssue: { create: vi.fn() },
      stockIssueLine: { create: vi.fn() },
      stockLedger: { create: vi.fn(), findMany: vi.fn() },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(async (callback) => await callback(mockPrisma))
    };

    inventoryService = new InventoryService(mockPrisma);
  });

  it('records stock receipt and updates ledger and item balance atomically', async () => {
    mockPrisma.inventoryItem.findUnique.mockResolvedValue({
      id: 'item-fertilizer-npk',
      name: 'NPK Fertilizer',
      current_balance: 50.0,
      default_unit: 'BAG_50KG'
    });

    mockPrisma.stockReceipt.create.mockResolvedValue({
      id: 'receipt-101',
      receipt_number: 'REC-2026-001'
    });

    const receipt = await inventoryService.recordReceipt({
      farmId: 'farm-1',
      receiptNumber: 'REC-2026-001',
      lines: [
        {
          itemId: 'item-fertilizer-npk',
          quantity: 20.0,
          unit: 'BAG_50KG',
          unitCost: 35.0
        }
      ],
      actorUserId: 'storekeeper-1'
    });

    expect(receipt.id).toBe('receipt-101');
    // Ledger entry must be created with RECEIPT and running balance 70
    expect(mockPrisma.stockLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          item_id: 'item-fertilizer-npk',
          movement_type: STOCK_MOVEMENT_TYPES.RECEIPT,
          quantity: 20.0,
          running_balance: 70.0
        })
      })
    );
    // InventoryItem updated to balance 70
    expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-fertilizer-npk' },
        data: expect.objectContaining({
          current_balance: 70.0
        })
      })
    );
  });

  it('strictly prevents negative stock when balance is insufficient', async () => {
    mockPrisma.inventoryItem.findUnique.mockResolvedValue({
      id: 'item-urea',
      name: 'Urea 46%',
      current_balance: 5.0,
      default_unit: 'BAG_50KG'
    });

    // Attempting to issue 10 bags when only 5 are in stock without override
    await expect(
      inventoryService.recordIssue({
        farmId: 'farm-1',
        issueNumber: 'ISS-001',
        purpose: 'Top dressing field B',
        lines: [{ itemId: 'item-urea', quantity: 10.0, unit: 'BAG_50KG' }],
        allowNegativeOverride: false,
        actorUserId: 'storekeeper-1'
      })
    ).rejects.toThrow(/insufficient stock/i);

    expect(mockPrisma.stockIssue.create).not.toHaveBeenCalled();
    expect(mockPrisma.stockLedger.create).not.toHaveBeenCalled();
  });

  it('allows negative stock only when user has explicit override permission', async () => {
    mockPrisma.inventoryItem.findUnique.mockResolvedValue({
      id: 'item-urea',
      name: 'Urea 46%',
      current_balance: 5.0,
      default_unit: 'BAG_50KG'
    });
    mockPrisma.stockIssue.create.mockResolvedValue({ id: 'iss-99', issue_number: 'ISS-099' });

    // User has permission: ALLOWED
    const issue = await inventoryService.recordIssue({
      farmId: 'farm-1',
      issueNumber: 'ISS-099',
      purpose: 'Emergency field treatment',
      lines: [{ itemId: 'item-urea', quantity: 10.0, unit: 'BAG_50KG' }],
      allowNegativeOverride: true,
      userPermissions: [PERMISSIONS.STOCK_OVERRIDE_NEGATIVE],
      actorUserId: 'admin-1'
    });

    expect(issue.id).toBe('iss-99');
    expect(mockPrisma.stockLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          movement_type: STOCK_MOVEMENT_TYPES.ISSUE,
          running_balance: -5.0
        })
      })
    );
  });

  it('reconciles item balance by summing immutable ledger movements', async () => {
    mockPrisma.stockLedger.findMany.mockResolvedValue([
      { movement_type: STOCK_MOVEMENT_TYPES.RECEIPT, quantity: 100 },
      { movement_type: STOCK_MOVEMENT_TYPES.ISSUE, quantity: 30 },
      { movement_type: STOCK_MOVEMENT_TYPES.ISSUE, quantity: 20 },
      { movement_type: STOCK_MOVEMENT_TYPES.ADJUSTMENT_ADD, quantity: 5 }
    ]);

    mockPrisma.inventoryItem.update.mockResolvedValue({
      id: 'item-seed',
      current_balance: 55
    });

    const result = await inventoryService.reconcileBalance({
      farmId: 'farm-1',
      itemId: 'item-seed'
    });

    expect(result.movementCount).toBe(4);
    expect(result.reconciledBalance).toBe(55); // 100 - 30 - 20 + 5 = 55
  });
});
