/* eslint-disable no-console */
import "dotenv/config";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { certificates, results } from "@/lib/db/schema";
import { issueCertificate } from "@/lib/certificates/issue";

async function main() {
  console.log("→ Backfilling G.A.T.E. certificates for historical results…");

  const candidates = await db
    .select({ id: results.id, award: results.award })
    .from(results)
    .where(and(isNotNull(results.publishedAt), isNotNull(results.award)));

  console.log(`  Found ${candidates.length} published+awarded result(s).`);

  const already = new Set(
    (
      await db
        .select({ resultId: certificates.resultId })
        .from(certificates)
    ).map((r) => r.resultId),
  );

  const todo = candidates.filter((r) => !already.has(r.id));
  console.log(`  Need to issue: ${todo.length}`);

  let ok = 0;
  let fail = 0;
  for (const r of todo) {
    try {
      const out = await issueCertificate({ resultId: r.id });
      console.log(`  ✓ result ${r.id} → ${out.code}`);
      ok++;
    } catch (err) {
      console.error(
        `  ✗ result ${r.id} failed:`,
        err instanceof Error ? err.message : err,
      );
      fail++;
    }
  }

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(certificates);
  console.log(`\nDone. Issued: ${ok}, failed: ${fail}, total in DB: ${total}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
