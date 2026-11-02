import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { requireRep } from "@/lib/reps/auth";
import { PageTitle } from "@/components/rep/rep-shell";
import { StudentEditor } from "@/components/rep/student-editor";
import { repUpdateStudent } from "@/lib/actions/applications";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const rep = await requireRep();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const s = await db.query.applications.findFirst({
    where: and(eq(applications.id, id), eq(applications.representativeId, rep.id)),
  });
  if (!s || s.status === "cancelled") notFound();

  return (
    <>
      <PageTitle eyebrow={s.reference} title={`${s.firstName} ${s.lastName}`} />
      <StudentEditor
        studentId={s.id}
        submit={repUpdateStudent.bind(null, s.id)}
        initial={{
          firstName: s.firstName,
          lastName: s.lastName,
          dateOfBirth: s.dateOfBirth,
          gender: s.gender === "female" ? "female" : "male",
          country: s.country,
          city: s.city,
          school: s.school,
          grade: s.grade,
          subject: s.subject,
          email: s.email,
          contactMethod: s.contactMethod,
          contactValue: s.contactMethod === "email" ? "" : s.contactValue,
          guardianName: s.guardianName,
          guardianPhone: s.guardianPhone,
          confirmAccuracy: true,
          confirmTerms: true,
          confirmGuardian: true,
        }}
      />
    </>
  );
}
