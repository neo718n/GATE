import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { subjects } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSubject, toggleSubjectActive, seedDefaultSubjects } from "@/lib/actions/admin";

export default async function SubjectsPage() {
  await requireRole(["super_admin"]);

  const allSubjects = await db.query.subjects.findMany({
    orderBy: asc(subjects.order),
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Super Admin
        </span>
        <h1 className="font-serif text-4xl font-light text-foreground">
          Subjects &amp; Disciplines
        </h1>
        <p className="text-sm font-light text-foreground/60 mt-1">
          {allSubjects.length} subjects configured ·{" "}
          {allSubjects.filter((s) => s.active).length} active
        </p>
      </div>

      {allSubjects.length === 0 && (
        <div className="border border-border bg-muted/30 p-6 flex items-center justify-between gap-4">
          <p className="text-sm font-light text-foreground/65">
            No subjects yet. Seed the 6 default disciplines or add custom ones below.
          </p>
          <form action={seedDefaultSubjects}>
            <Button type="submit" variant="gold" size="sm">
              Seed Defaults
            </Button>
          </form>
        </div>
      )}

      {allSubjects.length > 0 && (
        <div className="flex flex-col gap-0 border border-border bg-card divide-y divide-border">
          {allSubjects.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-light text-foreground">{s.name}</p>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                    {s.slug}
                  </span>
                </div>
                {s.description && (
                  <p className="text-xs font-light text-foreground/50">{s.description}</p>
                )}
              </div>
              <form action={toggleSubjectActive}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="active" value={String(s.active)} />
                <Button
                  type="submit"
                  variant={s.active ? "outline" : "ghost"}
                  size="sm"
                >
                  {s.active ? "Deactivate" : "Activate"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      <details className="border border-border bg-card">
        <summary className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground cursor-pointer hover:bg-muted/30 transition-colors list-none">
          + Add Custom Subject
        </summary>
        <form action={createSubject} className="p-6 border-t border-border flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. Computer Science" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" required placeholder="e.g. computer-science" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="order">Display Order</Label>
              <Input id="order" name="order" type="number" placeholder="7" min="1" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Brief description of the subject area..." rows={2} />
          </div>
          <div>
            <Button type="submit" variant="gold" size="md">
              Add Subject
            </Button>
          </div>
        </form>
      </details>
    </div>
  );
}
