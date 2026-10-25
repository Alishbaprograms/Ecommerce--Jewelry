import { createHmac, randomBytes, timingSafeEqual } from "crypto";

function secret() {
  return process.env.BETTER_AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(`game:${value}`).digest("hex");
}

export function hasGameSecret() {
  return Boolean(secret());
}

/** A token proving a game round was started at a given time. The reward endpoint checks how long ago. */
export function createGameToken() {
  const nonce = randomBytes(8).toString("hex");
  const payload = `${nonce}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function readGameToken(token: string): { nonce: string; startedAt: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [nonce, ts, sig] = parts;
  const expected = sign(`${nonce}.${ts}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { nonce, startedAt: Number(ts) };
}
