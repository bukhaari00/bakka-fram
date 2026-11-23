# Bakka Farm Management System — Technical Stack

## 1. Architecture

Use a TypeScript Next.js frontend, a JavaScript Node.js backend, and MySQL as the central database.

- **Frontend:** Next.js (App Router) + TypeScript.
- **Backend:** Node.js + Express (JavaScript `.js` files; do not convert backend files to TypeScript).
- **Database:** MySQL 8.
- **ORM / migrations:** Prisma is recommended for schema management and migrations. Backend source remains JavaScript; use generated Prisma Client from JavaScript.
- **Offline storage:** IndexedDB using Dexie.js or another actively maintained wrapper.
- **PWA:** service worker and web app manifest for installability and cached application shell.
- **Validation:** Zod on frontend and backend, with shared schemas only if the repository structure supports safe sharing.
- **Authentication:** secure server sessions or short-lived access tokens plus refresh strategy; Argon2id password hashing.
- **Testing:** Vitest/Jest for unit tests, Supertest for API tests, Playwright for end-to-end and offline tests.
- **UI:** Tailwind CSS and a consistent accessible component library such as shadcn/ui.
- **Charts:** Recharts or another maintained chart library.
- **File storage:** local development storage; production object storage or controlled server storage. Queue uploads while offline.
- **Deployment:** Docker Compose for local development; deploy frontend and API as separate services or behind one reverse proxy.

Do not introduce a second backend framework or a second database without a documented reason.

## 2. Suggested monorepo structure

```text
bakka-farm/
├── apps/
│   ├── web/                         # Next.js + TypeScript
│   │   ├── public/
│   │   │   ├── manifest.webmanifest
│   │   │   └── icons/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/
│   │       │   │   └── login/
│   │       │   ├── (dashboard)/
│   │       │   │   ├── dashboard/
│   │       │   │   ├── fields/
│   │       │   │   ├── seasons/
│   │       │   │   ├── crops/
│   │       │   │   ├── tasks/
│   │       │   │   ├── inventory/
│   │       │   │   ├── irrigation/
│   │       │   │   ├── harvests/
│   │       │   │   ├── customers/
│   │       │   │   ├── sales/
│   │       │   │   ├── suppliers/
│   │       │   │   ├── expenses/
│   │       │   │   ├── reports/
│   │       │   │   └── settings/
│   │       │   └── layout.tsx
│   │       ├── components/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── lib/
│   │       │   ├── api/
│   │       │   ├── auth/
│   │       │   ├── db/               # IndexedDB/Dexie
│   │       │   ├── sync/
│   │       │   └── validation/
│   │       ├── services/
│   │       └── types/
│   └── api/                          # Node.js + Express, JavaScript only
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── src/
│           ├── config/
│           ├── middleware/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── roles/
│           │   ├── farms/
│           │   ├── fields/
│           │   ├── seasons/
│           │   ├── crops/
│           │   ├── tasks/
│           │   ├── inventory/
│           │   ├── irrigation/
│           │   ├── harvests/
│           │   ├── customers/
│           │   ├── sales/
│           │   ├── suppliers/
│           │   ├── purchases/
│           │   ├── expenses/
│           │   ├── reports/
│           │   ├── audit/
│           │   └── sync/
│           ├── utils/
│           ├── app.js
│           └── server.js
├── packages/
│   └── shared/                       # Optional shared constants/schemas
├── docs/
├── docker-compose.yml
├── package.json
└── README.md
```

The exact structure may be adapted to an existing repository, but keep frontend and backend boundaries clear.

## 3. Frontend requirements

- Next.js App Router with TypeScript (`.ts` / `.tsx`).
- Use server components by default; use client components for interactive forms, IndexedDB, offline state, and charts.
- Build a responsive dashboard with role-aware navigation.
- Use React Hook Form plus Zod for complex forms.
- Use TanStack Query for server state where useful; do not treat it as the offline database.
- Use Dexie/IndexedDB as the durable local store.
- Use a service worker to cache static assets and the application shell. Do not cache authenticated API responses indiscriminately.
- Provide a global connection/sync indicator.
- Make forms tolerant of interrupted connectivity: save locally first for supported offline mutations and show their sync status.
- Provide accessible loading, empty, validation, success, and error states.
- Avoid placing authorization logic only in frontend route guards.

## 4. Backend requirements

- Node.js LTS and Express.
- Backend source files must use JavaScript `.js` extensions. Use ES modules consistently (`"type": "module"`) or CommonJS consistently; do not mix module systems.
- Organize code by domain module: routes, controllers, services, validators, and repositories where complexity warrants them.
- Validate all request bodies, query parameters, and path parameters.
- Centralize authentication, authorization, error handling, logging, and request IDs.
- Use database transactions for stock movements, invoices, payments, and other multi-record business operations.
- Implement pagination and filtering on list endpoints.
- Use idempotency keys for offline sync writes and financial document creation.
- Implement `/api/health` and a sync-specific status endpoint.
- Never trust role, user ID, farm ID, price, or stock quantity supplied by the browser without server-side validation.

## 5. MySQL data model

Use UUIDs (stored as `CHAR(36)` or `BINARY(16)` consistently) for client-generated IDs so offline records can be created before reaching the server. Use MySQL `DECIMAL` for money and measured quantities. Include `created_at`, `updated_at`, and, where needed, `deleted_at`, `version`, and `created_by`.

Recommended core tables:

| Domain | Tables |
|---|---|
| Identity | `users`, `roles`, `permissions`, `role_permissions`, `user_devices`, `sessions` |
| Farm setup | `farms`, `farm_settings`, `fields`, `seasons`, `units` |
| Crops | `crop_types`, `crop_varieties`, `planting_batches`, `crop_observations` |
| Work | `tasks`, `task_assignments`, `task_activity_logs`, `irrigation_events` |
| Inventory | `inventory_items`, `inventory_locations`, `stock_receipts`, `stock_receipt_lines`, `stock_issues`, `stock_issue_lines`, `stock_adjustments`, `stock_ledger` |
| Harvest | `harvest_records`, `produce_lots`, `produce_movements` |
| Commerce | `customers`, `sales`, `sale_lines`, `customer_payments` |
| Procurement | `suppliers`, `purchases`, `purchase_lines`, `supplier_payments` |
| Finance | `expense_categories`, `expenses`, `cash_accounts`, `cash_transactions` |
| Platform | `sync_operations`, `sync_conflicts`, `audit_logs`, `attachments` |
| Optional livestock | `animal_groups`, `livestock_events`, `health_treatments`, `feed_records` |

### Important data rules

- Use foreign keys and appropriate indexes.
- Store money with a fixed precision, for example `DECIMAL(14,2)`, and quantities with a suitable precision, for example `DECIMAL(14,3)`.
- Store currency code with financial records or enforce one farm currency through validated settings.
- Do not use a single mutable `stock_quantity` field as the source of truth. Derive balance from the stock ledger or maintain a transactionally updated balance backed by the ledger.
- Sales, payments, and stock movements should be append-oriented. Corrections should use reversal/adjustment records rather than erasing history.
- Use soft deletion only where appropriate; financial and stock history must remain auditable.
- Add unique constraints for business identifiers and idempotency keys.
- Add `farm_id` to tenant-owned records and enforce farm scoping in every query.

## 6. Offline and sync design

### Local schema

IndexedDB should contain:
- Locally available reference data (farm settings, fields, crop catalog, units, assigned tasks).
- Operational records needed for offline work.
- `outbox` table for queued mutations.
- `sync_metadata` for last successful cursor/time and device identity.
- `conflicts` for server/client version disagreements.

### Mutation flow

1. Validate input in the UI.
2. Generate a UUID and local timestamp.
3. Save the record and outbox operation in one IndexedDB transaction.
4. Update the UI immediately.
5. When connectivity is available, send queued operations in dependency order.
6. Server validates permissions and applies the operation transactionally.
7. Server returns canonical record, version, and server timestamps.
8. Client marks the outbox operation as synced and updates local canonical data.
9. If the server reports a version conflict, save both versions and present a resolution workflow.

### API shape (example)

```text
POST /api/sync/push
POST /api/sync/pull
GET  /api/sync/status
POST /api/devices/enroll
```

- `push` accepts a bounded batch of operations, each with `operationId`, `entityType`, `entityId`, `operation`, `baseVersion`, and `payload`.
- `pull` accepts a cursor and returns authorized changes since that cursor.
- Both endpoints enforce user/farm scope and return per-operation results.
- Repeated `operationId` values must not apply a mutation twice.
- Define deletion tombstones so offline clients learn about deletions.
- Handle dependency ordering (for example, create a customer before syncing a sale referencing that customer).

### Offline login

- A device must be enrolled during a successful online login.
- Never store a plaintext password or reusable server password hash in local storage.
- Design an offline verifier using a dedicated KDF and a device-bound secret where platform support allows. Keep offline authentication distinct from server session tokens.
- Store the minimum user profile and permissions snapshot required for offline operation.
- Apply an offline expiry window and revalidate user/device status on reconnection.
- If the browser cannot provide strong secure storage, disclose the limitation and recommend a managed device/browser profile.
- New devices, password resets, role changes, and account recovery require online connectivity.
- Offline mode must not allow changing permissions, creating admins, or performing other high-risk account actions.

## 7. Security

- Hash passwords with Argon2id and unique salts.
- Use HTTPS in production.
- Use secure, HttpOnly, SameSite cookies if using cookie-based sessions; protect state-changing requests against CSRF.
- Rate-limit login and sensitive endpoints.
- Enforce RBAC and farm scoping in backend middleware/services.
- Sanitize and validate uploaded files; limit type and size.
- Keep secrets in environment variables or a secrets manager.
- Redact credentials, tokens, and sensitive personal data from logs.
- Maintain audit records for security-sensitive and financial operations.
- Add backup and restore procedures and test them.

## 8. Environment variables

Example names only; never commit real secrets:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="mysql://user:password@localhost:3306/bakka_farm"
SESSION_SECRET="replace-with-a-long-random-secret"
APP_ORIGIN="http://localhost:3000"
OFFLINE_SESSION_MAX_DAYS=7
```

Validate required environment variables at startup and fail fast with a clear error.

## 9. Development commands

Define workspace scripts appropriate to the repository, for example:

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run db:migrate
npm run db:seed
```

Provide a safe development seed that creates a demo farm and one initial admin from environment-provided credentials. Never ship a default production password.

## 10. Testing strategy

- Unit: permissions, calculations, stock ledger, invoice totals, validation.
- API integration: auth, role access, farm isolation, transactions, idempotency.
- Database: migrations from an empty database and upgrade from prior schema.
- Offline: airplane-mode CRUD, reload persistence, queued operations, retry, duplicate delivery, conflicts, deleted records, and reconnect.
- E2E: each role sees only permitted screens and cannot call forbidden APIs.
- Recovery: backup restore and interrupted sync.
