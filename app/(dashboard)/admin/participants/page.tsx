import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  draft: "text-foreground/40",
  submitted: "text-yellow-700",
  verified: "text-green-700",
  rejected: "text-red-600",
};

const PAY_COLOR: Record<string, string> = {
  unpaid: "text-yellow-700",
  paid: "text-green-700",
  waived: "text-foreground/40",
};

export default async function ParticipantsPage() {
  await requireRole(["super_admin", "admin"]);

  const all = await db.query.participants.findMany({
    orderBy: desc(participants.createdAt),
    with: { user: true, cycle: true, round: true },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Participants</h1>
        <p className="text-sm font-light text-foreground/60">{all.length} total</p>
      </div>

      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-muted/30">
          {["Name", "Email", "Cycle", "Round", "Reg. Status", "Payment", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {h}
            </span>
          ))}
        </div>

        {all.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No participants yet.
          </p>
        )}

        {all.map((p) => (
          <div key={p.id} className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center">
            <p className="text-sm font-light text-foreground truncate">{p.fullName}</p>
            <p className="text-xs font-light text-foreground/55 truncate">{p.user?.email ?? "—"}</p>
            <p className="text-xs font-light text-foreground/70 truncate">{p.cycle?.name ?? "—"}</p>
            <p className="text-xs font-light text-foreground/70 truncate">{p.round?.name ?? "—"}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_COLOR[p.registrationStatus] ?? ""}`}>
              {p.registrationStatus}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${PAY_COLOR[p.paymentStatus] ?? ""}`}>
              {p.paymentStatus}
            </span>
            <Link
              href={`/admin/participants/${p.id}`}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gate-gold hover:underline"
            >
              View →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
