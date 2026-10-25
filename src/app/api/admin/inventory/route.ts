import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const filter = searchParams.get("filter") ?? "all";

  const where: Record<string, unknown> = { deletedAt: null, isActive: true };

  if (filter === "low") where.AND = [{ stock: { gt: 0 } }, { stock: { lte: 5 } }];
  if (filter === "out") where.stock = 0;
  if (search) {
    where.OR = [
      { sku: { contains: search, mode: "insensitive" } },
      { product: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [variants, total, low, out] = await Promise.all([
    db.productVariant.findMany({
      where,
      orderBy: { stock: "asc" },
      take: 100,
      include: { product: { select: { id: true, name: true } } },
    }),
    db.productVariant.count({ where: { deletedAt: null, isActive: true } }),
    db.productVariant.count({ where: { deletedAt: null, isActive: true, stock: { gt: 0, lte: 5 } } }),
    db.productVariant.count({ where: { deletedAt: null, isActive: true, stock: 0 } }),
  ]);

  return NextResponse.json({
    variants: JSON.parse(JSON.stringify(variants, (_, v) =>
      typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
    )),
    stats: { total, low, out },
  });
}
