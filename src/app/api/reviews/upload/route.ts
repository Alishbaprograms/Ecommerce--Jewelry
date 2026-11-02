import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { ImageError, saveImage } from "@/lib/image-store";

const MAX_BYTES = 4 * 1024 * 1024;

// Lets a parent attach a photo to a review. Public, so it is size-limited and rate-limited.
export async function POST(request: NextRequest) {
  if (!rateLimit(`review-upload:${clientIp(request.headers)}`, 6, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many photos. Please try again later." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please choose a photo." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That photo is too big (max 4 MB)." }, { status: 400 });

  try {
    const url = await saveImage(Buffer.from(await file.arrayBuffer()), "review");
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof ImageError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[POST /api/reviews/upload]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
