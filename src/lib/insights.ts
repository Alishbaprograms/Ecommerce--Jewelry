import { db } from "@/lib/db";
import { BEADS } from "@/lib/bracelet";
import { REWARD_TIERS } from "@/lib/shop-config";

const PKT_OFFSET_MS = 5 * 3600_000; // Pakistan time (UTC+5, no daylight saving)

/** Midnight at the start of today in Pakistan, as a UTC Date. */
export function startOfPktDay(now = new Date()) {
  const local = new Date(now.getTime() + PKT_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - PKT_OFFSET_MS);
}

export function rangeStart(range: string) {
  if (range === "1") return startOfPktDay();
  const days = range === "30" ? 30 : 7;
  return new Date(Date.now() - days * 86400_000);
}

const pktHour = (d: Date) => new Date(d.getTime() + PKT_OFFSET_MS).getUTCHours();

type Ev = { name: string; sessionId: string; props: unknown; createdAt: Date };
const prop = (e: Ev, k: string) => (e.props && typeof e.props === "object" ? (e.props as Record<string, unknown>)[k] : undefined);

export async function getInsights(range: string) {
  const since = rangeStart(range);
  const events: Ev[] = await db.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { name: true, sessionId: true, props: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 50000,
  });
  const first = await db.analyticsEvent.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } });

  const by = (name: string) => events.filter((e) => e.name === name);
  const count = (name: string) => by(name).length;
  const sessions = (name: string) => new Set(by(name).map((e) => e.sessionId)).size;

  // ── Catch the Jewels ──
  const starts = by("game_start");
  const ends = by("game_end");
  const scores = ends.map((e) => Number(prop(e, "score")) || 0);
  const [gold, silver, bronze] = REWARD_TIERS.map((t) => t.minCatches);
  const tierCounts = {
    none: scores.filter((s) => s < bronze).length,
    bronze: scores.filter((s) => s >= bronze && s < silver).length,
    silver: scores.filter((s) => s >= silver && s < gold).length,
    gold: scores.filter((s) => s >= gold).length,
  };
  const hours = Array.from({ length: 24 }, () => 0);
  for (const e of starts) hours[pktHour(e.createdAt)] += 1;
  const players = new Set(starts.map((e) => e.sessionId)).size;

  const coupons = await db.coupon.findMany({
    where: { description: { startsWith: "game:" }, createdAt: { gte: since } },
    select: { id: true, usageCount: true },
  });
  const usedIds = coupons.filter((c) => c.usageCount > 0).map((c) => c.id);
  const couponOrders = usedIds.length
    ? await db.order.aggregate({
        where: { couponId: { in: usedIds }, status: { not: "CANCELLED" }, deletedAt: null },
        _sum: { total: true, discountAmount: true },
        _count: true,
      })
    : null;

  // ── Bracelet designer ──
  const done = by("bracelet_done");
  const colourCounts = new Map<string, number>();
  let beadTotal = 0;
  for (const e of done) {
    const beads = String(prop(e, "beads") ?? "");
    beadTotal += beads.length;
    for (const ch of beads) colourCounts.set(ch, (colourCounts.get(ch) ?? 0) + 1);
  }
  const colours = BEADS.map((b) => ({ name: b.label, color: b.color, count: colourCounts.get(b.code) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // ── Attention ──
  const wa: Record<string, number> = {};
  for (const e of by("whatsapp_click")) {
    const w = String(prop(e, "where") ?? "other");
    wa[w] = (wa[w] ?? 0) + 1;
  }
  const tileMap = new Map<string, number>();
  for (const e of by("category_tile_click")) {
    const s = String(prop(e, "slug") ?? "?");
    tileMap.set(s, (tileMap.get(s) ?? 0) + 1);
  }

  // ── Funnel ──
  const orders = await db.order.count({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" }, deletedAt: null } });

  return {
    since: since.toISOString(),
    trackingStartedAt: first?.createdAt.toISOString() ?? null,
    games: {
      started: starts.length,
      finished: ends.length,
      finishRate: starts.length ? Math.round((ends.length / starts.length) * 100) : 0,
      players,
      replaysPerPlayer: players ? Math.round((starts.length / players) * 10) / 10 : 0,
      avgScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      tiers: tierCounts,
      thresholds: { bronze, silver, gold },
      hours,
      codes: {
        issued: coupons.length,
        used: usedIds.length,
        redemptionRate: coupons.length ? Math.round((usedIds.length / coupons.length) * 100) : 0,
        orders: couponOrders?._count ?? 0,
        revenue: Number(couponOrders?._sum.total ?? 0),
        discountGiven: Number(couponOrders?._sum.discountAmount ?? 0),
      },
    },
    bracelet: {
      hintShown: count("bracelet_hint_shown"),
      opened: count("bracelet_open"),
      done: done.length,
      whatsapp: count("bracelet_whatsapp"),
      ask: count("bracelet_ask"),
      shop: count("bracelet_shop"),
      copy: count("bracelet_copy"),
      avgBeads: done.length ? Math.round((beadTotal / done.length) * 10) / 10 : 0,
      colours,
    },
    attention: {
      chestHintShown: count("chest_hint_shown"),
      chestClicks: count("chest_click"),
      chestClicksFromHint: by("chest_click").filter((e) => prop(e, "hint") === true).length,
      braceletHintShown: count("bracelet_hint_shown"),
      braceletOpens: count("bracelet_open"),
      braceletOpensFromHint: by("bracelet_open").filter((e) => prop(e, "hint") === true).length,
      whatsapp: wa,
      tiles: [...tileMap.entries()].map(([slug, n]) => ({ slug, count: n })).sort((a, b) => b.count - a.count),
    },
    funnel: {
      visits: sessions("visit"),
      viewedProduct: sessions("product_view"),
      addedToCart: sessions("add_to_cart"),
      startedCheckout: sessions("checkout_start"),
      orders,
    },
  };
}

export type Insights = Awaited<ReturnType<typeof getInsights>>;
