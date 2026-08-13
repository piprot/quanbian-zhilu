# Database Operations

The server supports two storage modes:

- Memory JSON file (`DATA_DIR`, default `server/data/store.json`) when `DATABASE_URL` is absent.
- PostgreSQL when `DATABASE_URL` is present. Production requires `DATABASE_URL`.

## Migrations

The initial schema is checked in at:

```text
server/migrations/001_accounts.sql
```

`server/db.mjs` also runs idempotent `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` statements at startup, so an empty database is safe on first deploy.

Apply the migration manually if you prefer to manage schema separately:

```bash
psql "$DATABASE_URL" -f server/migrations/001_accounts.sql
```

## Backup

Use PostgreSQL's built-in tools. Railway exposes the database through the same `DATABASE_URL` used by the app.

```bash
# Plain SQL dump
pg_dump "$DATABASE_URL" -f adaptive-ascent-$(date +%Y%m%d).sql

# Restore
psql "$DATABASE_URL" -f adaptive-ascent-YYYYMMDD.sql
```

Suggested schedule: daily full dump, keep 7 daily + 4 weekly copies. Test restore at least monthly.

## Token revocation

`logout` writes the token to both the in-memory `revokedTokens` set and the `revoked_tokens` table when PostgreSQL is enabled, so revocation survives server restarts. `resolveAccount` checks both sources before returning an account.
