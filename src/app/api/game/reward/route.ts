import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { readGameToken } from "@/lib/game-token";
import { COUPON_VALID_DAYS, MAX_POSSIBLE_CATCHES, ROUND_SECONDS, tierFor } from "@/lib/shop-config";

const COOKIE = "zohrae_reward";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alike characters (0/O, 1/I)

function newCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `ZOH-${s}`;
}

type Saved = { code: string; discount: number; minSpend: number; expiresAt: string; tier: string };

// Issues a one-time coupon for a finished round. The score comes from the browser, so it is sanity-checked:
// signed start token, enough time elapsed, a possible score, one use per round, one reward per device per day.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const score = Number(body.score);
  const info = typeof body.token === "string" ? readGameToken(body.token) : null;

  if (!info || !Number.isInteger(score) || score < 0) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }
  const elapsed = (Date.now() - info.startedAt) / 1000;
  if (elapsed < ROUND_SECONDS - 3 || elapsed > 60 * 30 || score > MAX_POSSIBLE_CATCHES) {
    return NextResponse.json({ error: "That game couldn't be verified." }, { status: 400 });
  }
  const tier = tierFor(score);
  if (!tier) return NextResponse.json({ error: "Not enough gems for a reward." }, { status: 400 });

  const store = await cookies();
  const prev = store.get(COOKIE)?.value;
  if (prev) {
    try {
      const saved: Saved = JSON.parse(prev);
      if (new Date(saved.expiresAt) > new Date()) {
        return NextResponse.json({ error: "You already won a code. Use it, then come back for more!", existing: saved }, { status: 429 });
      }
    } catch {}
  }

  const nonce = `game:${info.nonce}`;
  if (await db.coupon.findFirst({ where: { description: nonce } })) {
    return NextResponse.json({ error: "That round was already claimed." }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + COUPON_VALID_DAYS * 86400_000);
  const coupon = await db.coupon.create({
    data: {
      code: newCode(),
      description: nonce,
      type: "FIXED",
      value: tier.discount,
      minimumAmount: tier.minSpend,
      usageLimit: 1,
      expiresAt,
    },
  });

  const saved: Saved = {
    code: coupon.code,
    discount: tier.discount,
    minSpend: tier.minSpend,
    expiresAt: expiresAt.toISOString(),
    tier: tier.name,
  };
  const res = NextResponse.json(saved);
  res.cookies.set(COOKIE, JSON.stringify(saved), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
