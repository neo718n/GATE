import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth as authLib } from "@/lib/auth";
import { headers } from "next/headers";
import { r2, BUCKET } from "@/lib/r2";
import { randomUUID } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_ROLES = ["admin", "super_admin", "question_provider"];

export async function POST(req: NextRequest) {
  const session = await authLib.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role ?? "participant";
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { ok } = checkRateLimit(`qimg:${session.user.id}`, 30, 60 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });

  const { mimeType, size } = await req.json();

  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    return NextResponse.json({ error: "Only images allowed (jpg, png, webp, gif, svg)" }, { status: 400 });
  }
  if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  }

  const key = `questions/images/${randomUUID()}.${ext}`;

  try {
    const presignedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: mimeType,
        ContentLength: size,
      }),
      { expiresIn: 300 },
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ presignedUrl, publicUrl, key });
  } catch {
    return NextResponse.json({ error: "Storage service unavailable" }, { status: 503 });
  }
}
