# Application architecture

**Updated:** 2026-11-07  
**Status:** Planned design.

## Deployment model

Maintain one codebase and one versioned application release. Run an independent installation for each customer, either on a local lab server or a VPS. An installation has one configured PostgreSQL database, its own credentials, persistent files and lab settings.

Multiple clients may share a VPS with separate Docker Compose projects, databases, volumes and private networks. A reverse proxy routes each approved hostname to the matching application. Each backend connects only to its configured database; browser input never selects a database.

## Planned stack and structure

| Component | Choice and responsibility |
| --- | --- |
| Web | React with TypeScript; browser interface and local bundled assets |
| API | Node.js and Express with TypeScript; authentication, authorization and business rules |
| Database | PostgreSQL; durable records, constraints and transactions |
| Proxy | Nginx; HTTPS and same-origin frontend/API routing |
| Packaging | Docker and Compose; repeatable installation services |

Planned source layout:

- `apps/web`: frontend.
- `apps/api`: API and application services.
- `packages/db`: migrations, restricted connection configuration and synthetic seeds.
- `packages/contracts`: validated request/response definitions.
- `deploy`: Compose/proxy configuration and operational scripts.

These directories do not exist yet. Add background processing only where a concrete module needs it.

## Request and storage boundaries

The browser connects through the proxy. The proxy serves the frontend and forwards `/api` to Express. The API authenticates the staff member, checks permission, validates input and uses its installation database. Report/file access also passes authorization checks.

Keep one bounded database pool per API instance. Runtime credentials cannot create databases, migrate schemas or alter audit history. Use separate maintenance credentials for migrations and recovery. Do not publish PostgreSQL to the public internet.

Persist database data and uploaded/generated files outside disposable containers. Version schemas, report artifacts and application releases. Keep clinical and financial history intact when settings change.

## Local and online behavior

Core local operations use the lab's network and continue during internet loss while local power, server and networking work. Local setup and account recovery must not require email delivery. Optional external services can fail without blocking unrelated local work.

VPS use requires an internet connection. Backup mobile internet addresses connection loss; it does not address a VPS outage. Shared VPS installations share host availability and resource capacity.

Use one authoritative writable installation per customer. Backups support recovery. Moving between locations uses a controlled cutover, described in the [deployment plan](DEPLOYMENT.md).

## Configuration

Configure public origin, database credentials, file paths, timezone, currency, session settings and backup destinations per installation. Keep secrets out of images, client bundles and Git. Validate required configuration at startup; fail with safe diagnostics when invalid.

All clients receive the same code and database migration sequence. Handle branding and permitted workflow differences through settings. Apply updates separately to each installation and record its installed version. The [database overview](DATABASE-SCHEMA.md) defines the cumulative v0.1–v1.0 model, and [release specifications](RELEASE-SPECIFICATIONS.md) define module behavior and permissions.
