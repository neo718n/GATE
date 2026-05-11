import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { subjects, rounds } from "@/lib/db/schema";
import { asc, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createExam } from "@/lib/actions/exam";
import Link from "next/link";

export default async function NewExamPage() {
  await requireRole(["admin", "super_admin"]);

  const [allSubjects, allRounds] = await Promise.all([
    db.query.subjects.findMany({ where: (s, { eq }) => eq(s.active, true), orderBy: asc(subjects.order) }),
    db.query.rounds.findMany({ orderBy: desc(rounds.id), with: { cycle: true } }),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">Admin · Exams</span>
        <h1 className="font-serif text-4xl font-light text-foreground">New Exam</h1>
      </div>

      <form action={createExam} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Basic Information
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required placeholder="e.g. Mathematics — Round 1 Qualifier" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                name="type"
                required
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
              >
                <option value="exam">Exam (official)</option>
                <option value="practice">Practice test</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subjectId">Subject</Label>
              <select
                id="subjectId"
                name="subjectId"
                className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
              >
                <option value="">— None —</option>
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="roundId">Round</Label>
            <select
              id="roundId"
              name="roundId"
              className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-light text-foreground focus:outline-none focus:border-gate-gold focus:ring-2 focus:ring-gate-gold/15 transition-all"
            >
              <option value="">— None —</option>
              {allRounds.map((r) => (
                <option key={r.id} value={r.id}>{r.cycle?.name} — {r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="instructions">Instructions (shown to participants before starting)</Label>
            <Textarea
              id="instructions"
              name="instructions"
              rows={4}
              placeholder="You have 90 minutes to complete this exam. No calculators allowed..."
              className="rounded-xl"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50 pb-1 border-b border-border">
            Timing & Window
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input id="durationMinutes" name="durationMinutes" type="number" min="1" placeholder="90" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="questionsPerSession">Questions per session</Label>
              <Input id="questionsPerSession" name="questionsPerSession" type="number" min="1" placeholder="All" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="windowStart">Window opens</Label>
              <Input id="windowStart" name="windowStart" type="datetime-local" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="windowEnd">Window closes</Label>
              <Input id="windowEnd" name="windowEnd" type="datetime-local" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="shuffleQuestions" defaultChecked className="w-4 h-4 accent-gate-gold" />
            <span className="text-sm font-light text-foreground">Shuffle question order per participant</span>
          </label>
        </fieldset>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="gold" size="md">Create Exam</Button>
          <Link href="/admin/exams">
            <Button type="button" variant="outline" size="md">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
