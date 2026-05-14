import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { desc, count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updatePaymentStatus } from "@/lib/actions/admin";
import Link from "next/link";

const PAGE_SIZE = 30;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-700",
  paid: "text-green-700",
  failed: "text-red-600",
  refunded: "text-foreground/40",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole(["super_admin", "admin"]);

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const [allStats, totalResult, pagePayments] = await Promise.all([
    db.query.payments.findMany({ with: { user: true } }),
    db.select({ count: count() }).from(payments),
    db.query.payments.findMany({
      orderBy: desc(payments.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { user: true, cycle: true, round: true },
    }),
  ]);

  const paid = allStats.filter((p) => p.status === "paid").length;
  const pending = allStats.filter((p) => p.status === "pending").length;
  const failed = allStats.filter((p) => p.status === "failed").length;
  const totalCents = allStats
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Payments</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {total} total payment records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: `$${(totalCents / 100).toFixed(2)}`, color: "text-gate-gold" },
          { label: "Paid", value: paid, color: "text-green-700" },
          { label: "Pending", value: pending, color: "text-yellow-700" },
          { label: "Failed", value: failed, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
              {s.label}
            </p>
            <p className={`text-3xl font-serif font-light mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border overflow-x-auto">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_110px_100px] gap-3 px-5 py-3 bg-muted/30 min-w-[900px]">
          {["User", "Email", "Cycle", "Round", "Amount", "Status", "Date", "Action"].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {h}
            </span>
          ))}
        </div>

        {pagePayments.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No payments recorded yet.
          </p>
        )}

        {(pagePayments as any[]).map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_110px_100px] gap-3 px-5 py-4 items-center min-w-[900px]"
          >
            <p className="text-sm font-light text-foreground truncate">
              {p.user?.name ?? "-"}
            </p>
            <p className="text-xs font-light text-foreground/55 truncate">
              {p.user?.email ?? "-"}
            </p>
            <p className="text-xs font-light text-foreground/70 truncate">
              {p.cycle?.name ?? "-"}
            </p>
            <p className="text-xs font-light text-foreground/70 truncate">
              {p.round?.name ?? "-"}
            </p>
            <p className="text-sm font-light text-foreground">${(p.amountCents / 100).toFixed(2)}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${STATUS_COLOR[p.status] ?? "text-foreground"}`}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
            <p className="text-[11px] font-light text-foreground/50">
              {new Date(p.createdAt).toLocaleDateString()}
            </p>
            <form action={updatePaymentStatus}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="status" value={p.status === "paid" ? "refunded" : "paid"} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className={
                  p.status === "paid"
                    ? "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    : "text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                }
              >
                {p.status === "paid" ? "Refund" : "Mark Paid"}
              </Button>
            </form>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-light text-foreground/50">
            Page {page} of {totalPages} &mdash; showing {pagePayments.length} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/payments?page=${page - 1}`}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/payments?page=${page + 1}`}
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
