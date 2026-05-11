import { config } from "dotenv";
import { resolve, extname, basename } from "path";
import { readdir, readFile } from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function main() {
  const folderArg = process.argv[2];
  const keyPrefixArg = process.argv[3] ?? "marketing/china-camp";

  if (!folderArg) {
    console.error("Usage: tsx scripts/upload-marketing-photos.ts <folder> [keyPrefix]");
    console.error("Example: tsx scripts/upload-marketing-photos.ts ./marketing-photos/china-camp marketing/china-camp");
    process.exit(1);
  }

  if (!process.env.R2_PUBLIC_URL) {
    console.error("R2_PUBLIC_URL is not set in .env.local — required for public image URLs.");
    process.exit(1);
  }

  const folder = resolve(folderArg);
  const { r2, BUCKET } = await import("../lib/r2");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  const entries = await readdir(folder);
  const images = entries
    .filter((f) => MIME[extname(f).toLowerCase()])
    .sort();

  if (images.length === 0) {
    console.error(`No images found in ${folder}`);
    process.exit(1);
  }

  console.log(`\nUploading ${images.length} image(s) from ${folder}`);
  console.log(`Target: R2 bucket "${BUCKET}", prefix "${keyPrefixArg}"\n`);

  const results: { file: string; key: string; url: string }[] = [];

  for (const filename of images) {
    const filePath = resolve(folder, filename);
    const body = await readFile(filePath);
    const ext = extname(filename).toLowerCase();
    const key = `${keyPrefixArg}/${basename(filename)}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: MIME[ext],
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const url = `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
    results.push({ file: filename, key, url });
    console.log(`  ✓ ${filename}  →  ${key}`);
  }

  console.log("\n─── URLs ───");
  for (const r of results) {
    console.log(r.url);
  }

  console.log("\n─── TypeScript snippet (paste into landing page) ───\n");
  console.log("const CHINA_CAMP_PHOTOS = [");
  for (const r of results) {
    console.log(`  { src: "${r.url}", alt: "${basename(r.file, extname(r.file))}" },`);
  }
  console.log("];");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});