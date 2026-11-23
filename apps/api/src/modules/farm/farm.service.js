import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';

export class FarmService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // --- Farm Profile & Units ---
  async getProfile({ farmId }) {
    return await this.prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        units: true,
        settings: true
      }
    });
  }

  async updateProfile({ farmId, name, location, contactPhone, contactEmail, currency, timezone, defaultLanguage, req, actorUserId }) {
    const updated = await this.prisma.farm.update({
      where: { id: farmId },
      data: {
        name,
        location,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        currency,
        timezone,
        default_language: defaultLanguage
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'FARM_PROFILE_UPDATED',
      entityType: 'Farm',
      entityId: farmId,
      newValues: { name, location, currency },
      req
    });

    return updated;
  }

  async createUnit({ farmId, name, symbol, category, factor }) {
    return await this.prisma.unit.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        symbol: symbol.toUpperCase(),
        category,
        conversion_factor_to_base: factor || 1.0
      }
    });
  }

  // --- Fields ---
  async listFields({ farmId, status, search, page = 1, limit = 20 }) {
    const where = { farm_id: farmId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.field.count({ where }),
      this.prisma.field.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          planting_batches: {
            where: { status: { not: 'ARCHIVED' } },
            include: { crop_type: true }
          }
        }
      })
    ]);

    return { total, page, limit, items };
  }

  async createField({ farmId, name, code, totalArea, areaUnit = 'HA', soilType, waterSource, notes, req, actorUserId }) {
    const field = await this.prisma.field.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        code,
        total_area: totalArea,
        area_unit: areaUnit,
        soil_type: soilType,
        water_source: waterSource,
        notes,
        status: 'ACTIVE'
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'FIELD_CREATED',
      entityType: 'Field',
      entityId: field.id,
      newValues: { name, code, totalArea },
      req
    });

    return field;
  }

  // --- Seasons ---
  async listSeasons({ farmId, status }) {
    const where = { farm_id: farmId };
    if (status) where.status = status;
    return await this.prisma.season.findMany({
      where,
      orderBy: { start_date: 'desc' }
    });
  }

  async createSeason({ farmId, name, startDate, endDate, req, actorUserId }) {
    const season = await this.prisma.season.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        start_date: new Date(startDate),
        end_date: endDate ? new Date(endDate) : null,
        status: 'ACTIVE'
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'SEASON_CREATED',
      entityType: 'Season',
      entityId: season.id,
      newValues: { name, startDate },
      req
    });

    return season;
  }

  // --- Crops & Varieties ---
  async listCrops({ farmId }) {
    return await this.prisma.cropType.findMany({
      where: { farm_id: farmId },
      include: {
        varieties: true
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCropType({ farmId, name, category, defaultUnit = 'KG', expectedDurationDays, notes }) {
    return await this.prisma.cropType.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        name,
        category,
        default_unit: defaultUnit,
        expected_duration_days: expectedDurationDays,
        notes
      }
    });
  }

  async createCropVariety({ cropTypeId, name, daysToMaturity, yieldPotential, notes }) {
    return await this.prisma.cropVariety.create({
      data: {
        id: uuidv4(),
        crop_type_id: cropTypeId,
        name,
        days_to_maturity: daysToMaturity,
        yield_potential: yieldPotential,
        notes
      }
    });
  }

  // --- Planting Batches ---
  async listPlantingBatches({ farmId, fieldId, seasonId, status, page = 1, limit = 20 }) {
    const where = { farm_id: farmId };
    if (fieldId) where.field_id = fieldId;
    if (seasonId) where.season_id = seasonId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.plantingBatch.count({ where }),
      this.prisma.plantingBatch.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          field: true,
          crop_type: true,
          crop_variety: true,
          season: true,
          observations: { take: 3, orderBy: { observation_date: 'desc' } }
        },
        orderBy: { planting_date: 'desc' }
      })
    ]);

    return { total, page, limit, items };
  }

  async createPlantingBatch({
    farmId,
    fieldId,
    cropTypeId,
    cropVarietyId,
    seasonId,
    batchCode,
    plantingDate,
    plantedArea,
    areaUnit = 'HA',
    seedQuantity,
    seedUnit = 'KG',
    plantingMethod,
    expectedHarvestDate,
    responsibleUserId,
    notes,
    req,
    actorUserId
  }) {
    const batch = await this.prisma.plantingBatch.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        field_id: fieldId,
        crop_type_id: cropTypeId,
        crop_variety_id: cropVarietyId || null,
        season_id: seasonId,
        batch_code: batchCode,
        planting_date: new Date(plantingDate),
        planted_area: plantedArea,
        area_unit: areaUnit,
        seed_quantity: seedQuantity,
        seed_unit: seedUnit,
        planting_method: plantingMethod,
        expected_harvest_date: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
        status: 'PLANTED',
        responsible_user_id: responsibleUserId || actorUserId,
        notes
      }
    });

    await logAudit(this.prisma, {
      farmId,
      userId: actorUserId,
      action: 'PLANTING_BATCH_CREATED',
      entityType: 'PlantingBatch',
      entityId: batch.id,
      newValues: { batchCode, fieldId, cropTypeId },
      req
    });

    return batch;
  }

  // --- Crop Observations ---
  async createObservation({
    farmId,
    plantingBatchId,
    fieldId,
    observationDate,
    growthStage,
    cropCondition,
    pestDiseaseSigns,
    notes,
    photoUrl,
    actorUserId
  }) {
    return await this.prisma.cropObservation.create({
      data: {
        id: uuidv4(),
        farm_id: farmId,
        planting_batch_id: plantingBatchId,
        field_id: fieldId || null,
        reporter_user_id: actorUserId,
        observation_date: new Date(observationDate || Date.now()),
        growth_stage: growthStage,
        crop_condition: cropCondition,
        pest_disease_signs: pestDiseaseSigns,
        notes,
        photo_url: photoUrl
      }
    });
  }
}
