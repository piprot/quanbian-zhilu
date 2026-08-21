import pg from "pg";

const { Pool } = pg;

export const dbEnabled = Boolean(process.env.DATABASE_URL);

let pool;
if (dbEnabled) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "false"
        ? false
        : { rejectUnauthorized: false }
  });
}

export async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      token TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      save JSONB NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      score_sig TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS score_sig TEXT NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS recovery_code TEXT
  `);
  await pool.query(`
    ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS username TEXT
  `);
  await pool.query(`
    ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS password_hash TEXT
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      token TEXT PRIMARY KEY,
      revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

export async function dbHealth() {
  if (!pool) return false;
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function listAccounts(limit = 200) {
  if (!pool) return [];
  const { rows } = await pool.query(
    `SELECT name, role, save, score, updated_at
     FROM accounts
     ORDER BY updated_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((row) => ({
    name: row.name,
    role: row.role,
    save: row.save,
    score: row.score,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined
  }));
}

export async function upsertAccount(
  token,
  name,
  role,
  save,
  score,
  scoreSig,
  recoveryCode,
  username,
  passwordHash
) {
  if (!pool) return null;
  const result = await pool.query(
    `
      INSERT INTO accounts (token, name, role, save, score, score_sig, recovery_code, username, password_hash, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, now())
      ON CONFLICT (token)
      DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, save = EXCLUDED.save, score = EXCLUDED.score, score_sig = EXCLUDED.score_sig, recovery_code = EXCLUDED.recovery_code, username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, updated_at = now()
      RETURNING token, name, role, save, score, score_sig, recovery_code, username, password_hash, updated_at
    `,
    [token, name, role, JSON.stringify(save), score, scoreSig, recoveryCode, username, passwordHash]
  );
  return result.rows[0] || null;
}

export async function getAccount(token) {
  if (!pool) return null;
  const result = await pool.query(
    `SELECT token, name, role, save, score, score_sig, recovery_code, updated_at FROM accounts WHERE token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

export async function getAccountByRecovery(code) {
  if (!pool) return null;
  const result = await pool.query(
    `SELECT token, name, role, save, score, score_sig, recovery_code, updated_at FROM accounts WHERE recovery_code = $1 LIMIT 1`,
    [code]
  );
  return result.rows[0] || null;
}

export async function getAccountByUsername(username) {
  if (!pool) return null;
  const result = await pool.query(
    `SELECT token, name, role, save, score, score_sig, recovery_code, username, password_hash, updated_at FROM accounts WHERE username = $1 LIMIT 1`,
    [username]
  );
  return result.rows[0] || null;
}

export async function leaderboard(limit = 50) {
  if (!pool) return [];
  const result = await pool.query(
    `
      SELECT name, role, save, score, score_sig, updated_at
      FROM accounts
      LIMIT 500
    `,
    []
  );
  const rows = result.rows
    .map((row) => ({
      name: row.name,
      role: row.role,
      score: Number(row.score ?? 0),
      signature: row.score_sig || "",
      updatedAt: row.updated_at,
      save: row.save
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return rows.map((row, index) => ({
    ...row,
    percentile: Math.round(((rows.length - index - 1) / rows.length) * 100)
  }));
}

export async function revokeToken(token) {
  if (!pool) return;
  await pool.query(
    `
      INSERT INTO revoked_tokens (token, revoked_at)
      VALUES ($1, now())
      ON CONFLICT (token) DO NOTHING
    `,
    [token]
  );
}

export async function isTokenRevoked(token) {
  if (!pool) return false;
  const result = await pool.query(
    `SELECT 1 FROM revoked_tokens WHERE token = $1 LIMIT 1`,
    [token]
  );
  return result.rowCount > 0;
}

function abilityLevel(exp) {
  const thresholds = [0, 4, 10, 18, 28, 40];
  let level = 1;
  for (const threshold of thresholds.slice(1)) {
    if (exp >= threshold) level += 1;
    else break;
  }
  return Math.min(6, level);
}
