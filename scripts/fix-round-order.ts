import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { db } = await import("../lib/db");
  const { rounds, cycles } = await import("../lib/db/schema");
  const { eq, desc, asc } = await import("drizzle-orm");

  const latest = await db.query.cycles.findFirst({
    orderBy: [desc(cycles.year), desc(cycles.id)],
    with: {
      rounds: { orderBy: (t) => [asc(t.startDate)] },
    },
  });

  if (!latest) {
    console.error("No cycles found.");
    process.exit(1);
  }

  console.log(`Cycle: #${latest.id} ${latest.name}`);
  console.log(`Found ${latest.rounds.length} round(s), ordering by startDate ASC.\n`);

  for (let i = 0; i < latest.rounds.length; i++) {
    const r = latest.rounds[i];
    const newOrder = i + 1;
    if (r.order === newOrder) {
      console.log(`  ✓ Round "${r.name}" already at order=${newOrder}`);
      continue;
    }
    await db.update(rounds).set({ order: newOrder }).where(eq(rounds.id, r.id));
    console.log(`  ✓ Updated "${r.name}": order ${r.order} → ${newOrder}`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
