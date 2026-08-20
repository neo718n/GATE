import "server-only";

import { asc } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { eventBadges } from "@/lib/db/schema";
import { BadgeSheetPDF } from "@/components/badges/badge-sheet-pdf";
import type { BadgeCardData } from "@/components/badges/badge-card-pdf";

function verifyUrlFor(code: string): string {
  const base = (
    process.env.CERT_VERIFY_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://gate-assessment.org"
  ).replace(/\/+$/, "");
  return `${base}/verify/${code}`;
}

export async function renderBadgeSheetPdf(): Promise<Buffer> {
  const rows = await db
    .select()
    .from(eventBadges)
    .orderBy(asc(eventBadges.cardNo));

  const badges: BadgeCardData[] = await Promise.all(
    rows.map(async (row) => ({
      cardNo: row.cardNo,
      fullName: row.fullName,
      category: row.category,
      roleBadge: row.roleBadge,
      country: row.country,
      badgeColorHex: row.badgeColorHex,
      qrDataUrl: await QRCode.toDataURL(verifyUrlFor(row.cardNo), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 256,
      }),
    })),
  );

  return renderToBuffer(<BadgeSheetPDF badges={badges} />);
}
