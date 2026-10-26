// Best-effort per-server limiter for public forms (resets when the server restarts).
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= max;
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
