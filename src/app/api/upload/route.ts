import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/server/auth/current-user";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET ?? "qasr-media";

  if (!accountId || !accessKey || !secretKey) {
    // R2 not configured — return a local-storage fallback path for development
    const body = await request.json().catch(() => ({}));
    const filename = (body as { filename?: string }).filename ?? "upload.jpg";
    return NextResponse.json({
      uploadUrl: null,
      r2Key: `products/${Date.now()}-${filename}`,
      note: "R2 not configured. Set CLOUDFLARE_R2_* env vars for real uploads.",
    });
  }

  const body = await request.json();
  const { filename, contentType, productId } = body as {
    filename: string;
    contentType: string;
    productId: string;
  };

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
  }

  const r2Key = `products/${productId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  // Generate presigned PUT URL via AWS S3-compatible SDK approach
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3").catch(() => {
    throw new Error("@aws-sdk/client-s3 not installed");
  });
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: r2Key,
    ContentType: contentType,
    ContentLength: MAX_SIZE_BYTES,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return NextResponse.json({ uploadUrl, r2Key });
}
