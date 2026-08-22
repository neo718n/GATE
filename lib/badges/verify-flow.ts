import "server-only";
import { db } from "@/lib/db";
import { badgeVerifySettings } from "@/lib/db/schema";

// No row yet means enabled — preserves today's behavior until a super_admin
// explicitly toggles it off for the first time.
export async function isBadgeVerifyEnabled(): Promise<boolean> {
  const [row] = await db
    .select({ enabled: badgeVerifySettings.enabled })
    .from(badgeVerifySettings)
    .limit(1);
  return row?.enabled ?? true;
}
