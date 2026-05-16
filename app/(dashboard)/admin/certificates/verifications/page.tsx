import { desc, gte, sql } from "drizzle-orm";
import { ShieldCheck, ShieldX, ShieldAlert, Clock } from "lucide-react";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { certificateVerifications, certificates } from "@/lib/db/schema";
import Link from "next/link";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default async function VerificationsPage() {
  await requireRole(["admin", "super_admin"]);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

  const [
    [{ total }],
    [{ recent }],
    [{ uniques }],
    topVerified,
    daily,
    recentRows,
  ] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(certificateVerifications),
    db
      .select({ recent: sql<number>`count(*)::int` })
      .from(certificateVerifications)
      .where(gte(certificateVerifications.verifiedAt, thirtyDaysAgo)),
    db
      .select({
        uniques: sql<number>`count(distinct ${certificateVerifications.ipHash})::int`,
      })
      .from(certificateVerifications)
      .where(gte(certificateVerifications.verifiedAt, thirtyDaysAgo)),
    db
      .select({
        certificateId: certificateVerifications.certificateId,
        verificationCode: certificates.verificationCode,
        participantName: certificates.participantName,
        cnt: sql<number>`count(*)::int`,
      })
      .from(certificateVerifications)
      .innerJoin(
        certificates,
        sql`${certificates.id} = ${certificateVerifications.certificateId}`,
      )
      .where(gte(certificateVerifications.verifiedAt, thirtyDaysAgo))
      .groupBy(
        certificateVerifications.certificateId,
        certificates.verificationCode,
        certificates.participantName,
      )
      .orderBy(sql`count(*) desc`)
      .limit(5),
    db
      .select({
        day: sql<string>`date_trunc('day', ${certificateVerifications.verifiedAt})::date::text`,
        cnt: sql<number>`count(*)::int`,
      })
      .from(certificateVerifications)
      .where(gte(certificateVerifications.verifiedAt, thirtyDaysAgo))
      .groupBy(sql`date_trunc('day', ${certificateVerifications.verifiedAt})`)
      .orderBy(sql`date_trunc('day', ${certificateVerifications.verifiedAt})`),
    db
      .select()
      .from(certificateVerifications)
      .orderBy(desc(certificateVerifications.verifiedAt))
      .limit(50),
  ]);

  const dailyMap = new Map<string, number>();
  for (const d of daily as Array<{ day: string; cnt: number }>) {
    dailyMap.set(d.day, d.cnt);
  }
  const days: Array<{ label: string; cnt: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = startOfDay(new Date(now.getTime() - i * DAY_MS));
    const iso = d.toISOString().slice(0, 10);
    days.push({ label: iso, cnt: dailyMap.get(iso) ?? 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.cnt));

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Admin · Certificates
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Verification Activity
        </h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          Public verification lookups against the G.A.T.E. registry.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Total verifications" value={total} />
        <KpiTile label="Last 30 days" value={recent} accent="gold" />
        <KpiTile label="Unique verifiers (30d)" value={uniques} />
        <KpiTile
          label="Top cert (30d)"
          value={topVerified[0]?.cnt ?? 0}
          sub={topVerified[0]?.verificationCode}
        />
      </div>

      <section className="border border-border bg-card p-6">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Verifications, last 30 days
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
            Peak day: {maxDay}
          </span>
        </header>
        <div
          role="img"
          aria-label={`Verifications per day, last 30 days. Peak ${maxDay} on a single day.`}
          className="flex items-end gap-1 h-32 w-full"
        >
          {days.map((d) => (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center justify-end gap-1 group"
            >
              <div
                className="w-full rounded-t-sm bg-gate-gold/70 group-hover:bg-gate-gold transition-colors"
                style={{
                  height: `${Math.max(2, (d.cnt / maxDay) * 100)}%`,
                }}
                title={`${d.label}: ${d.cnt}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-foreground/40 mt-2">
          <span>{days[0]?.label}</span>
          <span>{days[days.length - 1]?.label}</span>
        </div>
      </section>

      <section className="border border-border bg-card">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Most-verified certificates (30 days)
          </h2>
        </header>
        {topVerified.length === 0 ? (
          <p className="px-6 py-8 text-sm font-light text-foreground/50 text-center">
            No verifications yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {topVerified.map((row) => (
              <li
                key={row.certificateId ?? row.verificationCode}
                className="px-6 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-light text-foreground truncate">
                    {row.participantName}
                  </p>
                  <p className="font-mono text-[10px] text-foreground/50 tracking-wider truncate">
                    {row.verificationCode}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gate-gold">
                  {row.cnt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-border bg-card">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Recent verifications
          </h2>
          <Link
            href="/api/admin/certificates/verifications/export"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gate-gold hover:underline"
          >
            Download CSV
          </Link>
        </header>
        {recentRows.length === 0 ? (
          <p className="px-6 py-8 text-sm font-light text-foreground/50 text-center">
            No verifications yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentRows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-foreground/70 inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-foreground/40" aria-hidden />
                      {timeAgo(r.verifiedAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground/80">
                      {r.attemptedCode}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.resultStatus} />
                    </td>
                    <td className="px-4 py-3 text-foreground/70">
                      {r.countryCode ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground/70 capitalize">
                      {r.userAgentClass}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: "gold";
}) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
        {label}
      </p>
      <p
        className={`mt-2 font-serif text-3xl font-light ${
          accent === "gold" ? "text-gate-gold" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1 font-mono text-[10px] text-foreground/40 truncate">
          {sub}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-500 text-xs font-semibold">
        <ShieldCheck className="h-3 w-3" aria-hidden />
        Verified
      </span>
    );
  if (status === "revoked")
    return (
      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold">
        <ShieldAlert className="h-3 w-3" aria-hidden />
        Revoked
      </span>
    );
  if (status === "rate_limited")
    return (
      <span className="inline-flex items-center gap-1 text-foreground/50 text-xs font-semibold">
        <Clock className="h-3 w-3" aria-hidden />
        Rate-limited
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-destructive text-xs font-semibold">
      <ShieldX className="h-3 w-3" aria-hidden />
      Not found
    </span>
  );
}
