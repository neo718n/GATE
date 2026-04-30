import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { r2, BUCKET } from "@/lib/r2";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_DOC_TYPES = ["identity", "photo", "certificate", "invoice", "cv", "other"] as const;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { mimeType, size } = body;
  const rawDocType = typeof body.docType === "string" ? body.docType : "other";

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
    return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
  }
  if (!(ALLOWED_DOC_TYPES as readonly string[]).includes(rawDocType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const ext = MIME_TO_EXT[mimeType] ?? "bin";
  const key = `${session.user.id}/${rawDocType}/${randomUUID()}.${ext}`;

  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimeType,
      ContentLength: size,
    }),
    { expiresIn: 300 },
  );

  return NextResponse.json({ url, key });
}
