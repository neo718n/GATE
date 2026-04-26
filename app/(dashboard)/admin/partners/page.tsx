import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updatePartnerStatus } from "@/lib/actions/admin";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-600 border-amber-200",
  approved: "text-green-700 border-green-200",
  rejected: "text-red-600 border-red-200",
};

export default async function PartnersPage() {
  await requireRole(["super_admin"]);

  const allPartners = await db.query.partners.findMany({
    orderBy: desc(partners.createdAt),
  });

  const pending = allPartners.filter((p) => p.status === "pending").length;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Partner Applications</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          {allPartners.length} total · {pending} pending review
        </p>
      </div>

      {allPartners.length === 0 ? (
        <div className="border border-gate-fog bg-gate-fog/30 p-8 text-center">
          <p className="text-sm font-light text-gate-800/60">No partner applications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {allPartners.map((p) => (
            <div key={p.id} className="border border-gate-fog bg-white p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-gate-800">{p.organizationName}</h2>
                  <p className="text-xs font-light text-gate-800/55">
                    {p.type} · {p.city ? `${p.city}, ` : ""}
                    {p.country}
                    {p.website ? ` · ${p.website}` : ""}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] border px-3 py-1.5 ${
                    STATUS_COLORS[p.status] ?? ""
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-light text-gate-800/65">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 block mb-1">
                    Contact
                  </span>
                  {p.contactName} · {p.contactEmail}
                  {p.contactPhone ? ` · ${p.contactPhone}` : ""}
                </div>
                {p.cooperationType && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 block mb-1">
                      Cooperation
                    </span>
                    {p.cooperationType}
                  </div>
                )}
              </div>

              {p.message && (
                <p className="text-sm font-light text-gate-800/65 leading-[1.9] bg-gate-fog/30 px-4 py-3">
                  &ldquo;{p.message}&rdquo;
                </p>
              )}

              {p.status === "pending" && (
                <div className="flex gap-2 pt-1 border-t border-gate-fog/60">
                  <form action={updatePartnerStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="approved" />
                    <Button type="submit" variant="outline" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={updatePartnerStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Button type="submit" variant="ghost" size="sm">
                      Reject
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
