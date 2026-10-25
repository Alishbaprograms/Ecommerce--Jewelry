import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const page = parseInt(searchParams.get("page") ?? "1");

  const where: Record<string, unknown> = { role: "CUSTOMER", deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        loyaltyPoints: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          where: { deletedAt: null, paymentStatus: "PAID" },
          select: { total: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    customers: JSON.parse(JSON.stringify(customers, (_, v) =>
      typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
    )),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
