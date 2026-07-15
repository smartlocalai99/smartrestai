# Supabase CLI Deployment Design

## Goal

Manage and push Supabase database migrations from this repository in the same repeatable way Prisma migrations are deployed.

## Repository Setup

- Install `supabase` as a development dependency.
- Initialize `supabase/config.toml` without overwriting the existing migration directory.
- Add package scripts:
  - `db:link`: link to project `uvrngxhovpzlxevkigoc`.
  - `db:push:dry`: preview unapplied linked-project migrations.
  - `db:push`: apply unapplied linked-project migrations.
- Keep migration SQL under `supabase/migrations/` so the CLI records applied versions and skips them on subsequent pushes.

## Credentials

The publishable browser key remains in `.env.local` for application data access. It is not sufficient for schema deployment.

The developer authenticates the CLI locally with `npx supabase login` and supplies the project's database password when linking or pushing. Access tokens and database passwords must not be written to repository files, package scripts, committed environment examples, logs, or documentation.

For non-interactive environments, credentials may be supplied through uncommitted `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` environment variables.

## Deployment Flow

1. Run `npx supabase login` once on the machine.
2. Run `npm run db:link` once for this checkout.
3. Run `npm run db:push:dry` and inspect the pending migration list.
4. Run `npm run db:push` to apply the migration.
5. Query the REST endpoint with the publishable key to verify `public.customers` is available.
6. Use the same dry-run and push scripts for future migration files.

## Error Handling

- Stop before pushing if CLI login or database authentication fails.
- Never bypass a failed dry run.
- If remote and local migration histories differ, inspect `supabase migration list` before using migration repair.
- Do not reset the linked remote database.

## Verification

- Confirm the CLI version runs through the installed local binary.
- Confirm package scripts point to the linked-project commands.
- Confirm the dry run lists `202607140001_customer_data.sql` before the first push.
- Confirm the push succeeds and a second dry run reports no pending migrations.
- Confirm `customers`, `customer_addresses`, and `customer_orders` exist remotely.
