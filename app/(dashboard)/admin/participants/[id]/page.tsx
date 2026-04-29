import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants, payments, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ParticipantDocuments } from "./participant-documents";
import { InvoiceDownloadButton } from "./invoice-download-button";

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin", "admin"]);
  const { id } = await params;
  const pid = Number(id);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, pid),
    with: {
      user: true,
      cycle: true,
      subjects: { with: { subject: true } },
      results: { with: { subject: true, round: true } },
      payments: { with: { cycle: true, round: true } },
      documents: true,
    },
  });

  if (!participant) notFound();

  const totalPaid = participant.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const STATUS_COLOR: Record<string, string> = {
    paid: "text-green-700",
    pending: "text-yellow-700",
    failed: "text-red-600",
    refunded: "text-gate-800/40",
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Admin / Participant
          </span>
          <h1 className="font-serif text-4xl font-light text-gate-800">
            {participant.fullName}
          </h1>
          <p className="text-sm font-light text-gate-800/60">{participant.user.email}</p>
        </div>
        <Link
          href="/admin/participants"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 hover:text-gate-800 transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Personal Info */}
      <section className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
          Personal Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            ["Full Name", participant.fullName],
            ["Date of Birth", participant.dateOfBirth ?? "—"],
            ["Country", participant.country],
            ["City", participant.city ?? "—"],
            ["School", participant.school ?? "—"],
            ["Grade", participant.grade ?? "—"],
            ["Guardian", participant.guardianName ?? "—"],
            ["Guardian Email", participant.guardianEmail ?? "—"],
            ["Guardian Phone", participant.guardianPhone ?? "—"],
            ["Registration Status", participant.registrationStatus],
            ["Payment Status", participant.paymentStatus],
            ["Cycle", participant.cycle?.name ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 mb-0.5">
                {label}
              </p>
              <p className="text-sm font-light text-gate-800">{value}</p>
            </div>
          ))}
        </div>
        {participant.notes && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 mb-0.5">
              Notes
            </p>
            <p className="text-sm font-light text-gate-800">{participant.notes}</p>
          </div>
        )}
      </section>

      {/* Subjects */}
      <section className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
          Enrolled Subjects
        </h2>
        {participant.subjects.length === 0 ? (
          <p className="text-sm font-light text-gate-800/40">No subjects enrolled.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {participant.subjects.map((ps) => (
              <span
                key={ps.subjectId}
                className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] border border-gate-fog text-gate-800/70"
              >
                {ps.subject.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Results */}
      {participant.results.length > 0 && (
        <section className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
            Results
          </h2>
          <div className="flex flex-col gap-0 divide-y divide-gate-fog/40">
            {participant.results.map((r) => (
              <div key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 py-3 items-center">
                <p className="text-sm font-light text-gate-800">{r.subject.name}</p>
                <p className="text-xs font-light text-gate-800/60">{r.round?.name ?? "—"}</p>
                <p className="text-sm text-gate-800">{r.score ?? "—"} / {r.maxScore ?? "—"}</p>
                <p className="text-xs font-light text-gate-800/60">Rank #{r.rank ?? "—"}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gate-gold">
                  {r.award ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transaction History */}
      <section className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gate-800">
            Transaction History
          </h2>
          <span className="text-[11px] font-semibold text-gate-gold">
            Total Paid: ${(totalPaid / 100).toFixed(2)}
          </span>
        </div>
        {participant.payments.length === 0 ? (
          <p className="text-sm font-light text-gate-800/40">No payments recorded.</p>
        ) : (
          <div className="flex flex-col gap-0 divide-y divide-gate-fog/40">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 pb-2">
              {["Cycle", "Round", "Amount", "Status", "Date", "Invoice"].map((h) => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
                  {h}
                </span>
              ))}
            </div>
            {participant.payments.map((p) => (
              <div key={p.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 py-3 items-center">
                <p className="text-sm font-light text-gate-800">{p.cycle?.name ?? "—"}</p>
                <p className="text-xs font-light text-gate-800/60">{p.round?.name ?? "—"}</p>
                <p className="text-sm text-gate-800">${(p.amountCents / 100).toFixed(2)}</p>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_COLOR[p.status] ?? ""}`}>
                  {p.status}
                </span>
                <p className="text-[11px] font-light text-gate-800/50">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
                <InvoiceDownloadButton
                  payment={p}
                  participant={{ name: participant.fullName, email: participant.user.email, country: participant.country }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Documents */}
      <ParticipantDocuments
        docs={participant.documents}
        participantId={participant.id}
      />
    </div>
  );
}
