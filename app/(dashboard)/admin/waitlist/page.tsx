import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { waitlistSignups } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { LocalDate } from "@/components/ui/local-date";
import { updateWaitlistStatus } from "@/lib/actions/admin";
import { flagUrl } from "@/lib/phone-codes";

const STATUS_COLORS: Record<string, string> = {
  new: "text-amber-600 border-amber-200",
  contacted: "text-blue-600 border-blue-200",
  converted: "text-green-700 border-green-200",
  archived: "text-foreground/40 border-border",
};

const NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  new: [
    { value: "contacted", label: "Mark Contacted" },
    { value: "archived", label: "Archive" },
  ],
  contacted: [
    { value: "converted", label: "Mark Converted" },
    { value: "archived", label: "Archive" },
  ],
  converted: [{ value: "archived", label: "Archive" }],
  archived: [{ value: "new", label: "Reopen" }],
};

export default async function WaitlistPage() {
  await requireRole(["super_admin", "admin"]);

  const signups = await db.query.waitlistSignups.findMany({
    orderBy: desc(waitlistSignups.createdAt),
  });

  const counts = signups.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Marketing
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">China Camp Waitlist</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {signups.length} total · {counts.new ?? 0} new · {counts.contacted ?? 0} contacted ·{" "}
          {counts.converted ?? 0} converted
        </p>
      </div>

      {signups.length === 0 ? (
        <div className="border border-border bg-muted/30 p-8 text-center">
          <p className="text-sm font-light text-foreground/60">
            No waitlist signups yet. They&apos;ll appear here as visitors use the &quot;Notify
            Me&quot; button on the homepage.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {signups.map((s) => (
            <div key={s.id} className="border border-border bg-card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-foreground">{s.fullName}</h2>
                  <p className="text-xs font-light text-foreground/55">
                    {s.email} · <LocalDate date={s.createdAt} showTime />
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] border px-3 py-1.5 ${
                    STATUS_COLORS[s.status] ?? ""
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-light text-foreground/65">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50 block mb-1.5">
                    Phone
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flagUrl(s.phoneCountryIso)}
                      alt={s.phoneCountryIso}
                      width={18}
                      height={13}
                      className="rounded-[2px]"
                    />
                    {s.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50 block mb-1.5">
                    Country
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flagUrl(s.countryIso)}
                      alt={s.countryIso}
                      width={18}
                      height={13}
                      className="rounded-[2px]"
                    />
                    {s.countryName}
                  </span>
                </div>
                {s.detectedCountryIso && s.detectedCountryIso !== s.countryIso && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50 block mb-1.5">
                      IP-Detected
                    </span>
                    <span className="inline-flex items-center gap-2 text-foreground/45">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={flagUrl(s.detectedCountryIso)}
                        alt={s.detectedCountryIso}
                        width={18}
                        height={13}
                        className="rounded-[2px]"
                      />
                      {s.detectedCountryIso} (edited by visitor)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1 border-t border-border">
                {(NEXT_STATUS[s.status] ?? []).map((next) => (
                  <form action={updateWaitlistStatus} key={next.value}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value={next.value} />
                    <Button type="submit" variant={next.value === "archived" ? "ghost" : "outline"} size="sm">
                      {next.label}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
