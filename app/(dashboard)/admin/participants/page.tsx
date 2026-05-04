import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { desc, ilike, or, count } from "drizzle-orm";
import Link from "next/link";

const PAGE_SIZE = 30;

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

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireRole(["super_admin", "admin"]);

  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const search = q?.trim() ?? "";

  const whereClause = search
    ? or(
        ilike(participants.fullName, `%${search}%`),
        ilike(participants.country, `%${search}%`),
      )
    : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(participants).where(whereClause),
    db.query.participants.findMany({
      where: whereClause,
      orderBy: desc(participants.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { user: true, cycle: true, round: true },
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number, sq = search) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (sq) params.set("q", sq);
    const qs = params.toString();
    return `/admin/participants${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Participants</h1>
        <p className="text-sm font-light text-foreground/60">{total} total</p>
      </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name or country..."
          className="flex-1 border border-border bg-card px-4 py-2 text-sm font-light text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-1 focus:ring-gate-gold"
        />
        <button
          type="submit"
          className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] bg-gate-gold text-white hover:opacity-90 transition-opacity"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/participants"
            className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground transition-colors flex items-center"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-muted/30">
          {["Name", "Email", "Cycle", "Round", "Reg. Status", "Payment", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {h}
            </span>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            {search ? `No participants matching "${search}".` : "No participants yet."}
          </p>
        )}

        {rows.map((p) => (
          <div key={p.id} className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center">
            <p className="text-sm font-light text-foreground truncate">{p.fullName}</p>
            <p className="text-xs font-light text-foreground/55 truncate">{p.user?.email ?? "-"}</p>
            <p className="text-xs font-light text-foreground/70 truncate">{p.cycle?.name ?? "-"}</p>
            <p className="text-xs font-light text-foreground/70 truncate">{p.round?.name ?? "-"}</p>
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
              View
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-light text-foreground/50">
            Page {page} of {totalPages} &mdash; showing {rows.length} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl(page - 1)}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl(page + 1)}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
