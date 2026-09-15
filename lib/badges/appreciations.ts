import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventBadgeAppreciations, type EventBadgeAppreciation } from "@/lib/db/schema";

export interface PublicEventBadgeAppreciation {
  roleLabel: string;
}

export function sanitizeAppreciation(
  row: EventBadgeAppreciation,
): PublicEventBadgeAppreciation {
  return { roleLabel: row.roleLabel };
}

export async function lookupAppreciationForBadge(
  eventBadgeId: number,
): Promise<EventBadgeAppreciation | null> {
  const [row] = await db
    .select()
    .from(eventBadgeAppreciations)
    .where(eq(eventBadgeAppreciations.eventBadgeId, eventBadgeId))
    .limit(1);
  return row ?? null;
}
