CREATE TABLE IF NOT EXISTS accounts (
  token TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  save JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  score_sig TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accounts_updated_at_idx
  ON accounts (updated_at DESC);
