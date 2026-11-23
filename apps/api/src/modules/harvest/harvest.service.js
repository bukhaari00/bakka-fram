import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { logAudit } from '../../utils/audit.js';
import { PRODUCE_DESTINATIONS } from '@bakka/shared';

export class HarvestService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async listHarvests({ farmId, plantingBatchId, fieldId, startDate, endDate, page = 1, limit = 20 }) {
    const where = { farm_id: farmId };
    if (plantingBatchId) where.planting_batch_id = plantingBatchId;
    if (fieldId) where.field_id = fieldId;
    if (startDate || endDate) {
      where.harvest_date = {};
      if (startDate) where.harvest_date.gte = new Date(startDate);
      if (endDate) where.harvest_date.lte = new Date(endDate);
    }

    const [total, items] = await Promise.all([
      this.prisma.harvestRecord.count({ where }),
      this.prisma.harvestRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          field: true,
          planting_batch: { include: { crop_type: true, season: true } },
          produce_lots: { include: { movements: true } },
          recorded_by: { select: { id: true, full_name: true } }
        },
        orderBy: { harvest_date: 'desc' }
      })
    ]);

    return { total, page, limit, items };
  }

  /**
   * Record a partial or complete harvest event
   * Generates a ProduceLot and initial destination movement
   */
  async recordHarvest({
    farmId,
    plantingBatchId,
    fieldId,
    harvestDate,
    quantity,
    unit = 'KG',
    qualityGrade = 'GRADE_A',
    harvestedByUsers,
    laborCost = 0,
    storageLocationId,
    destination = PRODUCE_DESTINATIONS.STORAGE,
    isFinalHarvestForBatch = false,
    notes,
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const harvestId = uuidv4();
      const lotId = uuidv4();
      const lotNumber = `LOT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const harvest = await tx.harvestRecord.create({
        data: {
          id: harvestId,
          farm_id: farmId,
          planting_batch_id: plantingBatchId,
          field_id: fieldId,
          harvest_date: new Date(harvestDate || Date.now()),
          quantity,
          unit,
          quality_grade: qualityGrade,
          harvested_by_users: harvestedByUsers,
          labor_cost: laborCost,
          recorded_by_user_id: actorUserId,
          notes
        }
      });

      // Create Produce Lot
      const lot = await tx.produceLot.create({
        data: {
          id: lotId,
          farm_id: farmId,
          harvest_record_id: harvestId,
          lot_number: lotNumber,
          initial_quantity: quantity,
          current_quantity: quantity,
          unit,
          storage_location_id: storageLocationId || null,
          quality_grade: qualityGrade,
          status: 'AVAILABLE'
        }
      });

      // Log initial produce movement
      await tx.produceMovement.create({
        data: {
          id: uuidv4(),
          farm_id: farmId,
          produce_lot_id: lotId,
          destination,
          quantity,
          unit,
          movement_date: new Date(harvestDate || Date.now()),
          recorded_by_user_id: actorUserId,
          reference_type: 'HarvestRecord',
          reference_id: harvestId,
          notes: `Initial destination upon harvest (${destination})`
        }
      });

      // If marked as final harvest, update planting batch status to HARVESTED
      if (isFinalHarvestForBatch) {
        await tx.plantingBatch.update({
          where: { id: plantingBatchId },
          data: { status: 'HARVESTED' }
        });
      }

      await logAudit(tx, {
        farmId,
        userId: actorUserId,
        action: 'HARVEST_RECORDED',
        entityType: 'HarvestRecord',
        entityId: harvest.id,
        newValues: { lotNumber, quantity, unit, qualityGrade, laborCost },
        req
      });

      return { harvest, lot };
    });
  }

  /**
   * Move produce from a lot to another destination (e.g. sale, processing, waste)
   */
  async recordProduceMovement({
    farmId,
    produceLotId,
    destination,
    quantity,
    movementDate,
    referenceType,
    referenceId,
    notes,
    actorUserId,
    req
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const lot = await tx.produceLot.findUnique({
        where: { id: produceLotId }
      });

      if (!lot) {
        throw new AppError('Produce lot not found.', 404);
      }

      const available = Number(lot.current_quantity);
      const requested = Number(quantity);

      if (available < requested) {
        throw new AppError(
          `Insufficient produce in lot ${lot.lot_number}. Available: ${available} ${lot.unit}, Requested: ${requested}.`,
          400
        );
      }

      const newLotQty = available - requested;

      const movement = await tx.produceMovement.create({
        data: {
          id: uuidv4(),
          farm_id: farmId,
          produce_lot_id: produceLotId,
          destination,
          quantity,
          unit: lot.unit,
          movement_date: new Date(movementDate || Date.now()),
          recorded_by_user_id: actorUserId,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
          notes
        }
      });

      await tx.produceLot.update({
        where: { id: produceLotId },
        data: {
          current_quantity: newLotQty,
          status: newLotQty <= 0 ? 'DEPLETED' : 'AVAILABLE',
          version: { increment: 1 }
        }
      });

      await logAudit(tx, {
        farmId,
        userId: actorUserId,
        action: 'PRODUCE_MOVEMENT_RECORDED',
        entityType: 'ProduceMovement',
        entityId: movement.id,
        newValues: { produceLotId, destination, quantity, remainingInLot: newLotQty },
        req
      });

      return movement;
    });
  }

  /**
   * Harvest summary aggregated by crop, field, and season
   */
  async getHarvestSummary({ farmId, seasonId }) {
    const harvests = await this.prisma.harvestRecord.findMany({
      where: {
        farm_id: farmId,
        ...(seasonId ? { planting_batch: { season_id: seasonId } } : {})
      },
      include: {
        field: true,
        planting_batch: { include: { crop_type: true, season: true } }
      }
    });

    const summaryByCrop = {};
    let totalHarvestQty = 0;
    let totalLaborCost = 0;

    for (const h of harvests) {
      const cropName = h.planting_batch?.crop_type?.name || 'Unknown Crop';
      const qty = Number(h.quantity);
      const labor = Number(h.labor_cost || 0);

      totalHarvestQty += qty;
      totalLaborCost += labor;

      if (!summaryByCrop[cropName]) {
        summaryByCrop[cropName] = { cropName, totalQuantity: 0, unit: h.unit, totalLaborCost: 0, harvestCount: 0 };
      }
      summaryByCrop[cropName].totalQuantity += qty;
      summaryByCrop[cropName].totalLaborCost += labor;
      summaryByCrop[cropName].harvestCount += 1;
    }

    return {
      totalHarvests: harvests.length,
      totalQuantity: totalHarvestQty,
      totalLaborCost,
      crops: Object.values(summaryByCrop)
    };
  }
}
