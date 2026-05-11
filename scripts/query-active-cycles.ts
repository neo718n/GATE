import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { db } = await import("../lib/db");
  const { cycles } = await import("../lib/db/schema");
  const { desc } = await import("drizzle-orm");

  const allCycles = await db.query.cycles.findMany({
    orderBy: [desc(cycles.year), desc(cycles.id)],
    with: {
      rounds: {
        orderBy: (t, { asc }) => [asc(t.order)],
      },
    },
  });

  console.log(`\nFound ${allCycles.length} cycle(s)\n`);

  for (const c of allCycles) {
    console.log("═".repeat(70));
    console.log(`CYCLE #${c.id} — ${c.name}  (year: ${c.year})`);
    console.log(`Status: ${c.status}`);
    console.log(`Description: ${c.description ?? "—"}`);
    console.log(`Rounds: ${c.rounds.length}`);
    for (const r of c.rounds) {
      console.log(`  ─ Round ${r.order}: ${r.name}`);
      console.log(`      format:    ${r.format}`);
      console.log(`      fee:       $${r.feeUsd} USD`);
      console.log(`      start:     ${r.startDate?.toISOString() ?? "—"}`);
      console.log(`      end:       ${r.endDate?.toISOString() ?? "—"}`);
      console.log(`      venue:     ${r.venue ?? "—"}`);
      console.log(`      reg.status:${r.registrationStatus}`);
    }
    console.log("");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});