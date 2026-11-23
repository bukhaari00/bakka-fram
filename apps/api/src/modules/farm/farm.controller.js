import { z } from 'zod';
import { successResponse } from '../../utils/response.js';

const createFieldSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  totalArea: z.number().positive(),
  areaUnit: z.string().optional(),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  notes: z.string().optional()
});

const createSeasonSchema = z.object({
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string().optional()
});

const createCropTypeSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  defaultUnit: z.string().optional(),
  expectedDurationDays: z.number().int().positive().optional(),
  notes: z.string().optional()
});

const createVarietySchema = z.object({
  name: z.string().min(2),
  daysToMaturity: z.number().int().positive().optional(),
  yieldPotential: z.string().optional(),
  notes: z.string().optional()
});

const createBatchSchema = z.object({
  fieldId: z.string().uuid(),
  cropTypeId: z.string().uuid(),
  cropVarietyId: z.string().uuid().optional(),
  seasonId: z.string().uuid(),
  batchCode: z.string().min(2),
  plantingDate: z.string(),
  plantedArea: z.number().positive(),
  areaUnit: z.string().optional(),
  seedQuantity: z.number().positive(),
  seedUnit: z.string().optional(),
  plantingMethod: z.string().optional(),
  expectedHarvestDate: z.string().optional(),
  notes: z.string().optional()
});

const createObservationSchema = z.object({
  plantingBatchId: z.string().uuid(),
  fieldId: z.string().uuid().optional(),
  observationDate: z.string().optional(),
  growthStage: z.string().optional(),
  cropCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  pestDiseaseSigns: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional()
});

export class FarmController {
  constructor(farmService) {
    this.farmService = farmService;
  }

  getProfile = async (req, res, next) => {
    try {
      const profile = await this.farmService.getProfile({ farmId: req.user.farmId });
      return successResponse(res, profile);
    } catch (err) { next(err); }
  };

  listFields = async (req, res, next) => {
    try {
      const result = await this.farmService.listFields({
        farmId: req.user.farmId,
        status: req.query.status,
        search: req.query.search,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  createField = async (req, res, next) => {
    try {
      const validated = createFieldSchema.parse(req.body);
      const field = await this.farmService.createField({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, field, 201);
    } catch (err) { next(err); }
  };

  listSeasons = async (req, res, next) => {
    try {
      const seasons = await this.farmService.listSeasons({
        farmId: req.user.farmId,
        status: req.query.status
      });
      return successResponse(res, seasons);
    } catch (err) { next(err); }
  };

  createSeason = async (req, res, next) => {
    try {
      const validated = createSeasonSchema.parse(req.body);
      const season = await this.farmService.createSeason({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, season, 201);
    } catch (err) { next(err); }
  };

  listCrops = async (req, res, next) => {
    try {
      const crops = await this.farmService.listCrops({ farmId: req.user.farmId });
      return successResponse(res, crops);
    } catch (err) { next(err); }
  };

  createCropType = async (req, res, next) => {
    try {
      const validated = createCropTypeSchema.parse(req.body);
      const crop = await this.farmService.createCropType({
        farmId: req.user.farmId,
        ...validated
      });
      return successResponse(res, crop, 201);
    } catch (err) { next(err); }
  };

  createVariety = async (req, res, next) => {
    try {
      const validated = createVarietySchema.parse(req.body);
      const variety = await this.farmService.createCropVariety({
        cropTypeId: req.params.cropTypeId,
        ...validated
      });
      return successResponse(res, variety, 201);
    } catch (err) { next(err); }
  };

  listPlantingBatches = async (req, res, next) => {
    try {
      const result = await this.farmService.listPlantingBatches({
        farmId: req.user.farmId,
        fieldId: req.query.fieldId,
        seasonId: req.query.seasonId,
        status: req.query.status,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  createPlantingBatch = async (req, res, next) => {
    try {
      const validated = createBatchSchema.parse(req.body);
      const batch = await this.farmService.createPlantingBatch({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id,
        req
      });
      return successResponse(res, batch, 201);
    } catch (err) { next(err); }
  };

  createObservation = async (req, res, next) => {
    try {
      const validated = createObservationSchema.parse(req.body);
      const observation = await this.farmService.createObservation({
        farmId: req.user.farmId,
        ...validated,
        actorUserId: req.user.id
      });
      return successResponse(res, observation, 201);
    } catch (err) { next(err); }
  };
}
