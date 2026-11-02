"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApplicationForm } from "@/components/apply/application-form";
import { repRemoveStudent, type SubmitResult } from "@/lib/actions/applications";
import { useLocale } from "@/lib/i18n/client";
import { localizePath } from "@/lib/i18n/config";

type Initial = Parameters<typeof ApplicationForm>[0]["initial"];

const T = {
  en: {
    save: "Save changes",
    add: "Add student",
    saved: "Changes saved",
    added: (ref: string) => `Student added · ${ref}`,
    confirm: "Remove this student from your list?",
    removed: "Student removed",
    remove: "Remove student",
  },
  ru: {
    save: "Сохранить изменения",
    add: "Добавить ученика",
    saved: "Изменения сохранены",
    added: (ref: string) => `Ученик добавлен · ${ref}`,
    confirm: "Удалить этого ученика из списка?",
    removed: "Ученик удалён",
    remove: "Удалить ученика",
  },
};

/** Add/edit wrapper: saves through the given action, then returns to the list. */
export function StudentEditor({
  submit,
  initial,
  studentId,
}: {
  submit: (values: unknown) => Promise<SubmitResult>;
  initial?: Initial;
  studentId?: number;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = T[locale];
  const [pending, start] = useTransition();
  const list = localizePath("/students", locale);

  return (
    <div className="flex flex-col gap-6">
      <ApplicationForm
        mode="rep"
        initial={initial}
        submit={submit}
        submitLabel={studentId ? t.save : t.add}
        onSaved={(ref) => {
          toast.success(studentId ? t.saved : t.added(ref));
          router.push(list);
          router.refresh();
        }}
      />
      {studentId && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(t.confirm)) return;
            start(async () => {
              await repRemoveStudent(studentId);
              toast.success(t.removed);
              router.push(list);
              router.refresh();
            });
          }}
          className="inline-flex w-fit items-center gap-2 self-end rounded-full px-4 py-2 text-[13px] font-semibold text-[#b03030] hover:bg-[#b03030]/10"
        >
          <Trash2 className="h-4 w-4" /> {t.remove}
        </button>
      )}
    </div>
  );
}
