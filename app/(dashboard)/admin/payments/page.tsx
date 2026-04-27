import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updatePaymentStatus } from "@/lib/actions/admin";

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
  refunded: "text-gate-800/40",
};

export default async function PaymentsPage() {
  await requireRole(["super_admin", "admin"]);

  const allPayments = await db.query.payments.findMany({
    orderBy: desc(payments.createdAt),
    with: {
      user: true,
      cycle: true,
      round: true,
    },
  });

  const paid = allPayments.filter((p) => p.status === "paid").length;
  const pending = allPayments.filter((p) => p.status === "pending").length;
  const failed = allPayments.filter((p) => p.status === "failed").length;
  const totalUsd = allPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountUsd, 0);

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Payments</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          {allPayments.length} total payment records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: `$${totalUsd}`, color: "text-gate-gold" },
          { label: "Paid", value: paid, color: "text-green-700" },
          { label: "Pending", value: pending, color: "text-yellow-700" },
          { label: "Failed", value: failed, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="border border-gate-fog bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gate-800/50">
              {s.label}
            </p>
            <p className={`text-3xl font-serif font-light mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-0 border border-gate-fog bg-white divide-y divide-gate-fog/40 overflow-x-auto">
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_110px_100px] gap-3 px-5 py-3 bg-gate-fog/30 min-w-[900px]">
          {["User", "Email", "Cycle", "Round", "Amount", "Status", "Date", "Action"].map(
            (h) => (
              <span
                key={h}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50"
              >
                {h}
              </span>
            ),
          )}
        </div>

        {allPayments.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-gate-800/40 text-center">
            No payments recorded yet.
          </p>
        )}

        {allPayments.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr_110px_100px] gap-3 px-5 py-4 items-center min-w-[900px]"
          >
            <p className="text-sm font-light text-gate-800 truncate">
              {p.user?.name ?? "—"}
            </p>
            <p className="text-xs font-light text-gate-800/55 truncate">
              {p.user?.email ?? "—"}
            </p>
            <p className="text-xs font-light text-gate-800/70 truncate">
              {p.cycle?.name ?? "—"}
            </p>
            <p className="text-xs font-light text-gate-800/70 truncate">
              {p.round?.name ?? "—"}
            </p>
            <p className="text-sm font-light text-gate-800">${p.amountUsd}</p>
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${STATUS_COLOR[p.status] ?? "text-gate-800"}`}
            >
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
            <p className="text-[11px] font-light text-gate-800/50">
              {new Date(p.createdAt).toLocaleDateString()}
            </p>
            <form action={updatePaymentStatus}>
              <input type="hidden" name="id" value={p.id} />
              <input
                type="hidden"
                name="status"
                value={p.status === "paid" ? "refunded" : "paid"}
              />
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
    </div>
  );
}
