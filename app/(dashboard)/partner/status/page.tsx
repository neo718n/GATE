import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const STATUS_CONFIG = {
  pending: {
    label: "Under Review",
    desc: "Your partnership application has been received and is under review by the G.A.T.E. administration team. You will be notified by email once a decision has been made.",
    color: "text-amber-600 border-amber-200 bg-amber-50",
  },
  approved: {
    label: "Approved",
    desc: "Your organization has been approved as an official G.A.T.E. partner. Welcome to the program. The administration team will reach out to coordinate next steps.",
    color: "text-green-700 border-green-200 bg-green-50",
  },
  rejected: {
    label: "Not Approved",
    desc: "Your partnership application was not approved at this time. If you have questions or believe this was an error, please contact the administration team.",
    color: "text-red-600 border-red-200 bg-red-50",
  },
} as const;

export default async function PartnerStatusPage() {
  const session = await requireRole(["partner_contact", "admin", "super_admin"]);

  const partner = await db.query.partners.findFirst({
    where: eq(partners.userId, session.user.id),
  });

  if (!partner) {
    return (
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Partner Portal
          </span>
          <h1 className="font-serif text-4xl font-light text-gate-800">Partnership Status</h1>
        </div>
        <div className="border border-gate-fog bg-gate-fog/30 p-8">
          <p className="text-sm font-light text-gate-800/60">No partner record found for this account.</p>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[partner.status];

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Partner Portal
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Partnership Status</h1>
      </div>

      <div className={`border px-6 py-5 flex flex-col gap-3 ${config.color}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em]">{config.label}</p>
        <p className="text-sm font-light leading-[1.9]">{config.desc}</p>
      </div>

      {partner.status === "approved" && (
        <div className="flex flex-col gap-0 border border-gate-fog bg-white">
          {[
            { label: "Organization", value: partner.organizationName },
            { label: "Approved Since", value: new Date(partner.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
            { label: "Cooperation Type", value: partner.cooperationType ?? "TBD" },
          ].map((row) => (
            <div key={row.label} className="flex gap-6 border-b border-gate-fog/60 px-6 py-4 last:border-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 w-36 shrink-0 pt-0.5">
                {row.label}
              </span>
              <span className="text-sm font-light text-gate-800/80">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
