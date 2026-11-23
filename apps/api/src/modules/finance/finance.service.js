import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';
import { PAYMENT_STATUSES, PRODUCE_DESTINATIONS } from '@bakka/shared';

export class FinanceService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // --- Customers ---
  async listCustomers({ farmId, search }) {
    const where = { farm_id: farmId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    return await this.prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  async createCustomer({ farmId, name, phone, email, address, openingBalance = 0, notes, actorUserId, req }) {
    const customer = await this.prisma.customer.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        phone,
        email,
        address,
        opening_balance: openingBalance,
        current_balance: openingBalance,
        notes
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      newValues: { name, phone, openingBalance },
      req
    });

    return customer;
  }

  // --- Sales & Sale Lines ---
  async recordSale({
    farmId,
    customerId,
    temporaryOfflineRef,
    saleDate,
    dueDate,
    lines, // [{ produceLotId, cropTypeId, description, quantity, unit, unitPrice }]
    discountAmount = 0,
    initialPaymentAmount = 0,
    paymentMethod = 'CASH',
    cashAccountId,
    notes,
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // Idempotency check if temporaryOfflineRef provided
      if (temporaryOfflineRef) {
        const existingSale = await tx.sale.findFirst({
          where: { farm_id: farmId, temporary_offline_ref: temporaryOfflineRef }
        });
        if (existingSale) {
          return { sale: existingSale, isReplay: true };
        }
      }

      const saleId = uuidv4();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      let subtotal = 0;
      for (const line of lines) {
        subtotal += Number(line.quantity) * Number(line.unitPrice);
      }

      const totalAmount = subtotal - Number(discountAmount);
      const paidAmount = Number(initialPaymentAmount);
      let paymentStatus = PAYMENT_STATUSES.PENDING;
      if (paidAmount >= totalAmount) {
        paymentStatus = PAYMENT_STATUSES.PAID;
      } else if (paidAmount > 0) {
        paymentStatus = PAYMENT_STATUSES.PARTIAL;
      }

      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          id: saleId,
          farm_id: farmId,
          customer_id: customerId,
          invoice_number: invoiceNumber,
          temporary_offline_ref: temporaryOfflineRef || null,
          sale_date: new Date(saleDate || Date.now()),
          due_date: dueDate ? new Date(dueDate) : null,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          paid_amount: paidAmount,
          payment_status: paymentStatus,
          notes,
          recorded_by_user_id: actorUserId
        }
      });

      // 2. Create Sale Lines and deduct from ProduceLot if provided
      for (const line of lines) {
        const lineTotal = Number(line.quantity) * Number(line.unitPrice);

        await tx.saleLine.create({
          data: {
            id: uuidv4(),
            sale_id: saleId,
            produce_lot_id: line.produceLotId || null,
            crop_type_id: line.cropTypeId || null,
            description: line.description,
            quantity: line.quantity,
            unit: line.unit,
            unit_price: line.unitPrice,
            line_total: lineTotal
          }
        });

        if (line.produceLotId) {
          const lot = await tx.produceLot.findUnique({ where: { id: line.produceLotId } });
          if (lot) {
            const remaining = Number(lot.current_quantity) - Number(line.quantity);
            await tx.produceLot.update({
              where: { id: line.produceLotId },
              data: {
                current_quantity: remaining,
                status: remaining <= 0 ? 'DEPLETED' : 'AVAILABLE'
              }
            });

            await tx.produceMovement.create({
              data: {
                id: uuidv4(),
                farm_id: farmId,
                produce_lot_id: line.produceLotId,
                destination: PRODUCE_DESTINATIONS.DIRECT_SALE,
                quantity: line.quantity,
                unit: line.unit,
                movement_date: new Date(saleDate || Date.now()),
                recorded_by_user_id: actorUserId,
                reference_type: 'Sale',
                reference_id: saleId,
                notes: `Sold via invoice #${invoiceNumber}`
              }
            });
          }
        }
      }

      // 3. Update Customer Outstanding Balance (unpaid portion)
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      const unpaidPortion = totalAmount - paidAmount;
      if (customer && unpaidPortion > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            current_balance: Number(customer.current_balance) + unpaidPortion,
            version: { increment: 1 }
          }
        });
      }

      // 4. Record Initial Payment and Cash Inflow if paidAmount > 0
      if (paidAmount > 0) {
        const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;
        await tx.customerPayment.create({
          data: {
            id: uuidv4(),
            farm_id: farmId,
            customer_id: customerId,
            sale_id: saleId,
            payment_number: paymentNumber,
            payment_date: new Date(saleDate || Date.now()),
            amount: paidAmount,
            payment_method: paymentMethod,
            received_by_user_id: actorUserId,
            notes: `Initial payment on sale #${invoiceNumber}`
          }
        });

        if (cashAccountId) {
          const cashAcc = await tx.cashAccount.findUnique({ where: { id: cashAccountId } });
          if (cashAcc) {
            const newCashBal = Number(cashAcc.current_balance) + paidAmount;
            await tx.cashAccount.update({
              where: { id: cashAccountId },
              data: { current_balance: newCashBal }
            });

            await tx.cashTransaction.create({
              data: {
                id: uuidv4(),
                farm_id: farmId,
                cash_account_id: cashAccountId,
                transaction_type: 'INFLOW',
                amount: paidAmount,
                running_balance: newCashBal,
                reference_type: 'Sale',
                reference_id: saleId,
                transaction_date: new Date(saleDate || Date.now()),
                recorded_by_user_id: actorUserId,
                notes: `Payment for Sale #${invoiceNumber}`
              }
            });
          }
        }
      }

      await logAudit(tx, {
        farmId,
        userId: actorUserId,
        action: 'SALE_INVOICE_RECORDED',
        entityType: 'Sale',
        entityId: sale.id,
        newValues: { invoiceNumber, temporaryOfflineRef, totalAmount, paidAmount, paymentStatus },
        req
      });

      return { sale, invoiceNumber, temporaryOfflineRef };
    });
  }

  // --- Customer Payments ---
  async recordCustomerPayment({
    farmId,
    customerId,
    saleId,
    amount,
    paymentMethod = 'CASH',
    cashAccountId,
    referenceCode,
    notes,
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;
      const pAmount = Number(amount);

      const payment = await tx.customerPayment.create({
        data: {
          id: uuidv4(),
          farm_id: farmId,
          customer_id: customerId,
          sale_id: saleId || null,
          payment_number: paymentNumber,
          payment_date: new Date(),
          amount: pAmount,
          payment_method: paymentMethod,
          reference_code: referenceCode || null,
          received_by_user_id: actorUserId,
          notes
        }
      });

      // Update customer balance
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (customer) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            current_balance: Number(customer.current_balance) - pAmount,
            version: { increment: 1 }
          }
        });
      }

      // Update sale if linked
      if (saleId) {
        const sale = await tx.sale.findUnique({ where: { id: saleId } });
        if (sale) {
          const newPaid = Number(sale.paid_amount) + pAmount;
          const status = newPaid >= Number(sale.total_amount) ? PAYMENT_STATUSES.PAID : PAYMENT_STATUSES.PARTIAL;
          await tx.sale.update({
            where: { id: saleId },
            data: {
              paid_amount: newPaid,
              payment_status: status,
              version: { increment: 1 }
            }
          });
        }
      }

      // Record cash inflow
      if (cashAccountId) {
        const cashAcc = await tx.cashAccount.findUnique({ where: { id: cashAccountId } });
        if (cashAcc) {
          const newCashBal = Number(cashAcc.current_balance) + pAmount;
          await tx.cashAccount.update({
            where: { id: cashAccountId },
            data: { current_balance: newCashBal }
          });

          await tx.cashTransaction.create({
            data: {
              id: uuidv4(),
              farm_id: farmId,
              cash_account_id: cashAccountId,
              transaction_type: 'INFLOW',
              amount: pAmount,
              running_balance: newCashBal,
              reference_type: 'CustomerPayment',
              reference_id: payment.id,
              transaction_date: new Date(),
              recorded_by_user_id: actorUserId,
              notes: `Customer payment #${paymentNumber}`
            }
          });
        }
      }

      return payment;
    });
  }

  // --- Suppliers & Purchases ---
  async listSuppliers({ farmId }) {
    return await this.prisma.supplier.findMany({
      where: { farm_id: farmId },
      orderBy: { name: 'asc' }
    });
  }

  async createSupplier({ farmId, name, contactPerson, phone, email, address, openingBalance = 0, notes }) {
    return await this.prisma.supplier.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        contact_person: contactPerson,
        phone,
        email,
        address,
        opening_balance: openingBalance,
        current_balance: openingBalance,
        notes
      }
    });
  }

  // --- Expenses & Cash Summary ---
  async listExpenses({ farmId, categoryId, fieldId, seasonId, startDate, endDate, page = 1, limit = 20 }) {
    const where = { farm_id: farmId };
    if (categoryId) where.category_id = categoryId;
    if (fieldId) where.field_id = fieldId;
    if (seasonId) where.season_id = seasonId;
    if (startDate || endDate) {
      where.expense_date = {};
      if (startDate) where.expense_date.gte = new Date(startDate);
      if (endDate) where.expense_date.lte = new Date(endDate);
    }

    const [total, items] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          field: true,
          season: true,
          recorded_by: { select: { id: true, full_name: true } }
        },
        orderBy: { expense_date: 'desc' }
      })
    ]);

    return { total, page, limit, items };
  }

  async recordExpense({
    farmId,
    categoryId,
    fieldId,
    plantingBatchId,
    seasonId,
    expenseDate,
    amount,
    paymentMethod = 'CASH',
    cashAccountId,
    vendorName,
    description,
    receiptAttachmentUrl,
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const expenseId = uuidv4();
      const expAmount = Number(amount);

      const expense = await tx.expense.create({
        data: {
          id: expenseId,
          farm_id: farmId,
          category_id: categoryId,
          field_id: fieldId || null,
          planting_batch_id: plantingBatchId || null,
          season_id: seasonId || null,
          expense_date: new Date(expenseDate || Date.now()),
          amount: expAmount,
          payment_method: paymentMethod,
          vendor_name: vendorName,
          description,
          receipt_attachment_url: receiptAttachmentUrl,
          recorded_by_user_id: actorUserId
        }
      });

      // Deduct from cash account
      if (cashAccountId) {
        const cashAcc = await tx.cashAccount.findUnique({ where: { id: cashAccountId } });
        if (cashAcc) {
          const newBalance = Number(cashAcc.current_balance) - expAmount;
          await tx.cashAccount.update({
            where: { id: cashAccountId },
            data: { current_balance: newBalance }
          });

          await tx.cashTransaction.create({
            data: {
              id: uuidv4(),
              farm_id: farmId,
              cash_account_id: cashAccountId,
              transaction_type: 'OUTFLOW',
              amount: expAmount,
              running_balance: newBalance,
              reference_type: 'Expense',
              reference_id: expenseId,
              transaction_date: new Date(expenseDate || Date.now()),
              recorded_by_user_id: actorUserId,
              notes: `Expense: ${description || vendorName || 'Direct Expense'}`
            }
          });
        }
      }

      await logAudit(tx, {
        farmId,
        userId: actorUserId,
        action: 'EXPENSE_RECORDED',
        entityType: 'Expense',
        entityId: expense.id,
        newValues: { categoryId, amount: expAmount, paymentMethod, vendorName },
        req
      });

      return expense;
    });
  }

  async getCashSummary({ farmId }) {
    const accounts = await this.prisma.cashAccount.findMany({
      where: { farm_id: farmId, is_active: true }
    });

    const totalCash = accounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
    return {
      totalCash,
      accounts
    };
  }
}
