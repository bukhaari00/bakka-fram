import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceService } from '../src/modules/finance/finance.service.js';
import { PAYMENT_STATUSES } from '@bakka/shared';

describe('Bakka Farm Commerce & Financial Transactions Tests', () => {
  let mockPrisma;
  let financeService;

  beforeEach(() => {
    mockPrisma = {
      customer: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
      },
      sale: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      saleLine: { create: vi.fn() },
      customerPayment: { create: vi.fn() },
      cashAccount: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
      cashTransaction: { create: vi.fn() },
      produceLot: { findUnique: vi.fn(), update: vi.fn() },
      produceMovement: { create: vi.fn() },
      expense: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
      supplier: { findMany: vi.fn(), create: vi.fn() },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(async (cb) => await cb(mockPrisma))
    };

    financeService = new FinanceService(mockPrisma);
  });

  it('records sale with temporary offline reference and assigns canonical server invoice number', async () => {
    mockPrisma.sale.findFirst.mockResolvedValue(null);
    mockPrisma.customer.findUnique.mockResolvedValue({
      id: 'cust-1',
      name: 'Somali Fresh Markets',
      current_balance: 0.0
    });
    mockPrisma.sale.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await financeService.recordSale({
      farmId: 'farm-1',
      customerId: 'cust-1',
      temporaryOfflineRef: 'DEV-TAB-OFFLINE-0042',
      lines: [
        {
          description: 'Sweet Corn - Grade A',
          quantity: 100,
          unit: 'KG',
          unitPrice: 1.50
        }
      ],
      discountAmount: 10.0,
      initialPaymentAmount: 50.0, // Partial payment ($140 total, $50 paid, $90 due)
      paymentMethod: 'CASH',
      actorUserId: 'accountant-1'
    });

    expect(result.sale.total_amount).toBe(140.0); // 100 * 1.50 - 10 = 140
    expect(result.sale.paid_amount).toBe(50.0);
    expect(result.sale.payment_status).toBe(PAYMENT_STATUSES.PARTIAL);
    expect(result.sale.temporary_offline_ref).toBe('DEV-TAB-OFFLINE-0042');
    expect(result.sale.invoice_number).toMatch(/^INV-\d{4}-\d+/);

    // Customer balance updated by unpaid amount: $90
    expect(mockPrisma.customer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cust-1' },
        data: expect.objectContaining({
          current_balance: 90.0
        })
      })
    );
  });

  it('guarantees idempotency for repeated sync of the same temporary offline sale', async () => {
    mockPrisma.sale.findFirst.mockResolvedValue({
      id: 'sale-already-created',
      invoice_number: 'INV-2026-0001',
      temporary_offline_ref: 'DEV-TAB-OFFLINE-0042'
    });

    const result = await financeService.recordSale({
      farmId: 'farm-1',
      customerId: 'cust-1',
      temporaryOfflineRef: 'DEV-TAB-OFFLINE-0042',
      lines: [],
      actorUserId: 'accountant-1'
    });

    expect(result.isReplay).toBe(true);
    expect(result.sale.id).toBe('sale-already-created');
    expect(mockPrisma.sale.create).not.toHaveBeenCalled();
  });

  it('records cash outflow transaction when logging farm expenses', async () => {
    mockPrisma.expense.create.mockResolvedValue({
      id: 'exp-diesel-1',
      amount: 180.0
    });
    mockPrisma.cashAccount.findUnique.mockResolvedValue({
      id: 'cash-safe',
      current_balance: 1000.0
    });

    const expense = await financeService.recordExpense({
      farmId: 'farm-1',
      categoryId: 'cat-fuel',
      amount: 180.0,
      cashAccountId: 'cash-safe',
      paymentMethod: 'CASH',
      vendorName: 'Hass Petroleum Afgooye',
      description: 'Diesel for tractor plowing field 2',
      actorUserId: 'manager-1'
    });

    expect(expense.id).toBe('exp-diesel-1');
    // Cash account balance decreased from 1000 to 820
    expect(mockPrisma.cashAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cash-safe' },
        data: { current_balance: 820.0 }
      })
    );
    // Cash transaction recorded as OUTFLOW
    expect(mockPrisma.cashTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          transaction_type: 'OUTFLOW',
          amount: 180.0,
          running_balance: 820.0
        })
      })
    );
  });
});
