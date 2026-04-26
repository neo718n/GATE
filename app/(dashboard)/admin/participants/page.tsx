import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updateParticipantStatus } from "@/lib/actions/admin";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-gate-800/40 border-gate-800/20",
  submitted: "text-blue-600 border-blue-200",
  verified: "text-green-700 border-green-200",
  rejected: "text-red-600 border-red-200",
};

export default async function ParticipantsPage() {
  await requireRole(["admin", "super_admin"]);

  const allParticipants = await db.query.participants.findMany({
    with: {
      user: true,
      subjects: { with: { subject: true } },
    },
    orderBy: desc(participants.createdAt),
  });

  const pending = allParticipants.filter((p) => p.registrationStatus === "submitted").length;

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Participants</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          {allParticipants.length} total · {pending} pending verification
        </p>
      </div>

      {allParticipants.length === 0 ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 text-center">
          <p className="text-sm font-light text-gate-800/60">No participants yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-gate-fog bg-white divide-y divide-gate-fog/40">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gate-fog/30">
            {["Participant", "Email", "Country", "Subject", "Status", "Actions"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
                {h}
              </span>
            ))}
          </div>
          {allParticipants.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-start"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm font-light text-gate-800 truncate">{p.fullName}</p>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-[0.15em] border px-1.5 py-0.5 w-fit ${
                    STATUS_COLORS[p.registrationStatus] ?? ""
                  }`}
                >
                  {p.registrationStatus}
                </span>
              </div>
              <p className="text-xs font-light text-gate-800/55 truncate pt-0.5">
                {p.user?.email ?? "—"}
              </p>
              <p className="text-xs font-light text-gate-800/70 pt-0.5">{p.country}</p>
              <p className="text-xs font-light text-gate-800/70 pt-0.5">
                {p.subjects[0]?.subject?.name ?? "—"}
              </p>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] pt-0.5 ${
                  p.paymentStatus === "paid"
                    ? "text-green-700"
                    : p.paymentStatus === "waived"
                      ? "text-blue-600"
                      : "text-gate-800/40"
                }`}
              >
                {p.paymentStatus}
              </span>
              <div className="flex gap-2">
                {p.registrationStatus === "submitted" && (
                  <>
                    <form action={updateParticipantStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="verified" />
                      <Button type="submit" variant="outline" size="sm">
                        Verify
                      </Button>
                    </form>
                    <form action={updateParticipantStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <Button type="submit" variant="ghost" size="sm">
                        Reject
                      </Button>
                    </form>
                  </>
                )}
                {p.registrationStatus === "verified" && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-700 pt-2">
                    ✓ Verified
                  </span>
                )}
                {p.registrationStatus === "rejected" && (
                  <form action={updateParticipantStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="submitted" />
                    <Button type="submit" variant="ghost" size="sm">
                      Restore
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
