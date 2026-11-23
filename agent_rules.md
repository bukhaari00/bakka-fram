# Agent Rules — Bakka Farm Management System

These rules are mandatory for any AI coding agent or developer working in this repository.

## 1. Project identity

- This repository is for **Bakka Farm Management System**.
- Treat it as a new farm product.
- Ignore and remove obsolete training-center concepts, requirements, UI, routes, seed data, and database entities.
- Never create students, courses, certificates, classes, or training-center dashboards.
- Do not build public user registration. Staff accounts are created by an authorized admin.
- Do not reuse old project assumptions unless they are explicitly confirmed as relevant to the farm.

## 2. Before coding

1. Inspect the repository, package files, existing source tree, environment examples, and current database schema.
2. Identify what already works and what is missing.
3. Read `overview.md` and `tech_stach.md` before implementation.
4. Write a short implementation plan for substantial tasks.
5. Ask a question only when a missing business decision blocks safe implementation. Otherwise choose a sensible, documented farm-management default.
6. Do not overwrite working code or migrations blindly.

## 3. Technology boundaries

- Frontend: Next.js + TypeScript (`.ts` and `.tsx`).
- Backend: Node.js + JavaScript (`.js`) only.
- Database: MySQL 8.
- Use the selected ORM and migration system consistently.
- Do not introduce TypeScript into backend source files.
- Do not introduce a second backend, database, or state-management architecture without a clear reason.
- Keep API contracts and shared types consistent.

## 4. Domain rules

- Think like a farm operator: every feature must support a real task on the farm.
- Prefer practical workflows over decorative dashboard widgets.
- Fields, seasons, crop batches, tasks, inputs, stock, irrigation, harvests, sales, payments, suppliers, and expenses must have clear relationships.
- Support partial harvests and multiple harvest events per crop batch.
- Track stock through a ledger; do not let users arbitrarily edit stock totals.
- Use transactions for stock and financial operations.
- Keep historical records and audit trails.
- Use configurable units; do not assume all crops or inputs are measured in kilograms.
- Use decimal values for money and measured quantities.
- Do not report cash received as total sales, or label revenue minus incomplete expenses as net profit.

## 5. Authentication and permissions

- No public sign-up or open registration endpoint.
- Admin creates and manages staff accounts.
- Enforce permissions on the backend for every protected operation.
- Frontend route guards and hidden menu items are usability features, not security boundaries.
- Never trust role, farm ID, user ID, amount, or stock balance from the client.
- A user must not be able to grant themselves permissions.
- Keep deactivated users' historical activity.
- Audit role changes, account deactivation, password resets, and sensitive actions.

## 6. Offline-first rules

- Offline support is a core feature, not an optional enhancement.
- Core operational records must be saved locally before being queued for sync.
- Never store plaintext passwords or long-lived server tokens in browser storage.
- Offline sign-in is allowed only on a device previously enrolled online.
- A brand-new device must complete online enrollment or an approved one-time bootstrap.
- Make pending, syncing, failed, and conflict states visible.
- Use UUIDs and idempotency keys for offline-created records and sync operations.
- Retry safely; the same operation must never create duplicate sales, payments, or stock movements.
- Never silently discard either side of a sync conflict.
- Revalidate users, roles, and device status when online.
- Do not permit sensitive security administration while offline.
- Test with the browser genuinely offline, not only with a mocked status indicator.

## 7. Code quality

- Use clear module boundaries and descriptive names.
- Keep controllers thin; put business logic in services.
- Validate all external input.
- Use centralized error handling and consistent API response shapes.
- Add loading, empty, success, and failure states to UI flows.
- Use accessible labels and keyboard-friendly controls.
- Avoid `any` in frontend TypeScript unless justified and documented.
- Avoid duplicated business logic across pages.
- Do not leave placeholder buttons, fake metrics, or nonfunctional menu items.
- Do not claim a feature is complete unless its API, UI, persistence, permissions, and tests are implemented.

## 8. Database and migrations

- Every schema change requires a migration.
- Migrations must work from a clean database.
- Do not edit an already-applied migration; create a new migration.
- Add indexes for foreign keys, farm scope, common filters, and unique business keys.
- Use foreign keys where appropriate.
- Use `DECIMAL` for money and measured quantities.
- Ensure tenant/farm isolation in every query.
- Seed only safe demo data; never commit real credentials.

## 9. UI and product design

- Use a clean, calm agricultural visual style.
- Prioritize readability, clear status indicators, and quick data entry.
- Design for desktop and mobile, including workers using phones in the field.
- Use role-specific navigation and dashboards.
- Keep forms short and group related fields.
- Provide confirmation for destructive or irreversible actions.
- Display offline and sync status globally.
- Support Somali and English text without hard-coding UI strings throughout components.

## 10. Security and privacy

- Do not expose secrets in source code, logs, screenshots, or client bundles.
- Do not log passwords, session tokens, or sensitive authentication data.
- Use secure password hashing and session handling.
- Rate-limit authentication endpoints.
- Validate file uploads and enforce size/type limits.
- Use HTTPS in production.
- Apply CSRF protections when cookie-based authentication is used.
- Do not bypass permission checks to make a demo work.

## 11. Testing and verification

Before declaring work complete:
- Run lint, typecheck, unit tests, API tests, and build where available.
- Test migrations against an empty MySQL database.
- Test each role against allowed and forbidden API routes.
- Test offline creation, refresh persistence, reconnect, retries, duplicate requests, and conflict handling.
- Test stock balance and financial calculations.
- Fix errors introduced by the changes.
- Report exact commands run and any remaining failures honestly.

## 12. Working style and deliverables

For each substantial task:
1. State the goal and implementation plan.
2. Implement the complete vertical slice (database → API → UI → permissions → tests).
3. Update documentation and environment examples.
4. Run verification.
5. Summarize files changed, behavior delivered, commands/tests run, and known limitations.

Do not stop after creating only a dashboard mockup when the task requires a working full-stack feature.
