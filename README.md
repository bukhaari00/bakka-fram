# Bakka Farm Management System

An offline-first, multi-role agricultural operations and financial management platform engineered for **Bakka Farm** (Afgooye River Valley).

Built strictly in accordance with:
- [`overview.md`](./overview.md)
- [`tech_stach.md`](./tech_stach.md)
- [`agent_rules.md`](./agent_rules.md)

---

## 1. System Architecture

```text
bakka-farm-management-system/
├── apps/
│   ├── web/                         # Next.js 14 (App Router) + TypeScript
│   │   ├── public/manifest.webmanifest # PWA Application Shell
│   │   └── src/
│   │       ├── app/                 # Role-aware dashboard, pages & layout
│   │       ├── components/          # SyncStatusIndicator, LanguageToggle, AppShell
│   │       └── lib/
│   │           ├── api/             # Offline-aware fetch client
│   │           ├── auth/            # Web Crypto PBKDF2 offline authentication
│   │           ├── db/              # Dexie.js IndexedDB schema & outbox
│   │           ├── i18n/            # Somali (Af-Soomaali) & English localization
│   │           └── sync/            # Atomic outbox queue & cloud sync engine
│   └── api/                         # Node.js + Express (Pure JavaScript .js)
│       ├── prisma/
│       │   ├── schema.prisma        # MySQL 8 schema (10 domain clusters)
│       │   ├── migrations/          # Version-controlled baseline SQL migration
│       │   └── seed.js              # Safe dev seed & admin bootstrap (Argon2id)
│       ├── src/
│       │   ├── config/              # Environment config validation
│       │   ├── middleware/          # Session auth, RBAC & farm-scope guards
│       │   ├── modules/
│       │   │   ├── auth/            # Login, session, device enrollment
│       │   │   ├── users/           # Admin-managed staff accounts
│       │   │   ├── sync/            # Idempotent push/pull & conflict engine
│       │   │   ├── farm/            # Profile, fields, seasons, crops, batches
│       │   │   ├── tasks/           # Work operations, worker tasks, irrigation
│       │   │   ├── inventory/       # Items, receipts, issues, immutable ledger
│       │   │   ├── harvest/         # Partial harvests, lots, produce movements
│       │   │   ├── finance/         # Sales, payments, expenses, cash ledger
│       │   │   └── reports/         # Role-specific real DB dashboards & CSV export
│       │   ├── utils/               # Response formatters, audit logger, backup/restore
│       │   ├── app.js               # Express application setup & route mounting
│       │   └── server.js            # HTTP server & graceful shutdown
│       └── test/                    # 10 Vitest test suites (36 automated tests)
├── packages/
│   └── shared/                      # Role constants, permissions matrix & enums
├── docker-compose.yml               # MySQL 8 development service
├── package.json                     # Monorepo workspaces manifest
└── README.md
```

---

## 2. Implemented Features

### Identity & Role-Based Access Control (RBAC)
- **Zero Public Registration:** Staff accounts are strictly provisioned by authorized Farm Admins.
- **Argon2id Hashing:** Password security utilizing industry-standard Argon2id.
- **6 Operational Roles:**
  - `ADMIN`: Full system authority, settings, user provisioning, audit logs.
  - `FARM_MANAGER`: Field operations, crop cycles, task scheduling, input management, sales & expenses.
  - `FIELD_SUPERVISOR`: Field monitoring, worker supervision, crop observations, irrigation logs.
  - `FARM_WORKER`: View assigned tasks and log field progress.
  - `STOREKEEPER`: Manage inventory, stock receipts, stock issues, transfers, and count adjustments.
  - `ACCOUNTANT`: Sales invoices, payments, purchases, expenses, cash books, and financial reports.
- **Multi-Tenant Scoping:** Every query and record is strictly partitioned by `farm_id`.

### Offline-First Architecture
- **PWA Application Shell:** Installable web app with local asset caching.
- **IndexedDB & Dexie:** Full local database mirroring operational records.
- **Atomic Outbox Mutations:** Writes save locally to IndexedDB and enqueue in the mutation outbox within a single transaction.
- **Offline Enrolled Admin Login:** Previously enrolled devices securely verify credentials using Web Crypto PBKDF2 without plaintext password caching.
- **Bi-Directional Sync Engine:**
  - `POST /api/sync/push`: Idempotent batched mutation processing with duplicate prevention.
  - `GET /api/sync/pull`: Incremental change fetching using timestamp cursors.
  - `GET /api/sync/status`: Online/offline connectivity and unresolved conflict reporting.
  - **Version Conflict Prevention:** Optimistic concurrency control (`version` field) detects concurrent edits, flags conflicts for review, and never silently discards data.
  - **Security Gate:** Offline attempts to alter permissions or user roles are strictly rejected.
  - **Device Revocation:** Revoked devices are barred immediately upon reconnect.

### Agricultural Operations & Commerce
- **Fields & Seasons:** Plot tracking with area in configurable units (HA, Acre, SQM), soil types, and water sources.
- **Crops & Planting Batches:** Support for multiple planting batches per field/season and partial harvest tracking.
- **Crop Health Observations:** Field observations recording growth stages, conditions, pests/disease signs, and notes.
- **Tasks & Irrigation:** Land prep, planting, spraying, weeding, and harvesting assignments; irrigation logs with water source, method, and volume.
- **Immutable Stock Ledger:**
  - Append-only stock movements (`RECEIPT`, `ISSUE`, `ADJUSTMENT_ADD`, `ADJUSTMENT_SUBTRACT`).
  - Derived balances backed by ledger transactions.
  - Negative stock prevention unless overridden by an authorized user with `stock:override_negative` permission.
- **Harvest & Produce Lots:**
  - Multi-stage harvest tracking with produce destination routing (`STORAGE`, `DIRECT_SALE`, `PROCESSING`, `HOUSEHOLD_USE`, `WASTE`).
- **Commerce & Cash Ledger:**
  - Invoiced sales, produce lines, customer debt tracking.
  - Offline invoices receive temporary references (e.g. `DEV-OFFLINE-001`) and are assigned canonical numbers (`INV-2026-XXXX`) upon sync without losing the original reference.
  - Multi-account cash book (Cash in safe, Mobile Money EVC Plus, Commercial Bank accounts).

### Bilingual Localization & Usability
- **Somali & English (Af-Soomaali / English):** Dual-language translation matrix and interactive switcher pill.
- **Agricultural Palette:** Calm green visual styling, responsive desktop/tablet/mobile design, and real-time floating sync status indicator.

---

## 3. Database Migration & Seed Commands

### Starting the Database
If using Docker:
```bash
docker compose up -d
```
Or start your local MySQL 8 instance on port 3306.

### Generating Prisma Client
```bash
npm run db:generate
```

### Applying Database Migrations
```bash
# Deploys baseline SQL migration against an empty MySQL 8 database
npm run db:migrate
```

### Seeding Development Data & Admin Bootstrap
```bash
npm run db:seed
```
Seeds:
- Canonical roles and fine-grained permissions matrix.
- Bakka Farm demo organization and configurable units of measurement.
- Standard expense categories and initial cash accounts.
- Initial Administrator account provisioned safely from environment variables.

---

## 4. Test & Build Commands (Actual Verification Results)

### Run Complete Test Suite
```bash
npm test
```
**Actual Verification Results:**
```text
✓ test/reports_dashboards.test.js (3 tests)
✓ test/schema.test.js (5 tests)
✓ test/inventory_ledger.test.js (4 tests)
✓ test/harvest_produce.test.js (3 tests)
✓ test/finance_commerce.test.js (3 tests)
✓ test/offline_sync.test.js (5 tests)
✓ test/auth_rbac.test.js (6 tests)
✓ test/tasks_irrigation.test.js (3 tests)
✓ test/backup.test.js (1 test)
✓ test/farm_crops.test.js (3 tests)

Test Files  10 passed (10)
     Tests  36 passed (36)
  Duration  1.33s
```

### Run Frontend Typecheck & Production Build
```bash
# TypeScript Typecheck
npx --workspace=apps/web tsc --noEmit

# Production Build
npm --workspace=apps/web run build
```
**Actual Verification Results:**
```text
✓ Compiled successfully
✓ Generating static pages (4/4)
Route (app)                              Size     First Load JS
┌ ○ /                                    50.4 kB         138 kB
└ ○ /_not-found                          873 B          88.2 kB
+ First Load JS shared by all            87.3 kB
```

---

## 5. Required Environment Variables

### Backend (`apps/api/.env`)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL="mysql://bakka_user:bakka_password@localhost:3306/bakka_farm"
SESSION_SECRET="your-long-secure-random-session-secret"
APP_ORIGIN="http://localhost:3000"
OFFLINE_SESSION_MAX_DAYS=7

# Initial Bootstrap Admin (Used during initial seeding only)
BOOTSTRAP_ADMIN_EMAIL=admin@bakkafarm.com
BOOTSTRAP_ADMIN_PASSWORD=SetSecurePasswordHere2026!
BOOTSTRAP_ADMIN_NAME="Bakka Farm Administrator"
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## 6. Backup & Restore Procedures

### Running Backup Snapshot
```bash
node -e "
import { PrismaClient } from '@prisma/client';
import { backupDatabase } from './apps/api/src/utils/backup.js';
const prisma = new PrismaClient();
backupDatabase(prisma, '<farm-id>', './backups/backup_$(date +%Y%m%d).json')
  .then(res => console.log('Backup complete:', res))
  .finally(() => prisma.\$disconnect());
"
```

### Native MySQL Dump & Restore
```bash
# Backup
mysqldump -u bakka_user -p bakka_farm > bakka_farm_backup.sql

# Restore
mysql -u bakka_user -p bakka_farm < bakka_farm_backup.sql
```

---

## 7. Known Limitations & Production Deployment Steps

1. **Browser Offline Storage Scope:** Offline authentication verifiers and IndexedDB storage are device-bound. If a user clears site storage or incognito mode is used, local offline data is purged and online authentication is required to re-enroll.
2. **Reverse Proxy & TLS:** In production, place Nginx, Caddy, or Cloudflare in front of `apps/web` (port 3000) and `apps/api` (port 4000) with TLS 1.3 encryption and HttpOnly cookie protections.
3. **Audit Log Retention:** For enterprise compliance, configure automated partition pruning or archival for audit logs older than 7 years.
