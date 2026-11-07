# Laboratory Management System

One software product for independent diagnostic laboratories. Each customer receives a separate installation, hosted inside their lab or on a VPS, using the same codebase.

**Project status:** Documentation and design only. Application code, database migrations, Docker configuration and automated tests have not been implemented.

## Documentation

Read these in order:

| Document | Purpose |
| --- | --- |
| [Requirements](docs/REQUIREMENTS.md) | Product scope, staff roles and lab workflows |
| [Version roadmap](docs/VERSION-ROADMAP.md) | Version-by-version scope, completion criteria and release policy |
| [Architecture](docs/ARCHITECTURE.md) | Application structure and independent installations |
| [Release specifications](docs/RELEASE-SPECIFICATIONS.md) | Behavior, permissions and acceptance for v0.1–v1.0 |
| [Database schema](docs/DATABASE-SCHEMA.md) | Cumulative v0.1–v1.0 schema with per-version tables, constraints and indexes |
| [Foundation specification](docs/V0.1-SPECIFICATION.md) | First implementation milestone and acceptance checks |
| [Deployment plan](docs/DEPLOYMENT.md) | Local/VPS hosting, backups, updates and migration |
| [MVP checklist](docs/MVP-CHECKLIST.md) | Progress against the version roadmap |

Requirements define product scope; the roadmap defines release order; release specifications define behavior and acceptance; the database overview links the detailed schema for each version. The MVP checklist tracks verified delivery. All designs are planned: no written specification means a feature already works.

**Next step:** Implement the foundation milestone with synthetic data. Confirm client-specific clinical and operational details listed in the requirements before implementing the affected workflows.
