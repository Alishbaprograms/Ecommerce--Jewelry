import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getInsights } from "@/lib/insights";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const range = new URL(request.url).searchParams.get("range") ?? "7";
  return NextResponse.json(await getInsights(["1", "7", "30"].includes(range) ? range : "7"));
}
