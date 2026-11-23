import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const createCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  openingBalance: z.number().optional(),
  notes: z.string().optional()
});

const saleLineSchema = z.object({
  produceLotId: z.string().uuid().optional(),
  cropTypeId: z.string().uuid().optional(),
  description: z.string().min(2),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: z.number().positive()
});

const recordSaleSchema = z.object({
  customerId: z.string().uuid(),
  temporaryOfflineRef: z.string().optional(),
  saleDate: z.string().optional(),
  dueDate: z.string().optional(),
  lines: z.array(saleLineSchema).min(1),
  discountAmount: z.number().nonnegative().optional(),
  initialPaymentAmount: z.number().nonnegative().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT']).optional(),
  cashAccountId: z.string().uuid().optional(),
  notes: z.string().optional()
});

const recordPaymentSchema = z.object({
  customerId: z.string().uuid(),
  saleId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT']).optional(),
  cashAccountId: z.string().uuid().optional(),
  referenceCode: z.string().optional(),
  notes: z.string().optional()
});

const recordExpenseSchema = z.object({
  categoryId: z.string().uuid(),
  fieldId: z.string().uuid().optional(),
  plantingBatchId: z.string().uuid().optional(),
  seasonId: z.string().uuid().optional(),
  expenseDate: z.string().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY']).optional(),
  cashAccountId: z.string().uuid().optional(),
  vendorName: z.string().optional(),
  description: z.string().optional(),
  receiptAttachmentUrl: z.string().optional()
});

export class FinanceController {
  constructor(financeService) {
    this.financeService = financeService;
  }

  listCustomers = async (req, res, next) => {
    try {
      const customers = await this.financeService.listCustomers({
        farmId: req.user.farmId,
        search: req.query.search
      });
      return successResponse(res, customers);
    } catch (err) { next(err); }
  };

  createCustomer = async (req, res, next) => {
    try {
      const validated = createCustomerSchema.parse(req.body);
      const customer = await this.financeService.createCustomer({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, customer, 201);
    } catch (err) { next(err); }
  };

  recordSale = async (req, res, next) => {
    try {
      const validated = recordSaleSchema.parse(req.body);
      const result = await this.financeService.recordSale({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, result, 201);
    } catch (err) { next(err); }
  };

  recordPayment = async (req, res, next) => {
    try {
      const validated = recordPaymentSchema.parse(req.body);
      const payment = await this.financeService.recordCustomerPayment({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, payment, 201);
    } catch (err) { next(err); }
  };

  listExpenses = async (req, res, next) => {
    try {
      const result = await this.financeService.listExpenses({
        farmId: req.user.farmId,
        categoryId: req.query.categoryId,
        fieldId: req.query.fieldId,
        seasonId: req.query.seasonId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  recordExpense = async (req, res, next) => {
    try {
      const validated = recordExpenseSchema.parse(req.body);
      const expense = await this.financeService.recordExpense({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, expense, 201);
    } catch (err) { next(err); }
  };

  cashSummary = async (req, res, next) => {
    try {
      const summary = await this.financeService.getCashSummary({ farmId: req.user.farmId });
      return successResponse(res, summary);
    } catch (err) { next(err); }
  };
}
