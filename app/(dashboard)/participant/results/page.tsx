import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, results } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ResultsPage() {
  const session = await requireRole(["participant", "admin", "super_admin"]);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.userId, session.user.id),
  });

  const myResults = participant
    ? await db.query.results.findMany({
        where: eq(results.participantId, participant.id),
        with: { subject: true, cycle: true },
        orderBy: results.publishedAt,
      })
    : [];

  const publishedResults = myResults.filter((r) => r.publishedAt !== null);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          My Results
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Results</h1>
      </div>

      {!participant || participant.paymentStatus !== "paid" ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60">
            Enrollment Required
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Results will appear here once you are enrolled and the examination period has concluded.
          </p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/participant/enrollment">Go to Enrollment</Link>
          </Button>
        </div>
      ) : publishedResults.length === 0 ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60 mb-2">
            No Results Published
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Results are published by the academic committee after examination scoring is complete.
            You will be notified when your results are available.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {publishedResults.map((r) => (
            <div key={r.id} className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-gold">
                    {r.cycle?.name} — {r.stage === "preliminary" ? "Round I" : "Round II"}
                  </p>
                  <p className="text-base font-light text-gate-800">{r.subject?.name}</p>
                </div>
                {r.award && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] border border-gate-gold/40 text-gate-gold px-3 py-1.5">
                    {r.award.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6">
                {r.score !== null && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
                      Score
                    </p>
                    <p className="text-xl font-serif font-light text-gate-800">
                      {r.score}
                      {r.maxScore ? ` / ${r.maxScore}` : ""}
                    </p>
                  </div>
                )}
                {r.rank !== null && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
                      Rank
                    </p>
                    <p className="text-xl font-serif font-light text-gate-800">#{r.rank}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
