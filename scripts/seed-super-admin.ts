/**
 * One-time script: creates the super admin account.
 * Run: npm run seed:admin
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load env BEFORE any other imports touch process.env
config({ path: resolve(process.cwd(), ".env.local") });

const EMAIL = process.env.SUPER_ADMIN_EMAIL!;
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD!;

if (!EMAIL || !PASSWORD) {
  console.error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env.local");
  process.exit(1);
}

async function main() {
  // Dynamic imports so dotenv runs first
  const { db } = await import("../lib/db");
  const { user } = await import("../lib/db/schema");
  const { auth } = await import("../lib/auth");
  const { eq } = await import("drizzle-orm");

  console.log(`Creating super admin: ${EMAIL}`);

  const existing = await db.select().from(user).where(eq(user.email, EMAIL)).limit(1);

  if (existing.length > 0) {
    await db
      .update(user)
      .set({ role: "super_admin", emailVerified: true })
      .where(eq(user.email, EMAIL));
    console.log("✓ Existing user updated → role: super_admin, emailVerified: true");
    process.exit(0);
  }

  const ctx = await auth.api.signUpEmail({
    body: { email: EMAIL, password: PASSWORD, name: "Super Admin" },
  });

  if (!ctx?.user?.id) {
    console.error("Failed to create user");
    process.exit(1);
  }

  await db
    .update(user)
    .set({ role: "super_admin", emailVerified: true })
    .where(eq(user.id, ctx.user.id));

  console.log("✓ Super admin created");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Role:     super_admin`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
