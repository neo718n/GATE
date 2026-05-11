import { config } from "dotenv";
import { resolve, extname } from "path";
import { readdir, readFile, stat } from "fs/promises";

config({ path: resolve(process.cwd(), ".env.local") });

const SOURCE = "C:/Users/nurbe/Pictures/china_Onsite";
const KEY_PREFIX = "marketing/china-camp";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const SIZE_MAP: Record<number, string> = {
  956503: "classroom-1",
  636952: "classroom-2",
  609612: "classroom-3",
  762260: "classroom-4",
  509051: "classroom-5",
  307406: "dorm-facility-1",
  157609: "dorm-facility-2",
  237535: "dormitory-room",
  17753498: "campus-1",
  13331145: "campus-2",
  792712: "lecture-hall-1",
  855954: "lecture-hall-2",
  787547: "lecture-hall-3",
  567930: "computer-lab-1",
  498540: "computer-lab-2",
  486838: "laundry",
  4682137: "canteen-1",
  4523902: "canteen-2",
};

async function main() {
  if (!process.env.R2_PUBLIC_URL) {
    console.error("R2_PUBLIC_URL is not set in .env.local");
    process.exit(1);
  }

  const { r2, BUCKET } = await import("../lib/r2");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  const files = await readdir(SOURCE);
  const images = files.filter((f) => MIME[extname(f).toLowerCase()]);

  console.log(`Found ${images.length} image(s) in ${SOURCE}`);
  console.log(`Target: R2 bucket "${BUCKET}", prefix "${KEY_PREFIX}"\n`);

  const results: { size: number; key: string; url: string }[] = [];

  for (const filename of images) {
    const filePath = resolve(SOURCE, filename);
    const stats = await stat(filePath);
    const mappedName = SIZE_MAP[stats.size];

    if (!mappedName) {
      console.log(`  ⚠ skip (no size map for ${stats.size} bytes): ${filename}`);
      continue;
    }

    const ext = extname(filename).toLowerCase() === ".jpeg" ? ".jpg" : extname(filename).toLowerCase();
    const cleanKey = `${KEY_PREFIX}/${mappedName}${ext}`;
    const body = await readFile(filePath);

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: cleanKey,
        Body: body,
        ContentType: MIME[extname(filename).toLowerCase()],
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const url = `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${cleanKey}`;
    results.push({ size: stats.size, key: cleanKey, url });
    console.log(`  ✓ ${stats.size.toString().padStart(9)} bytes  →  ${mappedName}${ext}`);
  }

  console.log(`\nUploaded ${results.length}/${images.length} images.\n`);
  console.log("─── URLs ───");
  for (const r of results) console.log(r.url);

  console.log("\n─── TypeScript snippet ───\n");
  console.log("export const CHINA_CAMP_PHOTOS = {");
  for (const r of results) {
    const slug = r.key.replace(`${KEY_PREFIX}/`, "").replace(/\.[^.]+$/, "");
    console.log(`  "${slug}": "${r.url}",`);
  }
  console.log("};");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
