import { config } from "dotenv";
import { resolve, extname } from "path";
import { readdir, readFile, stat } from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

const VIDEO_SOURCE = resolve(process.cwd(), "GATE_summer_2026_media/hangzhou_footages");
const PHOTO_SOURCE = resolve(process.cwd(), "GATE_summer_2026_media/media");
const VIDEO_PREFIX = "marketing/hangzhou-hero";
const PHOTO_PREFIX = "marketing/hangzhou-gallery";

const VIDEO_MIME: Record<string, string> = { ".mp4": "video/mp4" };
const PHOTO_MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

async function main() {
  if (!process.env.R2_PUBLIC_URL) {
    console.error("R2_PUBLIC_URL is not set in .env.local");
    process.exit(1);
  }

  const { r2, BUCKET } = await import("../lib/r2");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");

  const videoResults: { key: string; url: string; bytes: number }[] = [];
  const videoFiles = (await readdir(VIDEO_SOURCE))
    .filter((f) => VIDEO_MIME[extname(f).toLowerCase()])
    .sort();

  console.log(`Found ${videoFiles.length} hero video(s) in ${VIDEO_SOURCE}`);
  for (let i = 0; i < videoFiles.length; i++) {
    const filename = videoFiles[i]!;
    const filePath = resolve(VIDEO_SOURCE, filename);
    const stats = await stat(filePath);
    const key = `${VIDEO_PREFIX}/hero-${String(i + 1).padStart(2, "0")}.mp4`;
    const body = await readFile(filePath);

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: "video/mp4",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const url = `${publicUrl}/${key}`;
    videoResults.push({ key, url, bytes: stats.size });
    console.log(`  video ✓ ${filename} (${(stats.size / 1024 / 1024).toFixed(1)}MB) → ${key}`);
  }

  const photoResults: { key: string; url: string; bytes: number }[] = [];
  const photoFiles = (await readdir(PHOTO_SOURCE))
    .filter((f) => PHOTO_MIME[extname(f).toLowerCase()])
    .sort();

  console.log(`\nFound ${photoFiles.length} gallery photo(s) in ${PHOTO_SOURCE}`);
  for (let i = 0; i < photoFiles.length; i++) {
    const filename = photoFiles[i]!;
    const filePath = resolve(PHOTO_SOURCE, filename);
    const stats = await stat(filePath);
    const ext = extname(filename).toLowerCase() === ".jpeg" ? ".jpg" : extname(filename).toLowerCase();
    const key = `${PHOTO_PREFIX}/moment-${String(i + 1).padStart(2, "0")}${ext}`;
    const body = await readFile(filePath);

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: PHOTO_MIME[extname(filename).toLowerCase()],
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const url = `${publicUrl}/${key}`;
    photoResults.push({ key, url, bytes: stats.size });
    console.log(`  photo ✓ ${filename} (${(stats.size / 1024 / 1024).toFixed(1)}MB) → ${key}`);
  }

  console.log("\n─── lib/marketing/hangzhou-media.ts snippet ───\n");
  console.log("export const HERO_VIDEOS: string[] = [");
  for (const v of videoResults) console.log(`  "${v.url}",`);
  console.log("];\n");
  console.log("export const GALLERY_PHOTOS: string[] = [");
  for (const p of photoResults) console.log(`  "${p.url}",`);
  console.log("];");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
