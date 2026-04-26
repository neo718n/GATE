import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUBJECTS = [
  { slug: "mathematics", name: "Mathematics", description: "Pure and applied mathematics — algebra, analysis, combinatorics, geometry, number theory.", order: 1 },
  { slug: "physics", name: "Physics", description: "Classical mechanics, electrodynamics, thermodynamics, optics, modern physics.", order: 2 },
  { slug: "chemistry", name: "Chemistry", description: "Organic, inorganic, physical, and analytical chemistry.", order: 3 },
  { slug: "biology", name: "Biology", description: "Molecular biology, genetics, biochemistry, cell biology, ecology.", order: 4 },
  { slug: "competitive-programming", name: "Competitive Programming", description: "Algorithms, data structures, computational problem-solving.", order: 5 },
  { slug: "english", name: "English", description: "Academic English — reading comprehension, writing, language analysis.", order: 6 },
];

async function main() {
  const { db } = await import("../lib/db");
  const { subjects } = await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log("Seeding subjects...");

  for (const s of SUBJECTS) {
    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, s.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  — already exists: ${s.name}`);
    } else {
      await db.insert(subjects).values({ ...s, active: true });
      console.log(`  ✓ inserted: ${s.name}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
