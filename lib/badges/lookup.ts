import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventBadges, type EventBadge } from "@/lib/db/schema";

// Badge card numbers look like "UZB-C-014" or "CHN-S-001" — a 2-4 letter country
// prefix, a single-letter role code, and a 3-digit number. This is a different
// shape from certificate codes ("GATE-2026-MATH-XXXXXX", see lib/certificates/code.ts)
// so the two can never collide.
export const BADGE_CODE_SHAPE = /^[A-Z]{2,4}-[A-Z]-\d{3}$/;

export type BadgeVerifyStatus = "verified" | "not_found" | "disabled";

export interface PublicEventBadge {
  cardNo: string;
  fullName: string;
  category: EventBadge["category"];
  roleBadge: EventBadge["roleBadge"];
  country: string;
  badgeColorHex: string;
}

export function isBadgeCodeShape(code: string): boolean {
  return BADGE_CODE_SHAPE.test(code);
}

export function formatBadgeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function sanitizeBadge(row: EventBadge): PublicEventBadge {
  // Deliberately excludes dateOfBirth and sourceNote — never send those to the
  // client. Many badge holders are minors; the public verify page only confirms
  // identity + role + country, nothing else.
  return {
    cardNo: row.cardNo,
    fullName: row.fullName,
    category: row.category,
    roleBadge: row.roleBadge,
    country: row.country,
    badgeColorHex: row.badgeColorHex,
  };
}

export async function lookupRawBadgeByCode(
  rawCode: string,
): Promise<EventBadge | null> {
  const canonical = formatBadgeCode(rawCode);
  if (!isBadgeCodeShape(canonical)) return null;
  const [row] = await db
    .select()
    .from(eventBadges)
    .where(eq(eventBadges.cardNo, canonical))
    .limit(1);
  return row ?? null;
}
