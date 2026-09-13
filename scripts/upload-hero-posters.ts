import { config } from "dotenv";
import { resolve } from "path";
import { readdir, readFile } from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

// Poster frames are grabbed from the hero clips with a browser canvas (no
// ffmpeg in this environment) and dropped in this folder before upload.
const SOURCE = process.argv[2];
const KEY_PREFIX = "marketing/hangzhou-hero";

async function main() {
  if (!SOURCE) {
    console.error("Usage: tsx scripts/upload-hero-posters.ts <folder-with-poster-*.jpg>");
    process.exit(1);
  }
  if (!process.env.R2_PUBLIC_URL) {
    console.error("R2_PUBLIC_URL is not set in .env.local");
    process.exit(1);
  }

  const { r2, BUCKET } = await import("../lib/r2");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");

  const files = (await readdir(SOURCE)).filter((f) => /^poster-\d+\.jpg$/.test(f)).sort();
  console.log(`Uploading ${files.length} poster(s) to ${BUCKET}/${KEY_PREFIX}\n`);

  for (const filename of files) {
    const key = `${KEY_PREFIX}/${filename}`;
    const body = await readFile(resolve(SOURCE, filename));
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    console.log(`  ✓ ${filename} (${Math.round(body.length / 1024)}KB) → ${publicUrl}/${key}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
