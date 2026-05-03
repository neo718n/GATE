import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createQuestionProvider } from "@/lib/actions/admin";
import { DeleteQPButton } from "./delete-qp-button";
import { Button } from "@/components/ui/button";

export default async function QuestionProvidersPage() {
  await requireRole("super_admin");

  const providers = await db.query.user.findMany({
    where: eq(user.role, "question_provider"),
    columns: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Super Admin · Question Providers
          </span>
          <h1 className="font-serif text-4xl font-light text-foreground">Question Providers</h1>
          <p className="text-sm font-light text-foreground/60 mt-1">
            Manage accounts for external question authors.
          </p>
        </div>
      </div>

      {/* Create form */}
      <div className="border border-border bg-card px-6 py-5 flex flex-col gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Create New Account
        </p>
        <form action={createQuestionProvider} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-light text-foreground/60">Full Name</label>
              <input
                name="name"
                required
                placeholder="Jane Smith"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-light text-foreground/60">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-light text-foreground/60">Password</label>
              <input
                name="password"
                type="text"
                required
                minLength={8}
                placeholder="min. 8 characters"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="gold" size="sm">
              Create Account
            </Button>
            <p className="text-[11px] text-foreground/40">
              They sign in at <span className="text-foreground/60 font-medium">/qp/sign-in</span>
            </p>
          </div>
        </form>
      </div>

      {/* Providers list */}
      <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
        <div className="grid grid-cols-[2fr_2fr_1fr_60px] gap-4 px-5 py-3 bg-muted/30">
          {["Name", "Email", "Created", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">{h}</span>
          ))}
        </div>

        {providers.length === 0 && (
          <p className="px-5 py-10 text-sm font-light text-foreground/40 text-center">
            No question providers yet.
          </p>
        )}

        {providers.map((p) => (
          <div key={p.id} className="grid grid-cols-[2fr_2fr_1fr_60px] gap-4 px-5 py-4 items-center">
            <p className="text-sm font-light text-foreground truncate">{p.name}</p>
            <p className="text-xs font-light text-foreground/60 truncate">{p.email}</p>
            <p className="text-xs font-light text-foreground/40">
              {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <DeleteQPButton userId={p.id} name={p.name ?? p.email} />
          </div>
        ))}
      </div>
    </div>
  );
}
