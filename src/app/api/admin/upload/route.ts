import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { cloudinary, cloudinaryMessage, cloudinaryReady } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!cloudinaryReady) {
    return NextResponse.json({ error: "Image storage (Cloudinary) is not configured on the server." }, { status: 500 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "zohrae/products", resource_type: "image" }, (err, res) =>
          err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res)
        )
        .end(buffer);
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("[POST /api/admin/upload]", error);
    // Only the signed-in admin sees this, so showing Cloudinary's own reason (e.g. "Invalid cloud_name") is safe and helpful.
    return NextResponse.json({ error: `Cloudinary said: ${cloudinaryMessage(error)}` }, { status: 500 });
  }
}
