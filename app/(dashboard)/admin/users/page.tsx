import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/lib/actions/admin";

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

export default async function UsersPage() {
  const session = await requireRole(["super_admin"]);

  const allUsers = await db.query.user.findMany({
    orderBy: desc(user.createdAt),
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-gate-800">Users &amp; Roles</h1>
        <p className="text-sm font-light text-gate-800/60 mt-1">
          {allUsers.length} registered accounts
        </p>
      </div>

      <div className="flex flex-col gap-0 border border-gate-fog bg-white divide-y divide-gate-fog/40">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_160px] gap-4 px-5 py-3 bg-gate-fog/30">
          {["Name", "Email", "Role", "Verified", "Change Role"].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gate-800/50">
              {h}
            </span>
          ))}
        </div>
        {allUsers.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-[2fr_2fr_1fr_1fr_160px] gap-4 px-5 py-4 items-center"
          >
            <p className="text-sm font-light text-gate-800 truncate">{u.name}</p>
            <p className="text-xs font-light text-gate-800/55 truncate">{u.email}</p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gate-gold">
              {ROLE_LABELS[u.role] ?? u.role}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                u.emailVerified ? "text-green-700" : "text-gate-800/40"
              }`}
            >
              {u.emailVerified ? "Yes" : "No"}
            </span>
            {u.id !== session.user.id ? (
              <form action={updateUserRole} className="flex gap-2 items-center">
                <input type="hidden" name="userId" value={u.id} />
                <select
                  name="role"
                  defaultValue={u.role}
                  className="flex-1 h-9 border border-gate-800/20 bg-white px-2 text-xs font-light text-gate-800 focus-visible:outline-none focus-visible:border-gate-gold rounded-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline" size="sm">
                  Set
                </Button>
              </form>
            ) : (
              <span className="text-[10px] font-light text-gate-800/30">(you)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
