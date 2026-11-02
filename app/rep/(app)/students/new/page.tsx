import { PageTitle } from "@/components/rep/rep-shell";
import { StudentEditor } from "@/components/rep/student-editor";
import { repAddStudent } from "@/lib/actions/applications";
import { getLocale } from "@/lib/i18n/server";

export default async function NewStudentPage() {
  const ru = (await getLocale()) === "ru";
  return (
    <>
      <PageTitle eyebrow={ru ? "Ученики" : "Students"} title={ru ? "Новый ученик" : "Add a student"} />
      <StudentEditor submit={repAddStudent} />
    </>
  );
}
