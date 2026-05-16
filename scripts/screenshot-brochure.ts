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

async function screenshot(lang: string) {
  const route = ROUTES[lang];
  const outDir = path.join(process.cwd(), "tmp", "brochure-preview", lang);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, headless: true });
  const page = await browser.newPage();

  // A4 landscape at 96dpi: 297mm ≈ 1123px, 210mm ≈ 794px
  await page.setViewportSize({ width: 1123, height: 1700 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Sheet 1: outside
  const sheet1 = await page.$(".sheet-outside");
  if (sheet1) {
    await sheet1.screenshot({ path: path.join(outDir, "sheet-1-outside.png") });
    console.log(`✓ [${lang}] sheet-1-outside.png`);
  }

  // Sheet 2: inside
  const sheet2 = await page.$(".sheet-inside");
  if (sheet2) {
    await sheet2.screenshot({ path: path.join(outDir, "sheet-2-inside.png") });
    console.log(`✓ [${lang}] sheet-2-inside.png`);
  }

  await browser.close();
}

async function main() {
  const arg = process.argv[2];
  if (arg === "en" || arg === "ru") {
    await screenshot(arg);
  } else {
    await screenshot("en");
    await screenshot("ru");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
