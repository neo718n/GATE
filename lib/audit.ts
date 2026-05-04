import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export async function writeAuditLog(
  userId: string | null | undefined,
  action: string,
  entityType?: string,
  entityId?: string | number,
  meta?: Record<string, unknown>,
) {
  await db.insert(auditLog).values({
    userId: userId ?? null,
    action,
    entityType: entityType ?? null,
    entityId: entityId != null ? String(entityId) : null,
    meta: meta ?? null,
  });
}
