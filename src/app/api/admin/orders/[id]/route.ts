import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
      user: { select: { name: true, email: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: JSON.parse(JSON.stringify(order)) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as Status;
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ops = [];
  // COD: money is collected on delivery, so that is when the order counts as paid.
  const patch: Record<string, unknown> = { status };
  if (status === "SHIPPED") patch.shippedAt = new Date();
  if (status === "DELIVERED") {
    patch.deliveredAt = new Date();
    patch.paymentStatus = "PAID";
  }
  ops.push(db.order.update({ where: { id }, data: patch }));
  ops.push(db.orderStatusHistory.create({ data: { orderId: id, status } }));
  // Cancelling puts the items back on the shelf (only once).
  if (status === "CANCELLED" && order.status !== "CANCELLED") {
    for (const item of order.items) {
      ops.push(db.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } }));
    }
  }
  await db.$transaction(ops);
  return NextResponse.json({ success: true });
}
