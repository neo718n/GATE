import { requireRole } from "@/lib/authz";

export default async function InquiriesPage() {
  await requireRole(["admin", "super_admin"]);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Academic Inquiries</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Participant and institution inquiries about eligibility, examination, and procedures.
        </p>
      </div>

      <div className="border border-border bg-muted/30 p-8 flex flex-col gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Inbox
        </p>
        <p className="text-sm font-light text-foreground/65 leading-[1.9]">
          Inquiries submitted via the Contact form are received at the designated support email.
          A structured inquiry management system will be added in a future release.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          {[
            "Contact form submissions routed to support inbox",
            "Email-based response workflow for current volume",
            "Structured ticketing system — planned for next release",
          ].map((pt) => (
            <div key={pt} className="flex items-start gap-3 text-sm font-light text-foreground/60">
              <span className="mt-2 h-px w-4 shrink-0 bg-gate-gold/40" />
              {pt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
