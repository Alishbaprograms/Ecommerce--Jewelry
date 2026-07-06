import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      shippingAddress: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    order: JSON.parse(JSON.stringify(order, (_, v) =>
      typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v
    )),
  });
}
