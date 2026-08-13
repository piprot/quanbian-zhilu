CREATE TABLE IF NOT EXISTS accounts (
  token TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  save JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  score_sig TEXT NOT NULL DEFAULT '',
  recovery_code TEXT,
  username TEXT,
  password_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accounts_updated_at_idx
  ON accounts (updated_at DESC);

CREATE INDEX IF NOT EXISTS accounts_username_idx
  ON accounts (username);

CREATE TABLE IF NOT EXISTS revoked_tokens (
  token TEXT PRIMARY KEY,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
