import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function CoordinatorParticipantsPage() {
  await requireRole(["coordinator", "admin", "super_admin"]);

  const allParticipants = await db.query.participants.findMany({
    with: {
      user: true,
      subjects: { with: { subject: true } },
    },
    orderBy: desc(participants.createdAt),
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Coordinator
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">My Participants</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {allParticipants.length} participants in your region
        </p>
      </div>

      {allParticipants.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-light text-foreground/60">No participants assigned yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-muted/30">
            {["Name", "Country", "Subject", "Registration", "Payment"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {h}
              </span>
            ))}
          </div>
          {allParticipants.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-light text-foreground">{p.fullName}</p>
                <p className="text-xs font-light text-foreground/40">{p.user?.email}</p>
              </div>
              <p className="text-xs font-light text-foreground/70">{p.country}</p>
              <p className="text-xs font-light text-foreground/70">
                {p.subjects[0]?.subject?.name ?? "—"}
              </p>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  p.registrationStatus === "verified"
                    ? "text-green-700"
                    : p.registrationStatus === "submitted"
                      ? "text-blue-600"
                      : p.registrationStatus === "rejected"
                        ? "text-red-600"
                        : "text-foreground/40"
                }`}
              >
                {p.registrationStatus}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  p.paymentStatus === "paid" ? "text-green-700" : "text-foreground/40"
                }`}
              >
                {p.paymentStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
