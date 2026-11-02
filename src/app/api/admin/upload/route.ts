import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { ImageError, saveImage } from "@/lib/image-store";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
  }

  try {
    const url = await saveImage(Buffer.from(await file.arrayBuffer()), "product", file.type);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof ImageError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[POST /api/admin/upload]", error);
    // Only the signed-in admin sees this, so the real reason is shown to make problems easy to report.
    const reason = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: `Upload failed: ${reason}` }, { status: 500 });
  }
}
