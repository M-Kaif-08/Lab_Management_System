# Release specifications — v0.1 through v1.0

**Updated:** 2026-11-07  
**Status:** Planned behavior and acceptance; no release is implemented.

Use the [roadmap](VERSION-ROADMAP.md) for sequence and [database overview](DATABASE-SCHEMA.md) for exact data contracts. This document owns functional boundaries for each release. API groups below identify responsibilities; implementation must define validated request/response contracts before adding routes.

## v0.1 — Foundation

Use the dedicated [foundation specification](V0.1-SPECIFICATION.md) and [v0.1 schema](database/V0.1.md). It covers local bootstrap, invited/active/disabled accounts, login/logout, roles, setup/reset tokens, settings and audits. No clinical metrics appear before source modules exist.

**Gate:** All foundation acceptance checks pass, including two independent installations, disconnected local authentication and concurrent final-admin protection.

## v0.2 — Patients, catalog, orders and samples

**Requirements:** R03–R06; extend R02/R11 authorization/audits.  
**Schema:** [v0.2](database/V0.2.md).

Screens: patient search/registration/history; catalog/parameters/panels; order booking/detail/search; collection/receipt/rejection/recollection queues.

API groups: /api/patients, /api/tests, /api/panels, /api/orders, /api/samples.

Behavior:
- Registration requires a name and unique generated patient number; birth date/contact may be unknown. Estimated birth dates are labeled.
- Warn about possible duplicates; no automatic merge. Corrections require reason and protected change history.
- Admin configures catalog and ranges; booking snapshots definitions, choices, ranges and prices.
- Panels expand into test items. Duplicate test occurrences remain explicit separate items.
- Pending samples move through collection/receipt/processing, with recorded staff/times; rejection creates a recollection path.
- Authorized cancellation before result submission retains all history. Result/financial rules apply automatically once those modules exist.

**Gate:** Demonstrate registration, multi-test booking, catalog edits without historical changes, parallel number allocation, sample rejection/recollection, wrong-order specimen rejection and API permission failures.

## v0.3 — Results, review and reports

**Requirements:** R07–R08; extend R11.  
**Schema:** [v0.3](database/V0.3.md).

Screens: result work queue, parameter entry, review queue, approval/rejection, report preview/history and amendments.

API groups: /api/results, /api/reviews, /api/reports and protected /api/files.

Behavior:
- Validate values against ordered parameter definitions and actual samples, not the current mutable catalog.
- Freeze content on submission; reviewer rejection creates a new editable revision rather than changing submitted evidence.
- Default self-review is disabled; partial release is allowed and visibly labels outstanding tests. These defaults are configuration until v0.5 moves them into settings.
- A reviewer approves result sets. Publication selects current approved sets, renders privately, revalidates and releases immutable bytes.
- New amendments do not erase earlier approved results or issued PDFs. Failed generation never appears as a final report.
- Identity corrections after submission need a reason and explicit corrected report version; historical documents remain retrievable.

**Gate:** Exercise all value types, missing/invalid fields, sample/range mismatch, review permissions, concurrent amendments, file failure, partial release and preserved older PDFs.

## v0.4 — Billing

**Requirements:** R09; extend R02/R10/R11.  
**Schema:** [v0.4](database/V0.4.md).

Screens: invoice detail, payment entry, receipts, outstanding balance, adjustments and return history.

API groups: /api/invoices, /api/payments, /api/receipts, /api/financial-permissions.

Behavior:
- Issue one invoice per order from frozen prices; invoices can be created at booking in the integrated workflow.
- Later changes use explicit adjustments. Issued lines/payments are never silently edited.
- Support partial payments and distinct refund/reversal actions; show both outstanding and refund_due.
- Cashiers record ordinary payments; explicit per-user grants authorize discounts, adjustments, refunds and payment reversals.
- Idempotency keys make retry after a lost response safe. PDF failure does not duplicate or undo an already committed payment/receipt.
- Full-payment delivery restriction defaults false until confirmed; payment never grants clinical approval.

**Gate:** Test exact arithmetic, line/header totals, repeated/concurrent submissions, paid-invoice credits/refunds, reversal reopening balances, unauthorized actions and immutable receipt history.

## v0.5 — Administration

**Requirements:** Complete R01/R10 and audit viewing for R11.  
**Schema:** [v0.5](database/V0.5-V1.0.md#v05-schema-changes).

Screens: operational dashboard, financial summaries, audit search, complete lab/staff settings and policy confirmation.

API groups: /api/dashboard, /api/financial-summaries, /api/audit-events and extensions to /api/settings and /api/users.

Behavior:
- Reuse source records and ordinary views; no independently editable summary balances.
- Copy configured review/release/payment policies into database settings during migration without changing effective behavior.
- Require lab admin confirmation before pilot. Changes are version-checked and audited.
- Respect timezone, permissions and historical snapshots in all filters and totals.
- Staff role changes and financial grant changes invalidate sessions immediately using the foundation rules.

**Gate:** Reconcile dashboard/financial totals to source records, test timezone boundaries and prove restricted roles cannot access unauthorized report/audit data.

## v1.0 — Supervised pilot

**Requirements:** R12 and integrated verification of R01–R11.  
**Schema:** [v1.0 gate](database/V0.5-V1.0.md#v10-database-and-operational-gate).  
**Operations:** [Deployment plan](DEPLOYMENT.md).

Deliver installation/update/recovery commands, safe configuration examples, staff instructions and recorded evidence. Do not add clinical features to this milestone without rescoping.

**Gate:** Fresh installation and stepwise upgrades work; complete registration-to-report/payment flow passes; backups restore database and files; disconnected local operation and shared-VPS isolation pass; migration preserves one writable source; lab staff confirm workflow/policies and agreed recovery/workload targets are met.

## Baseline permissions

Multiple roles combine permissions; everything else is denied. Screen hiding alone never enforces this matrix.

| Operation | Baseline authorization |
| --- | --- |
| Lab/staff/catalog/policy configuration | lab_admin |
| Patient registration/correction and order booking | receptionist or lab_admin |
| Pre-submission cancellation | receptionist or lab_admin, reason required |
| Sample processing and result entry | technician |
| Result review and report release/amendment | reviewer, with self-review policy enforced |
| Released report delivery | receptionist or reviewer; payment policy applies to routine patient delivery |
| Invoice issuance and ordinary payment/receipt | cashier |
| Discount/adjustment/refund/reversal | cashier plus the corresponding user_permissions grant |
| Grant/revoke financial permissions | lab_admin; audited, session invalidation |
| Financial summaries and audit viewer | lab_admin; cashier sees financial summaries only |
| Clinical record reading | Only records needed by the user's assigned workflow; never unrestricted access merely through dashboard endpoints |

Lab admins who perform clinical or cashier tasks also need those roles. Before clinical use, the lab must assign qualified reviewers and confirm this matrix. No platform owner clinical-access bypass is included.

## Evidence and scope control

For each release record migration versions, commands/tests run, expected and actual results, demonstration data, unresolved defects and upgrade/recovery notes. A documentation check is not a database or clinical acceptance test.

Client-specific reference values, report templates, workload and retention periods remain the open decisions listed in [Requirements](REQUIREMENTS.md#details-to-settle-with-the-pilot-lab). Engineering schema coverage is defined across all releases; later clinical policies do not justify silently adding shared-platform scope.
