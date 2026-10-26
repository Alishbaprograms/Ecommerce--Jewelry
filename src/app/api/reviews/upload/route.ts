import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 4 * 1024 * 1024;

// Lets a parent attach a photo to a review. Public, so it is size-limited and rate-limited.
export async function POST(request: NextRequest) {
  if (!rateLimit(`review-upload:${clientIp(request.headers)}`, 6, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many photos. Please try again later." }, { status: 429 });
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Photo upload isn't available right now." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please choose a photo." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That photo is too big (max 4 MB)." }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "zohrae/reviews", resource_type: "image" }, (err, res) =>
          err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res)
        )
        .end(buffer);
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("[POST /api/reviews/upload]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
