import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { recomputeProductRating } from "@/lib/reviews";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (["PENDING", "APPROVED", "REJECTED"].includes(body.status)) data.status = body.status;
  if ("adminReply" in body) data.adminReply = body.adminReply ? String(body.adminReply).slice(0, 500) : null;
  if (typeof body.isPinned === "boolean") data.isPinned = body.isPinned;

  const review = await db.review.update({ where: { id }, data });
  await recomputeProductRating(review.productId);
  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const review = await db.review.update({ where: { id }, data: { deletedAt: new Date() } });
  await recomputeProductRating(review.productId);
  return NextResponse.json({ success: true });
}
