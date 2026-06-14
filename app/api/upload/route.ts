import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const signatureBase = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(signatureBase + apiSecret).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const cloudName = getRequiredEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = getRequiredEnv("CLOUDINARY_API_KEY");
    const apiSecret = getRequiredEnv("CLOUDINARY_API_SECRET");
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "insighthub/posts";
    const params = { folder, timestamp };
    const signature = signCloudinaryParams(params, apiSecret);

    const uploadForm = new FormData();
    uploadForm.set("file", file);
    uploadForm.set("api_key", apiKey);
    uploadForm.set("timestamp", String(timestamp));
    uploadForm.set("folder", folder);
    uploadForm.set("signature", signature);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json(
        { ok: false, error: uploadData?.error?.message ?? "Cloudinary upload failed" },
        { status: uploadRes.status },
      );
    }

    return NextResponse.json({
      ok: true,
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      width: uploadData.width,
      height: uploadData.height,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
