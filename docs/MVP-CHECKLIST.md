# MVP delivery checklist

**Updated:** 2026-11-07  
**Current state:** Design documentation only. No application code, migrations, deployment scripts or automated tests exist.

## Delivery order

The [version roadmap](VERSION-ROADMAP.md) defines release scope, demonstrations and completion criteria. This checklist tracks delivery progress.

Milestones build on each other. All items remain unchecked until implemented and verified. Each milestone includes permissions, input validation, safe errors, audit coverage and tests for its critical behavior.

| Milestone | Scope | Completion evidence |
| --- | --- | --- |
| v0.1 Foundation | Workspace, database foundation, account setup/recovery, sessions, staff roles, lab settings, initial Docker configuration | Pass the [foundation acceptance checks](V0.1-SPECIFICATION.md#acceptance-checklist) |
| v0.2 Registration and ordering | Patients, catalog/parameters/ranges/panels, orders and sample tracking | Create a multi-test order; retain price/definition snapshots; exercise rejected sample/recollection; prove concurrent identifiers remain unique |
| v0.3 Results and reports | Typed results, review/approval, partial release, PDF printing and amendments | Block unapproved release; retain approved revisions and earlier reports; display correct patient/lab identity |
| v0.4 Billing | Invoices, discounts, full/partial payments, receipts and reversals | Verify exact totals/balances, permissions, concurrent payments and duplicate-action protection |
| v0.5 Administration | Complete settings/staff screens, operational dashboard, collection summaries and audit viewer | Totals reconcile to records; permissions apply to all views/actions |
| v1.0 Pilot readiness | Local/VPS installation, monitoring, backups, recovery, updates, migration and training | Restore on a fresh installation, validate both hosting modes and complete the workflow with lab staff |

Stages v0.2 through v0.4 together deliver the first complete patient-to-report-and-payment workflow. Billing follows results in development order; staff can collect payment earlier in the operational workflow.

## Progress

- [x] v0.1 Foundation
- [x] v0.2 Registration and ordering
- [ ] v0.3 Results and reports
- [ ] v0.4 Billing
- [ ] v0.5 Administration
- [ ] v1.0 Pilot readiness

v1.0 denotes supervised pilot readiness, not an automatic commercial launch. Client-specific clinical/operational validation remains required.

## Next action

Implement [v0.1](V0.1-SPECIFICATION.md) using the planned architecture and [foundation schema](database/V0.1.md). The account lifecycle is specified; finalize validated endpoint contracts during implementation and use synthetic data. Later versions already have [release specifications](RELEASE-SPECIFICATIONS.md) and [schema coverage](DATABASE-SCHEMA.md).

Before implementing clinical modules, settle the relevant [pilot lab details](REQUIREMENTS.md#details-to-settle-with-the-pilot-lab). Record actual commands, outcomes and defects alongside delivered code before checking off milestones.

## Scope references

- [Requirements](REQUIREMENTS.md): workflows, roles and exclusions.
- [Architecture](ARCHITECTURE.md): application structure and configuration.
- [Database design](DATABASE-SCHEMA.md): records and integrity.
- [Deployment](DEPLOYMENT.md): local/VPS operation, updates and recovery.
