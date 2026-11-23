# Bakka Farm Management System — Project Overview

## 1. Project purpose

Build a new, offline-first farm management system for **Bakka Farm**. This is a farm operations product, not a training-center or student-management system. Do not reuse the previous training-center requirements, screens, database tables, names, or workflows.

The system should help the farm owner and workers answer practical daily questions:

- What crops are planted, in which field, and in what season?
- What work must be done today, and who is responsible?
- How much seed, fertilizer, pesticide, feed, fuel, and other stock is available?
- What was planted, treated, irrigated, harvested, stored, sold, wasted, or spent?
- Which customers owe money, and which suppliers must be paid?
- Is the farm making a profit by crop, field, or season?
- Can the administrator continue using the system when the internet is unavailable?

The interface should be simple enough for farm staff who are not technical. Use clear labels, practical forms, readable tables, and mobile-friendly layouts.

## 2. Product principles

1. **Offline-first:** core farm operations must work without internet after the application has been installed and initialized on the device.
2. **Local-first data:** save changes to the local database immediately. Synchronize with the server when a connection becomes available.
3. **No public sign-up:** remove public student/user registration and all training-center registration flows. An administrator creates staff accounts and assigns permissions.
4. **Role-based access:** every user sees only the pages and actions permitted by their role.
5. **Auditability:** record who created, changed, deleted, approved, or synchronized important records.
6. **Practical farm language:** use terms farmers understand; avoid unnecessary technical language.
7. **Data safety:** never silently overwrite offline changes. Detect conflicts and provide a safe resolution workflow.
8. **Somali-ready:** prepare the interface for Somali and English labels. Store dates and numbers consistently; display them using the selected locale.

## 3. Users and access roles

The system supports the following roles. The administrator can customize permissions, but the defaults below must be implemented.

| Role | Main access |
|---|---|
| Admin / Farm Owner | Full access, users, settings, reports, approvals, sync status, audit log |
| Farm Manager | Fields, crops, seasons, tasks, inputs, harvest, inventory, sales, expenses, operational reports |
| Field Supervisor | Assigned fields, planting, irrigation, crop observations, treatments, task assignment and completion |
| Farm Worker | View assigned tasks; update task progress; submit field activity records |
| Storekeeper | Stock items, stock receipts/issues, transfers, adjustments, stock counts |
| Accountant | Sales, customers, suppliers, expenses, payments, cash records, financial reports |

### Access rules

- Do not rely on hiding menu items alone. Enforce authorization in the API and in the UI.
- Admin can create, deactivate, and reset staff accounts. No public sign-up page or public registration endpoint.
- Staff accounts have a role and optional field/operation assignments.
- A user cannot grant themselves a higher role.
- Sensitive actions (stock adjustment, deleting financial records, changing permissions) require appropriate permission and must be audited.
- Admin should be able to open the application and authenticate offline on a device that has previously completed a successful online sign-in and securely cached the offline credential verifier.
- For first-time setup on a new device, provision the initial admin while online or use a one-time installation bootstrap process. Do not pretend that a never-connected device can validate an unknown server account.

## 4. Main modules

### 4.1 Dashboard

Provide role-specific dashboards.

**Admin dashboard**
- Current season and active fields
- Crop status summary
- Today's tasks and overdue tasks
- Harvest quantity this season
- Inventory low-stock alerts
- Sales, expenses, outstanding customer balances
- Last successful sync, pending local changes, sync errors
- Recent activity

**Manager dashboard**
- Field/crop overview
- Work due today
- Crop health observations
- Input usage and stock alerts
- Harvest progress and operational costs

**Worker dashboard**
- My assigned tasks
- Field and crop details for each task
- Simple start / pause / complete actions
- Offline task updates and sync indicator

**Storekeeper dashboard**
- Stock on hand
- Low-stock items
- Recent receipts and issues
- Pending stock counts

**Accountant dashboard**
- Sales and payments
- Expenses and supplier payments
- Customer debts and supplier balances
- Cash summary and financial reports

### 4.2 Farm setup

- Farm profile: name, location, contact details, logo, preferred language, currency, timezone.
- Farm units: hectare, acre, square meter, kilogram, gram, liter, bag, crate, piece, and configurable units.
- Fields/plots: name/code, area, unit, location/description, soil type, water source, status, notes.
- Seasons: name, start date, end date, status.
- Optional field maps or coordinates can be added later; do not block core use on maps.

### 4.3 Crops and planting

- Crop catalog: crop name, variety, expected growing duration, default unit, notes.
- Planting record: field, crop, variety, season, planting date, area, seed quantity, method, expected harvest date, responsible person, notes.
- Crop cycle status: planned, planted, growing, ready to harvest, harvested, failed, archived.
- Track multiple planting batches in the same field and season.
- Crop observations: date, field/batch, growth stage, condition, pest/disease signs, photo attachment (when supported), notes, reporter.

### 4.4 Field operations and tasks

- Create tasks for land preparation, planting, weeding, irrigation, fertilizing, spraying, pruning, inspection, and harvesting.
- Each task has title/type, field or crop batch, assigned staff, planned date, priority, instructions, status, completion date, labor hours, and notes.
- Workers can update assigned tasks offline.
- Supervisors can review and approve completed tasks.
- Keep a history of status changes.

### 4.5 Inputs and inventory

Track seed, fertilizer, pesticides, herbicides, animal feed (if enabled), fuel, tools, packaging, and other supplies.

- Item catalog: name, category, SKU/code, unit, reorder level, default supplier, optional expiry date requirement.
- Stock receipt: supplier, date, quantity, unit cost, batch/lot, expiry date, reference, recorded by.
- Stock issue: item, quantity, date, purpose, field/crop/task, issued to, recorded by.
- Stock adjustment: count, reason, approval, audit record.
- Stock transfer between stores/locations if multiple stores are enabled.
- Low-stock and near-expiry alerts.
- Prevent negative stock by default; allow only a permission-controlled override with a reason.
- Maintain a stock ledger. Do not store only a manually editable quantity.

### 4.6 Irrigation and water

- Record irrigation event: field, date/time, water source, method, duration or volume, cost (optional), staff, notes.
- Record water source details such as well, river, tank, or canal.
- Allow farms to disable this module if not needed.

### 4.7 Harvest and post-harvest

- Harvest record: crop batch, field, date, quantity, unit, quality/grade, harvested by, labor cost, notes.
- Record post-harvest destination: store, direct sale, processing, household use, or waste.
- Support partial harvests and multiple harvest events for one crop batch.
- Reconcile stored harvest with inventory/produce stock.
- Do not assume every crop is measured in kilograms; use configurable units.

### 4.8 Customers, sales, and payments

- Customer directory: name, phone, address, notes, opening balance.
- Sale: customer, date, items/crop produce, quantities, unit price, discount, total, payment status, due date, notes.
- Payments: amount, date, payment method, reference, received by.
- Support cash, bank transfer, mobile money, and credit.
- Print or export a simple receipt.
- Track outstanding balances and payment history.
- Sales entered offline must receive a unique local ID and sync safely without duplicate invoices.

### 4.9 Suppliers, purchases, and expenses

- Supplier directory: name, contact, address, notes, opening balance.
- Purchase record: supplier, items, quantities, unit costs, date, payment status, reference.
- Expenses: category, amount, date, field/crop/season (optional), payment method, vendor, receipt attachment (optional), description.
- Expense categories: labor, fuel, transport, water, repairs, rent, inputs, packaging, utilities, and configurable categories.
- Track supplier payments and outstanding balances.

### 4.10 Livestock (optional module)

The initial release may keep livestock disabled unless the farm confirms it raises animals. If enabled, include animal groups, species, counts, purchases, births, deaths, vaccinations/treatments, feed use, and sales. Keep livestock separate from crop workflows.

### 4.11 Reports

- Crop production by crop, field, and season
- Planting and harvest history
- Harvest quantity and quality
- Input usage by field/crop/season
- Inventory balance, stock movement, low stock, expiry
- Task completion and labor hours
- Sales, expenses, gross margin, customer balances, supplier balances
- Export CSV and printable reports
- Clearly state report date range and filters.
- Financial reports must distinguish cash received from invoiced sales and avoid presenting estimates as actual profit.

### 4.12 Users, audit, and settings

- Admin-managed staff accounts; no public registration.
- Role and permission management.
- Deactivate accounts without deleting their historical activity.
- Password reset by admin; force password change after reset.
- Audit log for authentication, permission changes, financial edits, stock adjustments, and record deletion.
- Settings for currency, language, date format, units, farm profile, backup, and sync.

## 5. Offline operation and synchronization

Offline behavior is a core requirement, not a future enhancement.

### Must work offline

- Sign in on a previously initialized device using a valid cached offline credential.
- Open role-appropriate dashboard and locally available records.
- Create and edit fields, crop batches, tasks, observations, stock movements, harvests, sales, expenses, and payments, subject to permissions.
- Search local records.
- Print/export locally available reports where browser/device support permits.
- Queue all changes for synchronization.

### Sync behavior

- Use a local database (IndexedDB through a well-maintained client library) and a server MySQL database.
- Each client-created record gets a UUID, `created_at`, `updated_at`, `device_id`, and sync state.
- Use an outbox queue for pending mutations. Retry safely with idempotency keys.
- Server endpoints must be idempotent for repeated sync requests.
- Use `updated_at` plus version numbers or equivalent optimistic concurrency control.
- Never silently discard conflicting edits. Show a conflict review screen with both versions and allow a permitted user to choose or merge.
- Server is the authority for globally unique invoice/receipt numbers. Offline documents may use a device prefix and temporary number, then receive a final number after sync; preserve the temporary reference.
- Display clear states: Online, Offline, Syncing, Pending changes, Sync error.
- Provide manual “Sync now” action and automatic sync when connectivity returns.
- Do not assume `navigator.onLine` guarantees server reachability; verify the API with a lightweight health check.

### Offline authentication security

- Cache only what is necessary for offline authentication. Never store plaintext passwords.
- Use a secure password KDF on the server (Argon2id preferred) and a carefully designed local verifier/token mechanism for offline sign-in.
- Store secrets using platform-appropriate secure storage where available; protect IndexedDB data against casual access and document browser limitations.
- Offline access must expire after a configurable period and can be revoked on the next successful sync.
- A user deactivated or whose role changed while the device was offline must be revalidated on reconnection. Until then, apply conservative access rules for sensitive actions.
- Require online authentication for first-time device enrollment, password changes, role changes, and other security-sensitive operations.
- Consider requiring a device PIN or OS-level device authentication to unlock offline access.
- Clearly explain that browser-only offline authentication cannot provide the same guarantees as a managed native device.

## 6. Key workflows

### Daily farm workflow
1. Manager checks the dashboard and creates today's field tasks.
2. Supervisor assigns tasks to workers.
3. Workers view assigned tasks and record work, even offline.
4. Supervisor records observations and input usage.
5. Storekeeper records issued supplies.
6. Manager records harvests and destinations.
7. Accountant records sales, customer payments, and expenses.
8. Data synchronizes when internet returns.
9. Admin reviews alerts and reports.

### New crop cycle
1. Admin/manager creates a season and checks field details.
2. Manager selects crop and variety.
3. Manager records planting details and expected harvest date.
4. Tasks are generated/assigned.
5. Staff record operations and observations.
6. Harvest events are recorded.
7. Harvest produce is stored, sold, processed, or recorded as waste.
8. Season report summarizes production and costs.

## 7. Non-functional requirements

- Responsive design for desktop, tablet, and mobile.
- Accessible forms, keyboard navigation, clear validation, and readable contrast.
- Secure authentication, authorization, input validation, and rate limiting.
- Database migrations and automated backups.
- No hard-coded credentials or secrets.
- API and database errors must be logged without exposing passwords or tokens.
- Use pagination and filtering for large tables.
- Use transactions for financial and stock operations.
- Test offline behavior, sync retries, duplicate submissions, and conflict handling.
- Store timestamps in UTC; display them in the farm's configured timezone.
- Use decimal database types for money and measured quantities; do not use floating-point types for financial values.

## 8. Out of scope for the first release

Unless explicitly requested, do not build:
- Training-center, student, course, certificate, or class management.
- Public user registration.
- E-commerce storefront or public customer accounts.
- GPS tracking of workers.
- AI crop diagnosis or automated agronomy recommendations.
- Payroll/tax compliance for a specific country.
- IoT sensor integrations.

## 9. MVP delivery order

1. Authentication, admin-created users, roles, permissions, farm settings.
2. Offline app shell, local database, offline login enrollment, sync status and outbox.
3. Fields, seasons, crop catalog, planting records.
4. Tasks, field observations, worker workflows.
5. Inventory catalog, receipts, issues, stock ledger.
6. Harvest records and produce stock.
7. Customers, sales, payments, suppliers, purchases, expenses.
8. Reports, audit log, backups, conflict resolution.
9. Optional livestock and advanced features.

## 10. Definition of done

The product is not complete until:

- Admin, manager, supervisor, worker, storekeeper, and accountant access is enforced end-to-end.
- There is no public registration route or student/course/certificate feature.
- A previously enrolled admin can sign in and perform permitted core work while offline.
- Offline changes persist after refresh/reopening the app and synchronize without duplicates.
- Conflicts are visible and resolvable; no data is silently lost.
- Stock ledger balances reconcile with receipts, issues, and adjustments.
- Harvest, sales, payments, and expenses have traceable histories.
- Automated tests cover permissions, core business rules, offline queueing, idempotency, and sync conflicts.
