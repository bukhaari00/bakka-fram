# AI Agent Prompts — Bakka Farm Management System

Use these prompts with a coding agent after placing the project documentation in the repository. Run them in order. The agent must follow `agent_rules.md`.

---

## Prompt 1 — Inspect and reset project direction

You are the lead full-stack engineer for Bakka Farm Management System. First inspect the entire repository: package files, frontend, backend, database schema, migrations, routes, components, and tests.

This is a new farm-management product. Remove obsolete training-center concepts such as students, courses, certificates, classes, and their dashboards/routes/schema only after identifying dependencies and creating a safe migration plan. Do not delete unrelated working infrastructure.

Do not start by drawing a dashboard. Report:
1. Current architecture and what is working.
2. Obsolete training-center files/features to remove.
3. Missing farm-management foundations.
4. A phased implementation plan.
5. Risks to existing data and how migrations will handle them.

Follow `overview.md`, `tech_stach.md`, and `agent_rules.md`. Frontend must remain Next.js + TypeScript; backend must remain Node.js JavaScript `.js`; database must be MySQL.

## Prompt 2 — Design the farm database and migrations

Act as a senior database engineer who understands real farm operations. Design and implement the MySQL schema and migrations for:
- users, roles, permissions, devices, sessions;
- farms, settings, fields, seasons, units;
- crop types, varieties, planting batches, crop observations;
- tasks, assignments, task activity, irrigation events;
- inventory items, locations, receipts, issues, adjustments, stock ledger;
- harvest records, produce lots and movements;
- customers, sales, sale lines, customer payments;
- suppliers, purchases, purchase lines, supplier payments;
- expense categories, expenses, cash transactions;
- sync operations, conflicts, audit logs, attachments.

Use UUID-compatible identifiers, foreign keys, farm scoping, indexes, timestamps, version fields where needed, and DECIMAL for money/quantities. Preserve auditable history. Do not create student/course/certificate tables. Add migrations that run from an empty database and safe development seed data. Explain the data model and run migration tests.

## Prompt 3 — Authentication, admin-created accounts, and RBAC

Implement secure authentication and role-based access for Admin, Farm Manager, Field Supervisor, Farm Worker, Storekeeper, and Accountant.

Requirements:
- No public registration or sign-up page/API.
- Admin creates, edits, deactivates, and resets staff accounts.
- Hash passwords with Argon2id.
- Enforce permissions on every backend route/service, not just the frontend.
- Scope every record to the user's farm.
- Provide role-aware navigation and dashboard access.
- Audit login events, permission changes, account changes, and sensitive actions.
- Add tests proving each role can access permitted actions and is denied forbidden actions.

Do not create a default production password. Provide a safe development-only admin bootstrap using environment variables and document first deployment.

## Prompt 4 — Build the offline-first foundation

Implement the offline-first application foundation before building all business screens.

Frontend: Next.js + TypeScript, PWA application shell, IndexedDB/Dexie local database, local mutation outbox, sync status indicator, and offline-aware API client.

Backend: Node.js JavaScript API endpoints for device enrollment, sync push, sync pull, and sync status.

Requirements:
- A device must first enroll after successful online authentication.
- A previously enrolled admin must be able to sign in offline using a secure local verifier; never store plaintext passwords or reusable server tokens.
- First-time device setup requires online enrollment or documented bootstrap.
- Core offline writes save to IndexedDB and outbox in one transaction.
- Use UUIDs, operation IDs, idempotency, dependency ordering, version checks, and deletion tombstones.
- Retry safely after reconnect.
- Show pending, syncing, failed, and conflict states.
- Never silently overwrite conflicting data.
- Revalidate users, roles, and device status after reconnect.
- Do not permit offline permission changes or other sensitive account administration.

Write automated tests for airplane-mode operation, reload persistence, duplicate sync, retry, conflicts, and account revocation.

## Prompt 5 — Farm setup, fields, seasons, and crops

Build complete vertical slices (database, API, UI, authorization, offline behavior, and tests) for:
- Farm profile and configurable units.
- Field/plot management with area, soil, water source, and status.
- Season management.
- Crop catalog and varieties.
- Planting batches with field, crop, variety, season, planting date, area, seed quantity, method, expected harvest date, and responsible person.
- Crop observations with growth stage, condition, pests/disease signs, notes, and optional photo.

Support multiple planting batches per field and partial harvest later. Include search, filters, pagination, validation, and offline creation/editing.

## Prompt 6 — Tasks, field workers, and irrigation

Build field-operation workflows for land preparation, planting, weeding, irrigation, fertilizing, spraying, pruning, inspection, and harvesting.

Managers and supervisors can create and assign tasks. Workers can see only their assigned tasks and update progress. Supervisors can review completion. Record planned date, priority, instructions, labor hours, completion time, and notes. Add a history of task changes.

Implement irrigation events with field, date/time, water source, method, duration or volume, optional cost, staff, and notes. Make task and irrigation records usable offline and sync-safe.

## Prompt 7 — Inventory and stock ledger

Build inventory management for seeds, fertilizer, pesticides, herbicides, fuel, tools, packaging, and configurable supplies.

Implement item catalog, stock receipts, stock issues, stock adjustments, optional storage locations, reorder levels, expiry dates, and supplier references.

Important:
- Maintain an immutable/auditable stock ledger.
- Calculate stock balances from ledger movements or transactionally maintain a balance backed by the ledger.
- Do not allow arbitrary direct editing of stock quantity.
- Prevent negative stock unless a permitted user approves an override with a reason.
- Use database transactions and idempotency for all stock movements.
- Show low-stock and near-expiry alerts.
- Support offline entry and safe sync without duplicate movements.

Add reconciliation tests for receipts, issues, adjustments, retries, and concurrent updates.

## Prompt 8 — Harvest and produce storage

Implement harvest records that support partial harvests and multiple harvest events per planting batch. Capture field/batch, date, quantity, configurable unit, grade/quality, workers, labor cost, and notes.

Track harvested produce destinations: storage, direct sale, processing, household use, or waste. Maintain produce lots and movements so stored quantities reconcile with sales and other uses. Provide harvest summaries by crop, field, and season. Make the workflow offline-capable and auditable.

## Prompt 9 — Customers, sales, suppliers, purchases, and expenses

Implement:
- Customers and opening balances.
- Sales and sale lines for harvested produce.
- Payments and outstanding customer balances.
- Suppliers and opening balances.
- Purchases and purchase lines.
- Supplier payments.
- Expense categories and expenses linked optionally to field, crop, or season.
- Cash/bank/mobile-money transaction records.
- Printable receipts and CSV exports.

Use DECIMAL for all money. Use transactions and idempotency. Distinguish invoice totals from cash received. Support credit sales and partial payments. Offline invoices need temporary device-prefixed references and must receive canonical server numbers after sync without losing their temporary reference. Add financial audit logs and tests.

## Prompt 10 — Role-specific dashboards and reports

Build real dashboards backed by database queries, not hard-coded sample metrics.

Admin: farm overview, active season, field/crop status, today's and overdue tasks, harvest totals, low stock, sales, expenses, outstanding balances, sync health, recent activity.

Manager: field/crop progress, tasks, observations, input usage, harvest progress, operational costs.

Supervisor: assigned fields, tasks, crop observations, and pending approvals.

Worker: assigned tasks and quick progress updates.

Storekeeper: stock on hand, low stock, receipts, issues, and counts.

Accountant: sales, payments, expenses, cash summary, customer debts, supplier balances.

Reports: crop production, harvest history, input usage, stock movement, task/labor performance, sales, expenses, margins, and outstanding balances. Include filters, date ranges, pagination where relevant, CSV export, and print layout. Label estimates and actual figures correctly.

## Prompt 11 — UI quality, Somali/English localization, and accessibility

Review and improve the complete UI:
- Calm, practical agricultural visual style.
- Responsive desktop/tablet/mobile layouts.
- Somali and English localization.
- Consistent navigation, forms, tables, dialogs, and status badges.
- Clear offline/sync status at all times.
- Accessible labels, keyboard navigation, focus states, and contrast.
- Useful loading, empty, success, and error states.
- Confirm destructive actions.
- Remove fake metrics, placeholder buttons, dead links, and unused screens.

Do not compromise permission checks or offline data handling for visual convenience.

## Prompt 12 — Final production-readiness audit

Act as an independent senior engineer and QA lead. Audit the entire system against `overview.md`, `tech_stach.md`, and `agent_rules.md`.

Verify:
- No training-center/student/course/certificate features remain.
- No public registration exists.
- Every role has correct dashboard and backend permissions.
- MySQL migrations work from an empty database.
- Stock ledger and financial transactions are consistent.
- Offline admin login works on an enrolled device.
- Offline records survive refresh/restart and sync without duplicates.
- Conflicts are visible and resolvable.
- User/device revocation is enforced after reconnect.
- Backups and restore are documented and tested.
- Lint, typecheck, unit, integration, E2E, and production build pass.

Fix defects you find. Do not merely produce an audit report. At the end, provide:
1. Implemented features.
2. Files/modules changed.
3. Database migration and seed commands.
4. Test/build commands and actual results.
5. Environment variables required.
6. Known limitations and deployment steps.

Never claim a test passed unless you ran it.
