import { config } from "dotenv";
import { resolve, extname } from "path";
import { readdir, readFile, stat } from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

const SOURCE = "C:/Users/nurbe/Pictures/china_Onsite";
const KEY_PREFIX = "marketing/china-camp";

const LARGE_PHOTO_MAP: Record<number, string> = {
  17753498: "campus-1",
  13331145: "campus-2",
};

async function main() {
  const sharp = (await import("sharp")).default;
  const { r2, BUCKET } = await import("../lib/r2");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  const files = await readdir(SOURCE);
  const images = files.filter((f) => [".jpg", ".jpeg"].includes(extname(f).toLowerCase()));

  for (const filename of images) {
    const filePath = resolve(SOURCE, filename);
    const stats = await stat(filePath);
    const mappedName = LARGE_PHOTO_MAP[stats.size];

    if (!mappedName) continue;

    const original = await readFile(filePath);

    const compressed = await sharp(original)
      .resize({ width: 2400, withoutEnlargement: true, fit: "inside" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    const key = `${KEY_PREFIX}/${mappedName}.jpg`;
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: compressed,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const ratio = ((compressed.length / original.length) * 100).toFixed(1);
    console.log(
      `  ✓ ${mappedName}.jpg  ${(original.length / 1024 / 1024).toFixed(2)} MB → ${(compressed.length / 1024 / 1024).toFixed(2)} MB (${ratio}%)`,
    );
  }

  console.log("\nDone. Note: R2 cache is immutable — purge CDN cache if URLs are already cached client-side.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});