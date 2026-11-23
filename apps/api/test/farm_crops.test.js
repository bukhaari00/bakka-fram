import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FarmService } from '../src/modules/farm/farm.service.js';

describe('Bakka Farm Setup, Fields, Seasons & Crops Tests', () => {
  let mockPrisma;
  let farmService;

  beforeEach(() => {
    mockPrisma = {
      farm: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      unit: { create: vi.fn() },
      field: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn()
      },
      season: {
        findMany: vi.fn(),
        create: vi.fn()
      },
      cropType: {
        findMany: vi.fn(),
        create: vi.fn()
      },
      cropVariety: {
        create: vi.fn()
      },
      plantingBatch: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn()
      },
      cropObservation: {
        create: vi.fn()
      },
      auditLog: {
        create: vi.fn()
      }
    };

    farmService = new FarmService(mockPrisma);
  });

  it('creates field with area, soil type, and water source', async () => {
    mockPrisma.field.create.mockResolvedValue({
      id: 'field-101',
      farm_id: 'farm-1',
      name: 'North Plot A',
      code: 'NPA-01',
      total_area: 5.5,
      area_unit: 'HA',
      soil_type: 'Clay Loam',
      water_source: 'Shabelle River Canal',
      status: 'ACTIVE'
    });

    const field = await farmService.createField({
      farmId: 'farm-1',
      name: 'North Plot A',
      code: 'NPA-01',
      totalArea: 5.5,
      soilType: 'Clay Loam',
      waterSource: 'Shabelle River Canal',
      actorUserId: 'admin-1'
    });

    expect(field.id).toBe('field-101');
    expect(field.soil_type).toBe('Clay Loam');
    expect(mockPrisma.field.create).toHaveBeenCalled();
  });

  it('supports creating multiple planting batches per field and season', async () => {
    mockPrisma.plantingBatch.create.mockResolvedValue({
      id: 'batch-1',
      farm_id: 'farm-1',
      field_id: 'field-101',
      crop_type_id: 'crop-maize',
      season_id: 'season-deyr-2026',
      batch_code: 'MZ-2026-B1',
      status: 'PLANTED'
    });

    const batch = await farmService.createPlantingBatch({
      farmId: 'farm-1',
      fieldId: 'field-101',
      cropTypeId: 'crop-maize',
      seasonId: 'season-deyr-2026',
      batchCode: 'MZ-2026-B1',
      plantingDate: '2026-10-15',
      plantedArea: 2.0,
      seedQuantity: 25.0,
      actorUserId: 'manager-1'
    });

    expect(batch.id).toBe('batch-1');
    expect(batch.batch_code).toBe('MZ-2026-B1');
    expect(mockPrisma.plantingBatch.create).toHaveBeenCalled();
  });

  it('records field crop observations with growth stage and health condition', async () => {
    mockPrisma.cropObservation.create.mockResolvedValue({
      id: 'obs-1',
      planting_batch_id: 'batch-1',
      crop_condition: 'EXCELLENT',
      growth_stage: 'Vegetative V4'
    });

    const obs = await farmService.createObservation({
      farmId: 'farm-1',
      plantingBatchId: 'batch-1',
      observationDate: '2026-11-20',
      growthStage: 'Vegetative V4',
      cropCondition: 'EXCELLENT',
      actorUserId: 'supervisor-1'
    });

    expect(obs.id).toBe('obs-1');
    expect(obs.crop_condition).toBe('EXCELLENT');
  });
});
