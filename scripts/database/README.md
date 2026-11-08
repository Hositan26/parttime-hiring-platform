# Database operations

Run commands from the repository root. Docker Desktop must be running, with the local MySQL 8 container named `mysql-parttime` and port 3306 published.

## Layout

- `ParttimeHiringBackend/src/main/resources/db/migration/`: shared, versioned schema/reference migrations, applied in dev and prod.
- `ParttimeHiringBackend/src/main/resources/db/dev/data/`: fictional fixture definitions and SQL, applied only by the dev Java migration.
- `database/demo/images/`: public fictional images and document mockups, served by the dev backend at `/parttime_hiring_platform/demo/**`.
- `database/demo/resumes/`: private demo PDFs. The migration copies them into authenticated profile storage; there is no static resume route.
- `.local/database-backups/`: ignored local backups and verification results.
- `docs/`: ignored local documentation.

Common migrations use `flyway_schema_history`. Dev fixtures use `flyway_dev_seed_history`, with an explicit version-zero baseline over the already migrated common schema. This baseline applies only to the separate fixture history. Common migrations never automatically baseline an unknown schema.

## First local startup

1. Copy `.env.dev.example` to `.env` and fill in the local MySQL password and a demo password of at least 12 characters (at most 72 UTF-8 bytes).
2. Start the existing container: `docker start mysql-parttime`.
3. Create the two local schemas: `python scripts/database/manage.py init`.
4. From `ParttimeHiringBackend`, run `./mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"`.
5. From `ParttimeHiringFrontend`, run `npm install` if needed, then `npm run dev`.

BE: `http://localhost:8088/parttime_hiring_platform`. FE: `http://localhost:5173`.

The `local` profile remains an alias for `dev`. Starting without an explicit profile defaults to dev. Paths in the dev configuration assume the backend working directory is `ParttimeHiringBackend`; override `DEMO_ASSETS_DIRECTORY` with an absolute path if needed. `DEV_DB_URL`, `DEV_DB_USERNAME`, and `DEV_DB_PASSWORD` override the local datasource. A legacy generic `DB_URL` cannot accidentally select the old database in dev.

Accounts: `demo_admin_01` / `demo_admin_02`, `demo_employer_01` through `demo_employer_10`, and `demo_user_01` through `demo_user_40`. All use the `DEMO_SEED_PASSWORD` supplied for the first migration. Users 39 and 40 are deliberately disabled; employers 9 and 10 are suspended. Restarting does not reset edited credentials or duplicate fixtures. Changing the environment password after migration does not change existing passwords.

## Reset dev

Stop the backend, then run:

```powershell
python scripts/database/manage.py reset-dev --confirm-dev-reset
```

The command backs up dev before dropping it. It accepts no arbitrary database or host argument and cannot reset prod. Restart the dev backend to recreate schema and demo fixtures. A reset creates the canonical 52 demo accounts; original local accounts retained during the one-time transition are in the ignored legacy snapshot.

To restore that original snapshot after a future reset: start dev once with `--app.demo.enabled=false`, stop it, run `python scripts/database/manage.py restore-legacy`, then restart normally. Restore is refused if dev already contains users.

`backup`, `counts`, `verify-backup`, and `preserve-legacy` are additional operations on `manage.py`. The last two are specific to the one-time transition and require its original local files/database. They do not overwrite existing backups.

## Production

Deploy with `SPRING_PROFILES_ACTIVE=prod` and explicit environment variables from `.env.prod.example`. The prod profile does not import the local `.env`, does not load fixtures, does not expose demo image handlers, and has secure cookies enabled. There are no default production accounts. The `_prod` schema created by `init` is an empty **local verification schema**, not a deployment to a remote production server.

Both environments use `ddl-auto=validate`; Flyway owns DDL. Never change an applied migration or enable Hibernate `update`. Add the next shared `V<N>__description.sql`; keep dev data versions separate. Flyway clean is disabled. Never run legacy SQL or the archived manual seed importer.

## Verification

Run normal backend tests from `ParttimeHiringBackend`: `./mvnw.cmd test`.

To additionally execute real MySQL migration tests, provide `MYSQL_MIGRATION_TESTS=true`, `MYSQL_TEST_URL=jdbc:mysql://localhost:3306`, `MYSQL_TEST_USERNAME`, and `MYSQL_TEST_PASSWORD`. The test account needs permission to create/drop disposable `parttime_flyway_test_<uuid>` schemas. Tests never reset persistent dev/prod databases.

For live API smoke checks, set `DEMO_SEED_PASSWORD` in the shell, then run `python scripts/database/check_api.py`. It checks cookie/CSRF login, role boundaries, dashboards, public jobs, private CV ownership, disabled users, demo images, and logout. It writes results under ignored `.local/database-backups/`.

`generate_fixtures.py` is an authoring helper, not an application startup step. Its Python definitions live under resources with the fixture SQL. Do not regenerate or edit the checksum-protected SQL after deployment; introduce a new dev migration for later changes.
