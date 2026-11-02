import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { and, desc, eq, ne } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { requireRep } from "@/lib/reps/auth";
import { getCurrentEdition } from "@/lib/editions";
import { PageTitle } from "@/components/rep/rep-shell";
import { StudentsTable } from "@/components/rep/students-table";

export default async function RepStudentsPage() {
  const rep = await requireRep();
  const ru = (await getLocale()) === "ru";
  const rows = await db.query.applications.findMany({
    where: and(eq(applications.representativeId, rep.id), ne(applications.status, "cancelled")),
    orderBy: desc(applications.createdAt),
    with: { inviteLink: true },
  });

  return (
    <>
      <PageTitle
        eyebrow={ru ? "Ваши ученики" : "Your students"}
        title={ru ? "Ученики" : "Students"}
        action={
          <Link href="/students/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-ivory hover:bg-gate-700">
            <Plus className="h-4 w-4" /> {ru ? "Добавить ученика" : "Add student"}
          </Link>
        }
      />
      <StudentsTable
        subjects={getCurrentEdition().subjects.map((s) => s.name)}
        rows={rows.map((r) => ({
          id: r.id,
          reference: r.reference,
          firstName: r.firstName,
          lastName: r.lastName,
          country: r.country,
          city: r.city,
          grade: r.grade,
          subject: r.subject,
          email: r.email,
          contactMethod: r.contactMethod,
          contactValue: r.contactValue,
          viaLink: r.inviteLink?.label ?? null,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
