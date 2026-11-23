import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const recordHarvestSchema = z.object({
  plantingBatchId: z.string().uuid(),
  fieldId: z.string().uuid(),
  harvestDate: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  qualityGrade: z.string().optional(),
  harvestedByUsers: z.string().optional(),
  laborCost: z.number().nonnegative().optional(),
  storageLocationId: z.string().uuid().optional(),
  destination: z.enum(['STORAGE', 'DIRECT_SALE', 'PROCESSING', 'HOUSEHOLD_USE', 'WASTE']).optional(),
  isFinalHarvestForBatch: z.boolean().optional(),
  notes: z.string().optional()
});

const recordMovementSchema = z.object({
  produceLotId: z.string().uuid(),
  destination: z.enum(['STORAGE', 'DIRECT_SALE', 'PROCESSING', 'HOUSEHOLD_USE', 'WASTE']),
  quantity: z.number().positive(),
  movementDate: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional()
});

export class HarvestController {
  constructor(harvestService) {
    this.harvestService = harvestService;
  }

  list = async (req, res, next) => {
    try {
      const result = await this.harvestService.listHarvests({
        farmId: req.user.farmId,
        plantingBatchId: req.query.plantingBatchId,
        fieldId: req.query.fieldId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  recordHarvest = async (req, res, next) => {
    try {
      const validated = recordHarvestSchema.parse(req.body);
      const result = await this.harvestService.recordHarvest({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, result, 201);
    } catch (err) { next(err); }
  };

  recordMovement = async (req, res, next) => {
    try {
      const validated = recordMovementSchema.parse(req.body);
      const movement = await this.harvestService.recordProduceMovement({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, movement, 201);
    } catch (err) { next(err); }
  };

  summary = async (req, res, next) => {
    try {
      const result = await this.harvestService.getHarvestSummary({
        farmId: req.user.farmId,
        seasonId: req.query.seasonId
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };
}
