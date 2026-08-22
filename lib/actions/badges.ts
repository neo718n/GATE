"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { badgeVerifySettings } from "@/lib/db/schema";
import { requireRole } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function toggleBadgeVerifyFlow(formData: FormData) {
  const session = await requireRole(["super_admin"]);
  const currentlyEnabled = formData.get("enabled") === "true";
  const nextEnabled = !currentlyEnabled;

  const [existing] = await db
    .select({ id: badgeVerifySettings.id })
    .from(badgeVerifySettings)
    .limit(1);

  if (existing) {
    await db
      .update(badgeVerifySettings)
      .set({ enabled: nextEnabled, updatedAt: new Date() })
      .where(eq(badgeVerifySettings.id, existing.id));
  } else {
    await db.insert(badgeVerifySettings).values({ enabled: nextEnabled });
  }

  await writeAuditLog(
    session.user.id,
    nextEnabled ? "enable_badge_verify" : "disable_badge_verify",
    "badge_verify_settings",
  );

  revalidatePath("/admin/settings");
  revalidatePath("/verify", "layout");
}
