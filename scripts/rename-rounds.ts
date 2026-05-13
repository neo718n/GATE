import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { db } = await import("../lib/db");
  const { rounds, cycles } = await import("../lib/db/schema");
  const { eq, or, desc } = await import("drizzle-orm");

  const cycle = await db.query.cycles.findFirst({
    where: or(
      eq(cycles.status, "registration_open"),
      eq(cycles.status, "active"),
      eq(cycles.status, "planning"),
    ),
    orderBy: [desc(cycles.year)],
    with: {
      rounds: { orderBy: (t, { asc }) => [asc(t.order)] },
    },
  });

  if (!cycle) {
    console.error("No active cycle found.");
    process.exit(1);
  }

  console.log(`Cycle: #${cycle.id} ${cycle.name}`);

  const renames: { order: number; newName: string }[] = [
    { order: 1, newName: "Online Diagnostic Assessment" },
    { order: 2, newName: "Hangzhou Academic Training Camp" },
  ];

  for (const r of renames) {
    const round = cycle.rounds.find((x) => x.order === r.order);
    if (!round) {
      console.log(`  ⚠ no round with order=${r.order}`);
      continue;
    }
    if (round.name === r.newName) {
      console.log(`  ✓ already named "${r.newName}"`);
      continue;
    }
    await db
      .update(rounds)
      .set({ name: r.newName })
      .where(eq(rounds.id, round.id));
    console.log(`  ✓ "${round.name}" → "${r.newName}"`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});