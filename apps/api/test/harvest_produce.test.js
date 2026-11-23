import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HarvestService } from '../src/modules/harvest/harvest.service.js';
import { PRODUCE_DESTINATIONS } from '@bakka/shared';

describe('Bakka Farm Harvest Records & Produce Storage Tests', () => {
  let mockPrisma;
  let harvestService;

  beforeEach(() => {
    mockPrisma = {
      harvestRecord: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn()
      },
      produceLot: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
      },
      produceMovement: {
        create: vi.fn()
      },
      plantingBatch: {
        update: vi.fn()
      },
      auditLog: {
        create: vi.fn()
      },
      $transaction: vi.fn(async (cb) => await cb(mockPrisma))
    };

    harvestService = new HarvestService(mockPrisma);
  });

  it('records harvest event, creates produce lot, and records initial storage movement', async () => {
    mockPrisma.harvestRecord.create.mockResolvedValue({
      id: 'harvest-01',
      planting_batch_id: 'batch-tomato-1',
      quantity: 450.0,
      unit: 'KG'
    });

    mockPrisma.produceLot.create.mockResolvedValue({
      id: 'lot-01',
      lot_number: 'LOT-TOM-01',
      initial_quantity: 450.0,
      current_quantity: 450.0
    });

    const result = await harvestService.recordHarvest({
      farmId: 'farm-1',
      plantingBatchId: 'batch-tomato-1',
      fieldId: 'field-south',
      quantity: 450.0,
      unit: 'KG',
      qualityGrade: 'GRADE_A',
      laborCost: 25.0,
      destination: PRODUCE_DESTINATIONS.STORAGE,
      isFinalHarvestForBatch: false,
      actorUserId: 'manager-1'
    });

    expect(result.harvest.id).toBe('harvest-01');
    expect(result.lot.id).toBe('lot-01');
    expect(mockPrisma.produceMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          destination: PRODUCE_DESTINATIONS.STORAGE,
          quantity: 450.0
        })
      })
    );
    // Planting batch is NOT closed since it's a partial harvest
    expect(mockPrisma.plantingBatch.update).not.toHaveBeenCalled();
  });

  it('marks planting batch as HARVESTED when final harvest flag is true', async () => {
    mockPrisma.harvestRecord.create.mockResolvedValue({ id: 'harvest-final' });
    mockPrisma.produceLot.create.mockResolvedValue({ id: 'lot-final' });

    await harvestService.recordHarvest({
      farmId: 'farm-1',
      plantingBatchId: 'batch-tomato-1',
      fieldId: 'field-south',
      quantity: 200.0,
      isFinalHarvestForBatch: true,
      actorUserId: 'manager-1'
    });

    expect(mockPrisma.plantingBatch.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'batch-tomato-1' },
        data: { status: 'HARVESTED' }
      })
    );
  });

  it('moves produce from lot to destinations and updates remaining quantity', async () => {
    mockPrisma.produceLot.findUnique.mockResolvedValue({
      id: 'lot-01',
      lot_number: 'LOT-TOM-01',
      current_quantity: 450.0,
      unit: 'KG'
    });

    mockPrisma.produceMovement.create.mockResolvedValue({
      id: 'mov-1',
      destination: PRODUCE_DESTINATIONS.DIRECT_SALE,
      quantity: 150.0
    });

    const movement = await harvestService.recordProduceMovement({
      farmId: 'farm-1',
      produceLotId: 'lot-01',
      destination: PRODUCE_DESTINATIONS.DIRECT_SALE,
      quantity: 150.0,
      actorUserId: 'manager-1'
    });

    expect(movement.id).toBe('mov-1');
    // Lot quantity updated from 450 to 300
    expect(mockPrisma.produceLot.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lot-01' },
        data: expect.objectContaining({
          current_quantity: 300.0,
          status: 'AVAILABLE'
        })
      })
    );
  });
});
