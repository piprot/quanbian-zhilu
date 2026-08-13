import { createHmac, timingSafeEqual } from "node:crypto";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("Production requires JWT_SECRET");
}

const secret = process.env.JWT_SECRET || "dev-only-secret-change-me";
const MAX_AGE_MS = Number(
  process.env.TOKEN_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000
);

export function createToken(name, role) {
  const payload = Buffer.from(
    JSON.stringify({ name, role, iat: Date.now() })
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (parsed.iat && Date.now() - Number(parsed.iat) > MAX_AGE_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createScoreSignature(score, name, role, updatedAt) {
  const payload = JSON.stringify({ score, name, role, updatedAt });
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function hashRecovery(code) {
  return createHmac("sha256", secret)
    .update(`recovery:${String(code || "")}`)
    .digest("hex");
}

export function hashPassword(password) {
  return createHmac("sha256", secret)
    .update(`password:${String(password || "")}`)
    .digest("hex");
}
