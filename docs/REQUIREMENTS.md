# Product requirements

**Updated:** 2026-11-07  
**Status:** Current scope; implementation pending.

## Product and scope

Build one browser-based lab management application and sell independent installations to multiple clients. Each installation serves one lab and has its own staff, settings, database and files. Customers choose local hosting or VPS hosting. The same application release supports both through configuration.

The MVP covers patient registration, test ordering, sample tracking, result entry and review, report printing, billing, staff administration and recovery.

## Staff roles

| Role | Responsibilities |
| --- | --- |
| Lab administrator | Manage staff, lab settings, catalog and prices |
| Receptionist | Register/search patients, create orders and provide released reports |
| Technician | Record sample handling and enter/submit results |
| Authorized reviewer | Review, reject or approve results and authorize amendments |
| Cashier | Record payments and issue receipts |

Staff may hold multiple roles. Administrative access alone does not grant clinical approval. Use the [baseline permission matrix](RELEASE-SPECIFICATIONS.md#baseline-permissions); v0.4 adds explicit financial grants. Confirm staff qualification and lab policy before pilot use. Enforce permissions in the backend and deny unassigned operations.

## Functional requirements

| ID | Area | Required behavior |
| --- | --- | --- |
| R01 | Lab configuration | Store lab name, logo, contact/address, timezone, currency and report/receipt settings. Each installation has one lab profile. |
| R02 | Staff and access | Secure initial administrator setup, login/logout, staff creation, password recovery, role assignment and deactivation. Prevent removal of the last active administrator. Invalidate access after relevant account changes. Core local access works without internet. |
| R03 | Patients | Register patients with unique identifiers and relevant demographics/contact details; search by ID/name/phone; warn about possible duplicates; show permitted history; audit corrections and preserve referenced records. |
| R04 | Catalog | Configure active tests, panels, parameters, result types, specimen requirements, units, reference ranges and prices. Preserve historical definitions and prices; deactivation prevents new ordering without changing old orders. |
| R05 | Orders | Create multi-test orders with unique readable numbers, patient/staff/time references and price snapshots. Search by patient, number, date and status. Audit cancellation and reject incompatible transitions. |
| R06 | Samples | Track unique sample identifiers, collection, receipt, processing, rejection and recollection with staff/timestamps. Require rejection reasons and retain links to replacement samples. |
| R07 | Results | Validate numeric/text/choice results against parameter definitions. Show applicable range flags for professional review. Track draft, submission, rejection, approval and amendments with actor/time/reason history. Preserve approved values. |
| R08 | Reports | Generate protected printable PDFs with lab/patient identity, order number, tests, values, units, ranges, dates, approver and report version. Final release requires approval. Partial release must identify unfinished tests correctly. Retain earlier reports and link marked corrections to prior versions. |
| R09 | Billing | Create invoices from order snapshots; support authorized discounts, full/partial payments, receipts and outstanding balances. Record payment method/time/staff/reference. Use exact decimal calculations and traceable authorized reversals/refunds. |
| R10 | Administration | Provide staff management, lab settings, permission-aware operational totals, daily collections, outstanding balances and searchable audit history. Totals must reconcile to underlying records. |
| R11 | Audit | Record security events and sensitive changes with actor/action/time/record/outcome. Ordinary users cannot edit history. Exclude credentials, raw tokens and unnecessary medical content from logs. |
| R12 | Recovery | Automate secure backups of data and files outside the primary server, document retention, monitor failures and demonstrate restoration. Support controlled updates and transfer between local and VPS hosting. |

## Main workflow

1. Register or find the patient.
2. Select tests, create the order and invoice, and record payment as appropriate.
3. Collect and receive required samples; record rejection/recollection when needed.
4. Enter and submit results.
5. An authorized reviewer approves or returns results for correction.
6. Release and print the approved report; issue receipts and track remaining balances.

Payment timing and whether unpaid invoices restrict report delivery are lab-policy decisions. The engineering default allows delivery without full payment; v0.5 records the confirmed policy. Payment state must never imply clinical approval. Panels group tests at the sum of their prices, and the MVP uses two-decimal currencies; independent package pricing and currency conversion are outside this release design.

## Quality and acceptance requirements

- Protect production browser traffic with HTTPS, including local installations using a documented certificate trust process.
- Validate inputs server-side; protect sessions, mutations, files and report downloads. Keep secrets outside source control.
- Preserve clinical and financial history. Commit required audit events with the corresponding business changes.
- Bundle assets required by core local workflows; no cloud service may be required for local registration, results, billing, printing or authentication.
- Handle unavailable dependencies explicitly without silently losing committed records.
- Test critical permissions, concurrent numbering/payment actions, clinical transitions, historical snapshots and recovery.
- Provide usable desktop/tablet screens with clear validation, loading, empty and failure states.
- Define a realistic workload before performance acceptance; initially target common searches within two seconds under that agreed workload.
- Before live use, demonstrate the complete workflow with synthetic records, restore onto a fresh installation, validate workflows with lab staff and settle retention/access obligations.

## Deferred features

Shared multi-lab administration, branch management, automatic local/cloud synchronization, full browser offline mode, analyzer/barcode hardware integration, patient portal, messaging, automated subscription billing, payroll and advanced inventory are outside the MVP.

Customer sales and renewals can initially be managed outside the application.

## Details to settle with the pilot lab

- Validated test catalog, units, reference ranges and sample rules.
- Reviewer qualifications, approval/self-review rules, amendment and partial-release policy.
- Report/receipt format, discounts/refunds and unpaid-report policy.
- Server operating system, staff/device count, printers and expected workload.
- Backup frequency, retention, maximum acceptable data loss and recovery time.
- Data correction, access, export and retention responsibilities.

These details remain open; the documentation does not assert clinical validation or production readiness.
