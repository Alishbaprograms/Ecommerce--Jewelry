import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status") ?? "PENDING";
  const where = { deletedAt: null, ...(["PENDING", "APPROVED", "REJECTED"].includes(status) ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}) };

  const [reviews, counts] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: { select: { name: true, slug: true } } },
    }),
    db.review.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
  ]);

  return NextResponse.json({
    reviews: JSON.parse(JSON.stringify(reviews)),
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count])),
  });
}
