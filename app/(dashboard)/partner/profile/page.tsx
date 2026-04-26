import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PartnerProfilePage() {
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
          <h1 className="font-serif text-4xl font-light text-gate-800">Organization Profile</h1>
        </div>
        <div className="border border-gate-fog bg-gate-fog/30 p-8 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/60">
            No Profile Found
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
            Your account is registered as a partner contact but no organization profile was found.
            Please contact the GATE administration team.
          </p>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href="/contact">Contact Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Partner Portal
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Organization Profile</h1>
      </div>

      <div className="flex flex-col gap-0 border border-gate-fog bg-white">
        {[
          { label: "Organization", value: partner.organizationName },
          { label: "Type", value: partner.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
          { label: "Country", value: partner.country },
          { label: "City", value: partner.city ?? "—" },
          { label: "Website", value: partner.website ?? "—" },
          { label: "Contact Name", value: partner.contactName },
          { label: "Contact Email", value: partner.contactEmail },
          { label: "Contact Phone", value: partner.contactPhone ?? "—" },
          { label: "Cooperation Type", value: partner.cooperationType ?? "—" },
        ].map((row) => (
          <div key={row.label} className="flex gap-6 border-b border-gate-fog/60 px-6 py-4 last:border-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50 w-36 shrink-0 pt-0.5">
              {row.label}
            </span>
            <span className="text-sm font-light text-gate-800/80">{row.value}</span>
          </div>
        ))}
      </div>

      {partner.message && (
        <div className="border border-gate-fog bg-gate-fog/30 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gate-800/50 mb-2">
            Application Message
          </p>
          <p className="text-sm font-light text-gate-800/65 leading-[1.9]">{partner.message}</p>
        </div>
      )}
    </div>
  );
}
