import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EVENT_NAMES } from "@/lib/events";

// Best-effort flood guard (per server instance): at most 120 events a minute per IP.
const hits = new Map<string, { count: number; reset: number }>();

function allowed(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  h.count += 1;
  return h.count <= 120;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowed(ip)) return new NextResponse(null, { status: 204 });

  const body = await request.json().catch(() => null);
  const name = body?.name;
  const sessionId = body?.sessionId;
  if (!EVENT_NAMES.includes(name) || typeof sessionId !== "string" || sessionId.length < 4 || sessionId.length > 64) {
    return new NextResponse(null, { status: 204 });
  }

  // Keep props small and simple: a few short strings, numbers or booleans.
  const props: Record<string, string | number | boolean> = {};
  if (body.props && typeof body.props === "object") {
    for (const [k, v] of Object.entries(body.props).slice(0, 8)) {
      if (typeof v === "number" || typeof v === "boolean") props[k.slice(0, 24)] = v;
      else if (typeof v === "string") props[k.slice(0, 24)] = v.slice(0, 60);
    }
  }

  try {
    await db.analyticsEvent.create({ data: { name, sessionId, props: Object.keys(props).length ? props : undefined } });
  } catch (e) {
    console.error("[POST /api/track]", e);
  }
  return new NextResponse(null, { status: 204 });
}
