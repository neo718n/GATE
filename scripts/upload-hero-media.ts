import { config } from "dotenv";
import { resolve, extname } from "path";
import { readdir, readFile } from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

/**
 * Uploads the encoded hero set (720p clip, 540p clip, poster frame) produced
 * from the raw on-site footage. Re-run after re-encoding to refresh R2.
 */
const SOURCE = process.argv[2];
const KEY_PREFIX = "marketing/hangzhou-hero";

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
};

async function main() {
  if (!SOURCE) {
    console.error("Usage: tsx scripts/upload-hero-media.ts <folder>");
    process.exit(1);
  }
  if (!process.env.R2_PUBLIC_URL) {
    console.error("R2_PUBLIC_URL is not set in .env.local");
    process.exit(1);
  }

  const { r2, BUCKET } = await import("../lib/r2");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");

  const files = (await readdir(SOURCE))
    .filter((f) => MIME[extname(f).toLowerCase()])
    .sort();

  console.log(`Uploading ${files.length} file(s) to ${BUCKET}/${KEY_PREFIX}\n`);
  let bytes = 0;

  for (const filename of files) {
    const key = `${KEY_PREFIX}/${filename}`;
    const body = await readFile(resolve(SOURCE, filename));
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: MIME[extname(filename).toLowerCase()],
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    bytes += body.length;
    console.log(`  ✓ ${filename} (${Math.round(body.length / 1024)}KB)`);
  }

  console.log(`\nDone — ${Math.round(bytes / 1024 / 1024)}MB uploaded to ${publicUrl}/${KEY_PREFIX}/`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
