# Version roadmap

**Updated:** 2026-11-07  
**Status:** Planned releases; no application version has been completed.  
**Current target:** v0.1 — Foundation.

## How development progresses

Build and verify one version before starting the next. Every version includes the features from earlier versions. Maintain one codebase for independent client installations on local servers or VPS hosting.

This document defines release scope and completion criteria. The [MVP checklist](MVP-CHECKLIST.md) tracks progress. [Release specifications](RELEASE-SPECIFICATIONS.md) define behavior and permissions across v0.1–v1.0; the [database overview](DATABASE-SCHEMA.md) links each version's schema. The [v0.1 specification](V0.1-SPECIFICATION.md) provides additional foundation detail.

For each version:

1. Define its scope, data changes, permissions and acceptance checks.
2. Implement only the agreed scope, including required audit and error handling.
3. Run relevant tests and demonstrate the workflow with synthetic data.
4. Record verification results, known limitations, migration instructions and release notes.
5. Resolve release-blocking defects and mark the version complete before starting the next.

No dates are committed yet. A version is complete when its acceptance criteria pass, not when its screens merely exist.

## Release overview

| Version | Main outcome | Status |
| --- | --- | --- |
| v0.1 | A lab can initialize the application and manage staff access | Planned — first target |
| v0.2 | Staff can register patients, order tests and track samples | Planned |
| v0.3 | Staff can enter, approve and print results | Planned |
| v0.4 | Staff can invoice orders and record payments | Planned |
| v0.5 | Staff can manage routine operations and inspect activity | Planned |
| v1.0 | The integrated application is ready for a supervised lab pilot | Planned |

## v0.1 — Foundation

**Includes:** React/Express/TypeScript workspace; PostgreSQL foundation tables and migrations; configuration validation; secure first administrator setup; login/logout; offline-capable staff setup and password recovery; staff roles; lab settings; audit foundation; basic dashboard; initial Docker Compose setup.

**Complete when:** A fresh installation can be configured and used by authorized staff. Account/session invalidation, last-administrator protection and backend permissions pass tests. Local authentication works without internet. Two independent installations run the same release with separate data and storage. All [foundation acceptance checks](V0.1-SPECIFICATION.md#acceptance-checklist) pass.

**Demonstration:** Start a fresh installation, configure the lab, create a staff member, log in, verify restricted access and log out.

## v0.2 — Patients, orders and samples

**Includes:** Patient registration/search/history and duplicate warnings; test catalog, panels, parameters, result types, units, reference ranges and prices; multi-test orders; historical definition/price snapshots; order search/cancellation; sample collection, receipt, rejection and recollection.

**Complete when:** Staff can create a multi-test order and track its samples. Concurrent creation cannot duplicate business identifiers. Catalog edits preserve earlier orders. Invalid transitions and unauthorized changes fail; rejection and recollection retain their history.

**Demonstration:** Register a synthetic patient, order tests, collect a sample, reject it with a reason and record a linked replacement.

## v0.3 — Results and reports

**Includes:** Typed result entry and validation; applicable range flags; submission, rejection and approval; controlled partial release; protected lab-branded PDF reports; immutable released versions and traceable amendments.

**Complete when:** Unauthorized or unapproved final release fails. Reviewer decisions and corrections retain actor/time/reason history. Reports show the correct patient, lab, values, units, ranges and approver. Partial release does not mark unfinished tests complete. Earlier issued reports remain retrievable after amendment.

**Demonstration:** Enter and submit results, return them for correction, approve and print a report, then issue a marked amendment linked to the earlier version.

## v0.4 — Billing and payments

**Includes:** Order invoices; authorized discounts; full/partial payments; receipts; outstanding balances; controlled adjustments, refunds and reversals; basic collection summaries.

**Complete when:** Exact decimal calculations produce correct totals and balances. Permissions protect financial changes. Concurrent and retried requests cannot duplicate payments or corrupt balances. Reversals retain the original financial history.

**Demonstration:** Invoice an order, record a partial payment, print a receipt, settle the balance and demonstrate an authorized reversal.

Billing follows results in development order. In daily lab operation, invoicing and payment can occur when the order is created. Versions v0.2–v0.4 together deliver the complete patient-to-report-and-payment workflow.

## v0.5 — Routine administration

**Includes:** Staff/settings refinements; operational dashboard; daily collection and outstanding-balance views; searchable audit viewer. Basic staff management and settings already exist in v0.1.

**Complete when:** Dashboard and financial summaries reconcile to source records and respect dates, lab timezone and permissions. Staff can inspect authorized audit history without modifying it. Configuration changes preserve historical clinical and financial records.

**Demonstration:** Review daily activity, inspect outstanding invoices, update permitted lab settings and trace a sensitive action in the audit viewer.

## v1.0 — Supervised pilot readiness

**Includes:** Integrated workflow validation; documented local/VPS installation; production HTTPS; monitoring; automated encrypted off-server backups; tested restoration; update/recovery procedures; local-to-VPS migration; workload/security checks and staff guidance.

**Complete when:** All prior milestones pass, release-blocking defects are resolved, and the [deployment evidence](DEPLOYMENT.md#pilot-release-evidence) is recorded. Restore data and files onto a fresh installation, demonstrate local use without internet, verify separate VPS installations and rehearse controlled hosting migration. Lab staff validate clinical workflows and the client-specific policies in [Requirements](REQUIREMENTS.md#details-to-settle-with-the-pilot-lab).

**Demonstration:** Complete registration through approved report and payment, restore a backup, and show the application operating in both deployment configurations.

v1.0 targets a supervised pilot. Commercial rollout follows successful pilot evaluation and resolution of operational/client requirements.

## Version numbers and release records

- Use full release identifiers such as `v0.1.0`; headings use `v0.1` as shorthand for that milestone.
- Use patches such as `v0.1.1` and `v0.1.2` for fixes within the completed milestone. A patch must not silently expand the release scope.
- Mark a release only after its acceptance evidence is recorded; create a Git tag when actually releasing it.
- Release notes record features, fixes, checks performed, known limitations, configuration changes, database migrations and recovery instructions.
- Record the installed application and schema versions per client. Test upgrades before distributing them; never assume image rollback reverses schema changes.

Security, auditability, data integrity and appropriate tests are part of every version. v1.0 verifies the integrated deployment rather than postponing those responsibilities.

## Later versions

Define releases after v1.0 from pilot feedback. Analyzer integration, patient portal, messaging, inventory, branch management and offline synchronization remain outside this roadmap until separately scoped. Keep customer differences configurable instead of maintaining customer-specific code branches.
