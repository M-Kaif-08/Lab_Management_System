# Deployment and recovery plan

**Updated:** 2026-11-07  
**Status:** Design requirements; runnable installation commands and scripts will be added with implementation.

## Hosting options

| | Local lab server | VPS |
| --- | --- | --- |
| Application and database | Inside the lab | On the VPS |
| Staff access | Local network through browsers | Internet through browsers |
| Internet outage | Core local work continues if server/network/power remain available | Switch to backup internet; otherwise access stops |
| Main availability dependency | Local hardware, power and networking | VPS and internet |
| Backup destination | Encrypted storage outside the local server, including off-site/cloud copies | Encrypted storage outside the VPS |

Use the same release with different configuration. Bundle frontend assets and resources needed for local operation. Browser printing uses the staff device's configured printer; validate actual report/receipt printers during the pilot.

## Installation checklist

- Assign one Compose project, private application/database network, credential set and persistent volume set per customer.
- Configure the public origin, database, storage and lab settings; keep secrets outside Git and application images.
- Configure HTTPS. Local installations need a hostname/certificate trust procedure for staff devices; do not require staff to ignore certificate warnings.
- Route each VPS hostname to its intended deployment. Keep database ports private and restrict administration access.
- Run versioned migrations and secure initial administrator setup.
- Configure restart policies, readiness checks, disk/backup monitoring and resource limits.
- Verify access, reports, printing and backup restoration with synthetic records.
- For local service, document startup after reboot, UPS coverage and recovery from hardware failure.

Server operating system, sizing, certificate approach and detailed commands remain implementation/client setup decisions. Docker packages services; it does not supply backups or automatic failover.

## Backups and restoration

Back up the database, uploaded/generated files and required configuration using a consistent procedure. Encrypt off-site copies, protect keys separately and ensure authorized recovery operators can obtain them after server loss.

Choose backup frequency, retention, acceptable data loss and recovery time with the lab. Alert on failures and insufficient disk capacity. During internet loss, keep local backup jobs running where possible, queue off-site transfer and visibly report the age of the latest off-site copy.

Restore regularly onto a fresh isolated installation. Verify staff access, patient/order counts, reports, payments and file integrity. Revoke restored sessions and account tokens before reopening access. Record elapsed recovery time and the recovered backup timestamp. The [v1.0 database gate](database/V0.5-V1.0.md#v10-database-and-operational-gate) defines the backup manifest and cumulative upgrade checks. A backup on the same disk or an untested backup does not satisfy off-site recovery acceptance.

## Updates

Record installed application/schema versions. Test a release with representative synthetic data, take a recoverable backup and perform migrations during an appropriate maintenance window. Verify readiness and workflow smoke checks before restoring staff access.

A container image rollback may be incompatible with a changed database. Document a tested recovery path for each risky migration; do not assume reverting the image reverses the data schema.

## Moving between local and VPS hosting

1. Prepare the target with compatible application/database versions and configuration.
2. Restore a test copy of database and files; validate it privately with outbound integrations disabled.
3. Schedule cutover and stop new writes/jobs on the source.
4. Transfer the final consistent data/files and verify the target.
5. Direct staff to the new address and keep the source stopped or read-only.
6. Validate access, printing and backups; record the active installation and cutover time.

Only one location accepts writes. If the target has accepted new data, returning to the old source requires moving those changes back through a controlled recovery process. Never simply reopen a stale writable copy.

## Pilot release evidence

Demonstrate local operation without internet, deployment isolation on a shared VPS, a complete restore, an update recovery exercise and a local-to-VPS cutover. Staff must validate the lab workflow and recovery expectations before live use.
