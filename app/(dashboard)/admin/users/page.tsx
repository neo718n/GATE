import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { desc, count, ilike, or } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/lib/actions/admin";
import { DeleteUserButton } from "./delete-user-button";
import Link from "next/link";

const PAGE_SIZE = 50;

const ROLES = [
  "participant",
  "coordinator",
  "admin",
  "super_admin",
  "partner_contact",
  "career_applicant",
] as const;

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  coordinator: "Coordinator",
  participant: "Participant",
  partner_contact: "Partner Contact",
  career_applicant: "Career Applicant",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await requireRole(["super_admin"]);

  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const search = q?.trim() ?? "";

  const whereClause = search
    ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
    : undefined;

  const [totalResult, allUsers] = await Promise.all([
    db.select({ count: count() }).from(user).where(whereClause),
    db.query.user.findMany({
      where: whereClause,
      orderBy: desc(user.createdAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number, sq = search) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (sq) params.set("q", sq);
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">Users &amp; Roles</h1>
        <p className="text-sm font-light text-foreground/60 mt-1">{total} registered accounts</p>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="flex-1 border border-border bg-card px-4 py-2 text-sm font-light text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-1 focus:ring-gate-gold"
        />
        <button
          type="submit"
          className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] bg-gate-gold text-white"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/users"
            className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border border-border text-foreground/60 hover:text-foreground"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_180px_80px] gap-4 px-5 py-3 bg-muted/30">
          {["Name", "Email", "Role", "Verified", "Change Role", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {h}
            </span>
          ))}
        </div>
        {allUsers.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">No users found.</p>
        )}
        {allUsers.map((u) => (
          <div key={u.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_180px_80px] gap-4 px-5 py-4 items-center">
            <p className="text-sm font-light text-foreground truncate">{u.name}</p>
            <p className="text-xs font-light text-foreground/55 truncate">{u.email}</p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gate-gold">
              {ROLE_LABELS[u.role] ?? u.role}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${u.emailVerified ? "text-green-700" : "text-foreground/40"}`}>
              {u.emailVerified ? "Yes" : "No"}
            </span>
            {u.id !== session.user.id ? (
              <form action={updateUserRole} className="flex gap-2 items-center">
                <input type="hidden" name="userId" value={u.id} />
                <select
                  name="role"
                  defaultValue={u.role}
                  className="flex-1 h-9 border border-border bg-input px-2 text-xs font-light text-foreground focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <Button type="submit" variant="outline" size="sm">Set</Button>
              </form>
            ) : (
              <span className="text-[10px] font-light text-foreground/30">(you)</span>
            )}
            {u.id !== session.user.id ? (
              <DeleteUserButton userId={u.id} name={u.name} />
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-light text-foreground/50">
            Page {page} of {totalPages} &mdash; showing {allUsers.length} of {total}
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
