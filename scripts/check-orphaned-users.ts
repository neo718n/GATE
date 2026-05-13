/**
 * Detection script: finds users without participant records.
 * Run: tsx scripts/check-orphaned-users.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load env BEFORE any other imports touch process.env
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  // Dynamic imports so dotenv runs first
  const { db } = await import("../lib/db");
  const { user, participants } = await import("../lib/db/schema");
  const { isNull, sql } = await import("drizzle-orm");

  const orphanedUsers = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .leftJoin(participants, sql`${user.id} = ${participants.userId}`)
    .where(isNull(participants.id));

  console.log(`\n=== Orphaned Users Report ===`);
  console.log(`Total users without participant records: ${orphanedUsers.length}\n`);

  if (orphanedUsers.length > 0) {
    console.log("Details:");
    orphanedUsers.forEach((u, idx) => {
      console.log(`\n${idx + 1}. ${u.name} (${u.email})`);
      console.log(`   ID:      ${u.id}`);
      console.log(`   Role:    ${u.role}`);
      console.log(`   Created: ${u.createdAt.toISOString()}`);
    });
  } else {
    console.log("✓ No orphaned users found - all users have participant records");
  }

  console.log("\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
