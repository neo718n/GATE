import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  examSessions,
  exams,
  integrationPartners,
  participants,
} from "@/lib/db/schema";

export const metadata = { title: "Result" };

export default async function RunnerResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await requireRole(["participant", "admin", "super_admin"]);
  const { sessionId } = await params;
  const sid = Number(sessionId);
  if (!Number.isInteger(sid)) notFound();

  const s = await db.query.examSessions.findFirst({
    where: eq(examSessions.id, sid),
  });
  if (!s) notFound();

  const role = (session.user as { role?: string }).role ?? "participant";
  if (role === "participant") {
    const participant = await db.query.participants.findFirst({
      where: eq(participants.userId, session.user.id),
    });
    if (!participant || s.participantId !== participant.id) notFound();
  }

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, s.examId),
  });

  const score = s.score != null ? Math.round(Number(s.score)) : null;

  // Build a validated return link (only to the partner's allowed origins).
  let returnHref: string | null = null;
  if (s.partnerReturnUrl && s.partnerId) {
    const [partner] = await db
      .select({ allowed: integrationPartners.allowedReturnOrigins })
      .from(integrationPartners)
      .where(eq(integrationPartners.id, s.partnerId))
      .limit(1);
    try {
      const u = new URL(s.partnerReturnUrl);
      const allowed = partner?.allowed ?? [];
      const ok = allowed.length === 0 || allowed.includes(u.origin);
      if (ok) {
        u.searchParams.set("status", s.status);
        if (s.externalAssignmentId) {
          u.searchParams.set("assignment", s.externalAssignmentId);
        }
        returnHref = u.toString();
      }
    } catch {
      returnHref = null;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <div className="text-4xl">✓</div>
        <h1 className="font-serif text-2xl font-light text-foreground">
          Submitted
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          {exam?.title ?? "Your exam"} — complete
        </p>
        {score != null ? (
          <p className="font-serif text-4xl font-light text-foreground">
            {score}%
          </p>
        ) : (
          <p className="text-sm font-light text-muted-foreground">
            Your submission was recorded.
          </p>
        )}
        <p className="text-xs font-light text-muted-foreground">
          Your score may update after any written answers are graded.
        </p>
        {returnHref && (
          <a
            href={returnHref}
            className="mt-2 inline-flex h-11 items-center rounded-xl bg-gate-gold px-5 text-sm font-semibold text-gate-800 hover:bg-gate-gold-2"
          >
            ← Return
          </a>
        )}
      </div>
    </div>
  );
}
