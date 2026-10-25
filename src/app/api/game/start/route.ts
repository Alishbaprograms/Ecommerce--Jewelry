import { NextResponse } from "next/server";
import { createGameToken, hasGameSecret } from "@/lib/game-token";

export async function POST() {
  if (!hasGameSecret()) return NextResponse.json({ error: "Rewards are unavailable" }, { status: 503 });
  return NextResponse.json({ token: createGameToken() });
}
