# E-Filing Backup and Restore

This procedure covers the complete persistent state of the E-Filing ISO 9001 MVP. A recoverable backup is one timestamped set containing:

1. the PostgreSQL database;
2. controlled-document and DAR files; and
3. record/evidence files used by Records, Findings, CAR, and NCR.

The database and file storage must come from the same backup set, created in one stopped-application backup window. Never mix a database dump and files from different backup sets.

> A Git clone alone does not restore application data. `db:migrate` plus `db:seed` also does not restore existing production/project data. Do not seed a restored database unless a separately reviewed recovery plan proves that it is necessary.

## Prerequisites

- Access to the private repository and to the host that contains the live database and file storage.
- Node.js 22.12 or later and the dependencies installed under `efiling` with `npm ci`.
- PostgreSQL client tools `pg_dump` and `pg_restore`. `pg_dump` must be the same major version as the PostgreSQL server or newer; use a `pg_restore` version compatible with the `pg_dump` that created the archive.
- Enough free space for the database dump, both storage trees, and an additional working copy during restore.
- A maintenance window in which the API and every other database/file writer can be stopped.
- A secure location outside the repository for retained backup packages. The default `efiling/backups/` directory is Git-ignored, but an external encrypted backup volume is preferable.

Check the tools without connecting to or changing the database:

```powershell
pg_dump --version
pg_restore --version
```

If they are not in `PATH`, the project commands accept `--pg-bin "C:\Program Files\PostgreSQL\17\bin"`.

Do not put passwords, `DATABASE_URL`, `.env`, or other secrets in this document, a backup package, command history, or source control. For direct PostgreSQL commands, use a protected libpq password file (`PGPASSFILE`) or allow the tool to prompt securely.

## What must be backed up

### PostgreSQL

The Prisma datasource in `prisma/schema.prisma` uses PostgreSQL. The database holds users and roles, document/workflow records, audit history, file metadata, and the storage keys that link rows to files.

Back up the database identified by the local `DATABASE_URL`. Do not print or copy that URL into logs or backup metadata.

### Controlled-document storage

- Override: `DOCUMENT_STORAGE_DIR`
- Default when unset: `efiling/.local/document-storage`
- Contents: controlled-document PDFs and DAR files (`DocumentFile.storagePath` and `DarFile.storagePath`)

### Record/evidence storage

- Override: `RECORD_STORAGE_DIR`
- Default when unset: `efiling/.local/record-storage`
- Contents: uploaded evidence referenced by Records, Findings, CAR, and NCR (`Evidence.storagePath`)

Both variables can override their defaults with absolute paths. The API implementations and migration tools resolve the same variables. The two paths must be different.

Back up each complete storage root while preserving relative names and directories. An `incoming` subdirectory contains temporary uploads and is deliberately excluded by the project backup helper; files there are not committed application data. Do not omit any other file from either storage root.

No additional persistent upload directory was found in the current storage implementation. Database rows reference file content through the three storage-key groups listed above.

## Consistent backup procedure

1. Announce a maintenance window and stop the E-Filing API/frontend and all imports, uploads, scheduled jobs, or other writers.
2. Confirm no other process can write to this database or either storage path. Merely checking that the API port is closed cannot prove that another database client is absent.
3. From `efiling`, run the guarded backup command:

   ```powershell
   npm run backup:migration -- --application-stopped --output "D:\E-Filing-Backups"
   ```

   If necessary, append:

   ```powershell
   --pg-bin "C:\Program Files\PostgreSQL\17\bin"
   ```

4. Keep the resulting `efiling-<timestamp>` directory intact as one backup set. Do not restart writers until the command has finished or failed.
5. Copy the completed set to protected backup media and verify the manifest again after transfer.

The helper fails if the API port is open, a database/storage reference is missing, the storage paths overlap incorrectly, the PostgreSQL client tool is unavailable, or the timestamped output directory already exists. It first writes to an `.incomplete` directory and never deletes or overwrites an existing completed backup.

### Equivalent direct database backup

The database portion of the helper is equivalent to this custom-format dump. Replace angle-bracket placeholders locally; never place a password in the command:

```powershell
pg_dump --format=custom --no-owner --no-privileges `
  --host <db-host> --port <db-port> --username <db-user> `
  --file "<backup-set>\database\efiling.dump" <db-name>
```

`--format=custom` is required for the documented `pg_restore` flow. `--no-owner` and `--no-privileges` make recovery to a newly created local role practical. The direct command does not copy files or create the checksum manifest; use the project helper unless there is a reviewed operational reason not to.

### File-storage backup details

During the same stopped-writer window, and without restarting the application after `pg_dump`, copy:

- the complete `DOCUMENT_STORAGE_DIR` root to `<backup-set>\storage\document-storage`; and
- the complete `RECORD_STORAGE_DIR` root to `<backup-set>\storage\record-storage`.

Preserve relative paths and filenames because the database stores those keys. Exclude only each root's temporary `incoming` directory. If a configured storage root does not yet exist and the database verifier confirms it has zero references, retain an empty corresponding directory in the package rather than inventing application files.

The project helper performs these copies separately after creating `database\efiling.dump`, refuses overlapping live/output paths, uses exclusive file creation, and checks all database file references against the copied trees before publishing the completed timestamped directory. A manual copy needs equivalent safeguards and a newly created output path; never merge into or overwrite an older backup set.

## Timestamped backup structure

The helper creates a UTC timestamped package such as:

```text
efiling-20260922T103000Z/
|-- README.md
|-- metadata.json
|-- manifest-sha256.txt
|-- database/
|   `-- efiling.dump
`-- storage/
    |-- document-storage/
    `-- record-storage/
```

`metadata.json` contains non-secret database location metadata, file counts, reference counts, and the consistency statement. `manifest-sha256.txt` contains a SHA-256 entry for every other package file.

Treat the entire directory as indivisible. A useful retention label is the package timestamp plus the source code commit identifier recorded separately from secrets.

## Checksums and manifest

Before transferring a package, run this from `efiling` on the source system while its configured database is still available:

```powershell
npm run verify:migration -- --package "D:\Transfer\efiling-<timestamp>"
```

This recalculates SHA-256 hashes, rejects missing, changed, or unexpected package files, connects read-only to the configured database, and verifies that its referenced files are readable in the configured storage paths. Because this verifier also queries application tables, it cannot complete against the new empty destination database before restore. The restore helper validates the manifest before it changes the target; run the verifier again after restore as described below.

Keep the manifest with the package. If any checksum fails, quarantine the set and use another known-good complete set; do not restore selected files from the damaged set.

## Restore on a new or isolated machine

Never restore over the current working database or storage. Use a new machine or an isolated, newly created database and empty storage destinations.

1. Clone or copy the private repository at the source-compatible revision. Remember that this restores code only, not application data.
2. From `efiling`, run `npm ci`.
3. Install PostgreSQL and compatible `pg_restore` client tools.
4. Create a new PostgreSQL login and a new empty database owned by that login. Use locally chosen credentials and do not copy secrets into the repository.
5. Copy `efiling/.env.example` to `efiling/.env` and configure the new environment as described below.
6. Confirm the target database has no application tables and both storage destinations are absent or empty.
7. Validate source configuration and generate the Prisma client without changing the database:

   ```powershell
   npm run db:validate
   npm run db:generate
   ```

8. Keep the transferred package closed to manual edits. The restore helper verifies every manifest entry before changing the empty target. If pre-restore verification is required separately, run the verifier on a safe source-compatible database rather than the new empty destination.
9. Run the guarded restore from `efiling`:

   ```powershell
   npm run restore:migration -- --package "D:\Transfer\efiling-<timestamp>" --confirm-empty-target
   ```

   Add `--pg-bin "<PostgreSQL-bin-directory>"` if required.

The restore helper refuses a non-empty database, refuses non-empty storage destinations, verifies the manifest, stages both storage copies, and runs `pg_restore` with `--single-transaction --exit-on-error --no-owner --no-privileges`. It does not run `db:seed`, `prisma migrate reset`, or an automatic migration.

### Equivalent direct database restore

Only for a newly created empty target database:

```powershell
pg_restore --exit-on-error --single-transaction --no-owner --no-privileges `
  --host <db-host> --port <db-port> --username <db-user> `
  --dbname <new-empty-db-name> "<backup-set>\database\efiling.dump"
```

Do not add `--clean` and do not point this command at the current working database. When performing a manual restore, copy both storage directories from the same set to the configured empty destinations, preserving every relative path. Prefer the guarded project restore because it checks empty targets and checksums automatically.

## Required environment configuration

Configure these values on the destination host without committing `.env`:

- `DATABASE_URL`: the new PostgreSQL database, login, schema, and connection options.
- `API_PORT`: optional; defaults to `3001`.
- `DOCUMENT_STORAGE_DIR`: controlled-document/DAR destination, or accept the default under `efiling/.local`.
- `RECORD_STORAGE_DIR`: Records/Finding/CAR/NCR evidence destination, or accept the default under `efiling/.local`.
- `RECORD_MAX_FILE_MB`: optional upload limit; default is 10 MB.
- `RECORD_ALLOWED_MIME_TYPES`: optional MIME allow-list.

The two storage roots must be separate, writable by the application identity, and protected from public web serving. Ensure operating-system permissions and backup encryption meet the sensitivity of the stored documents.

## Prisma migration considerations

- The migration mechanism is Prisma Migrate with SQL migrations in `prisma/migrations`.
- `npm run db:migrate` executes `prisma migrate deploy` through `efiling/scripts/prisma.mjs`.
- `npm run db:seed` runs the demo seed script; it is not a recovery command.
- A database dump already contains the schema, data, and `_prisma_migrations` history from backup time. For the same source revision, do not immediately run `db:migrate` after restore.
- Check migration state first with `node scripts/prisma.mjs migrate status` from `efiling`.
- Run `npm run db:migrate` only when the destination source contains reviewed migrations newer than the backup, and only after taking another backup of the restored target.
- Never run `prisma migrate reset` during recovery.
- Do not seed a restored database unless a separately reviewed, tested recovery requirement proves it is necessary. Seeding can create demo data or conflicts; `db:migrate + db:seed` does not restore the former system state.

## Post-restore verification checklist

Run the read-only verifier first:

```powershell
npm run verify:migration -- --package "D:\Transfer\efiling-<timestamp>"
```

Then start the isolated system and check:

- [ ] The verifier reports `database: connected`.
- [ ] The manifest is valid and `storage.missing` is `0`.
- [ ] User and role counts are plausible for the source backup.
- [ ] Controlled-document records exist and at least one restored PDF opens.
- [ ] DAR records, acknowledgements, and their history remain available.
- [ ] Records and evidence exist and at least one restored evidence file downloads.
- [ ] Audit rounds and Findings remain available.
- [ ] CAR/NCR records and workflow states remain available.
- [ ] Dashboard totals are derived from restored data.
- [ ] Audit events/history remain available.
- [ ] DCC, QMR, Auditor, and Sponsor smoke tests preserve expected access boundaries.
- [ ] `node scripts/prisma.mjs migrate status` shows the expected migration state.
- [ ] The original source system and its backup set remain unchanged until acceptance is signed off.

Record the backup timestamp, source revision, destination host/database identifier, verifier output summary, tester, and acceptance time without recording credentials.

## Rollback and safety notes

- Backup is read-only with respect to application data, but consistency requires a real write outage covering both the dump and file copy.
- Never test a restore against the current database or current storage paths.
- The restore target must be disposable and isolated until verification is complete.
- If restore fails after touching the new target, do not retry into that partially restored database or storage. Preserve logs without secrets, abandon the target, create another empty database and empty storage destinations, and retry from the intact package.
- Do not delete or overwrite the source data or last known-good backup during recovery.
- Do not mix storage from one timestamp with a database from another.
- PostgreSQL cluster-level roles and passwords are not included in the portable custom-format dump; create destination roles separately.
- A successful script/test run proves command and guard behavior, not disaster recovery. Backup/Restore readiness is not fully verified until a complete restore into a clean database and clean storage environment has passed the checklist.
