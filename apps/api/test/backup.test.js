import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { backupDatabase, verifyBackupFile } from '../src/utils/backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bakka Farm Backup & Restore Verification Tests', () => {
  const tempBackupPath = path.resolve(__dirname, 'temp_backup_test.json');

  it('exports a valid snapshot of farm database entities and verifies integrity', async () => {
    const mockPrisma = {
      farm: { findUnique: vi.fn().mockResolvedValue({ id: 'farm-1', name: 'Bakka Farm' }) },
      unit: { findMany: vi.fn().mockResolvedValue([{ id: 'u1', symbol: 'KG' }]) },
      field: { findMany: vi.fn().mockResolvedValue([{ id: 'f1', name: 'Plot 1' }]) },
      season: { findMany: vi.fn().mockResolvedValue([{ id: 's1', name: 'Deyr 2026' }]) },
      cropType: { findMany: vi.fn().mockResolvedValue([]) },
      cropVariety: { findMany: vi.fn().mockResolvedValue([]) },
      plantingBatch: { findMany: vi.fn().mockResolvedValue([]) },
      inventoryItem: { findMany: vi.fn().mockResolvedValue([]) },
      customer: { findMany: vi.fn().mockResolvedValue([]) },
      supplier: { findMany: vi.fn().mockResolvedValue([]) },
      expenseCategory: { findMany: vi.fn().mockResolvedValue([]) },
      cashAccount: { findMany: vi.fn().mockResolvedValue([]) }
    };

    const result = await backupDatabase(mockPrisma, 'farm-1', tempBackupPath);
    expect(result.success).toBe(true);
    expect(fs.existsSync(tempBackupPath)).toBe(true);

    const verified = verifyBackupFile(tempBackupPath);
    expect(verified.valid).toBe(true);
    expect(verified.farmId).toBe('farm-1');
    expect(verified.tables).toContain('fields');
    expect(verified.tables).toContain('seasons');

    // Clean up
    fs.unlinkSync(tempBackupPath);
  });
});
