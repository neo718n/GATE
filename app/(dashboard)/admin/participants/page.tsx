import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  draft: "text-gate-800/40",
  submitted: "text-yellow-700",
  verified: "text-green-700",
  rejected: "text-red-600",
};

const PAY_COLOR: Record<string, string> = {
  unpaid: "text-yellow-700",
  paid: "text-green-700",
  waived: "text-gate-800/40",
};

export default async function ParticipantsPage() {
  await requireRole(["super_admin", "admin"]);

  const all = await db.query.participants.findMany({
    orderBy: desc(participants.createdAt),
    with: { user: true, cycle: true },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Participants</h1>
        <p className="text-sm font-light text-gate-800/60">{all.length} total</p>
      </div>

      <div className="flex flex-col gap-0 border border-gate-fog bg-white divide-y divide-gate-fog/40">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-gate-fog/30">
          {["Name", "Email", "Cycle", "Reg. Status", "Payment", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
              {h}
            </span>
          ))}
        </div>

        {all.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-gate-800/40 text-center">
            No participants yet.
          </p>
        )}

        {all.map((p) => (
          <div key={p.id} className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center">
            <p className="text-sm font-light text-gate-800 truncate">{p.fullName}</p>
            <p className="text-xs font-light text-gate-800/55 truncate">{p.user?.email ?? "—"}</p>
            <p className="text-xs font-light text-gate-800/70 truncate">{p.cycle?.name ?? "—"}</p>
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
