import Dexie, { Table } from 'dexie';

export interface LocalAuthSession {
  id: string; // 'current_session'
  userId: string;
  farmId: string;
  email: string;
  fullName: string;
  roleName: string;
  permissions: string[];
  deviceId: string;
  deviceName?: string;
  offlineVerifierHash: string;
  offlineVerifierSalt: string;
  token?: string; // only present during active online session
  tokenExpiresAt?: string;
  enrolledAt: string;
  offlineExpiresAt: string;
  isRevoked: boolean;
}

export interface OutboxOperation {
  id?: number;
  operationId: string;
  entityType: string;
  entityId: string;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  baseVersion?: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'CONFLICT';
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

export interface SyncMetadata {
  key: string;
  value: any;
}

export interface LocalConflict {
  id: string;
  operationId: string;
  entityType: string;
  entityId: string;
  clientData: any;
  serverData: any;
  resolved: boolean;
  resolutionChoice?: 'CLIENT_WINS' | 'SERVER_WINS' | 'MERGED';
  createdAt: string;
}

export class BakkaFarmLocalDB extends Dexie {
  auth!: Table<LocalAuthSession, string>;
  outbox!: Table<OutboxOperation, number>;
  sync_metadata!: Table<SyncMetadata, string>;
  conflicts!: Table<LocalConflict, string>;

  // Domain Tables
  fields!: Table<any, string>;
  seasons!: Table<any, string>;
  units!: Table<any, string>;
  crop_types!: Table<any, string>;
  crop_varieties!: Table<any, string>;
  planting_batches!: Table<any, string>;
  crop_observations!: Table<any, string>;
  tasks!: Table<any, string>;
  irrigation_events!: Table<any, string>;
  inventory_items!: Table<any, string>;
  stock_receipts!: Table<any, string>;
  stock_issues!: Table<any, string>;
  stock_adjustments!: Table<any, string>;
  harvest_records!: Table<any, string>;
  produce_lots!: Table<any, string>;
  customers!: Table<any, string>;
  sales!: Table<any, string>;
  customer_payments!: Table<any, string>;
  suppliers!: Table<any, string>;
  purchases!: Table<any, string>;
  supplier_payments!: Table<any, string>;
  expense_categories!: Table<any, string>;
  expenses!: Table<any, string>;

  constructor() {
    super('BakkaFarmDB');
    this.version(1).stores({
      auth: 'id, userId, deviceId',
      outbox: '++id, operationId, entityType, status, createdAt',
      sync_metadata: 'key',
      conflicts: 'id, operationId, entityId, resolved',

      fields: 'id, farm_id, code, status',
      seasons: 'id, farm_id, status',
      units: 'id, farm_id, symbol',
      crop_types: 'id, farm_id, name',
      crop_varieties: 'id, crop_type_id, name',
      planting_batches: 'id, farm_id, batch_code, field_id, status',
      crop_observations: 'id, farm_id, planting_batch_id',
      tasks: 'id, farm_id, status, planned_date, assigned_user_id',
      irrigation_events: 'id, farm_id, field_id, event_date',
      inventory_items: 'id, farm_id, code, category',
      stock_receipts: 'id, farm_id, receipt_number',
      stock_issues: 'id, farm_id, issue_number',
      stock_adjustments: 'id, farm_id, adjustment_number',
      harvest_records: 'id, farm_id, harvest_date, planting_batch_id',
      produce_lots: 'id, farm_id, lot_number, status',
      customers: 'id, farm_id, name',
      sales: 'id, farm_id, invoice_number, temporary_offline_ref, customer_id',
      customer_payments: 'id, farm_id, payment_number, customer_id',
      suppliers: 'id, farm_id, name',
      purchases: 'id, farm_id, purchase_number, supplier_id',
      supplier_payments: 'id, farm_id, payment_number, supplier_id',
      expense_categories: 'id, farm_id, name',
      expenses: 'id, farm_id, expense_date, category_id'
    });
  }
}

export const db = new BakkaFarmLocalDB();
