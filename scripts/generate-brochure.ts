import { chromium } from "playwright-core";
import path from "path";
import fs from "fs";

const CHROMIUM_PATH =
  "C:/Users/nurbe/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";

const BASE_URL = "http://localhost:3002";

const ROUTES: Record<string, string> = {
  en: "/brochure",
  ru: "/brochure/ru",
};

const OUTPUT_DIR = path.join(process.cwd(), "public", "brochure");

async function generate(lang: string) {
  const route = ROUTES[lang];
  if (!route) {
    console.error(`Unknown lang: ${lang}. Use 'en' or 'ru'.`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, headless: true });
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const outFile = path.join(OUTPUT_DIR, `gate-academic-programs-2026-${lang}.pdf`);

  await page.pdf({
    path: outFile,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log(`✓ ${lang.toUpperCase()} PDF → ${outFile}`);
}

async function main() {
  const arg = process.argv[2];
  if (arg === "en" || arg === "ru") {
    await generate(arg);
  } else {
    await generate("en");
    await generate("ru");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
