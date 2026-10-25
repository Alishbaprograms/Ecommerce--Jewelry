import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { stock } = await req.json();

  const variant = await db.productVariant.update({
    where: { id },
    data: { stock: Math.max(0, parseInt(stock)) },
  });

  await db.inventoryLog.create({
    data: {
      variantId: id,
      type: "ADJUSTMENT",
      quantity: parseInt(stock),
      reason: "Manual adjustment by admin",
    },
  });

  return NextResponse.json({ variant });
}
