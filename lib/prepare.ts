// Preparation materials shown on /prepare. Add an entry when a paper or
// problem set is published; set `href` to make it downloadable.

import type { Locale } from "@/lib/i18n/config";

export const PREP_SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Informatics"] as const;
export type PrepSubject = (typeof PREP_SUBJECTS)[number];

export const PREP_SUBJECT_RU: Record<PrepSubject, string> = {
  Mathematics: "Математика",
  English: "Английский",
  Physics: "Физика",
  Chemistry: "Химия",
  Informatics: "Информатика",
};

export const GRADE_BANDS = ["1–2", "3–4", "5–6", "7–8", "9–12"] as const;
export type GradeBand = (typeof GRADE_BANDS)[number];

export type PrepKind = "past-paper" | "sample";

export const PREP_KIND_LABEL: Record<Locale, Record<PrepKind, string>> = {
  en: { "past-paper": "Past papers", sample: "Sample problems" },
  ru: { "past-paper": "Задания прошлых лет", sample: "Примеры задач" },
};

type Copy = { title: string; note?: string };

export type PrepResource = {
  id: string;
  kind: PrepKind;
  subject: PrepSubject;
  /** Bands the resource is suitable for. */
  bands: GradeBand[];
  copy: Record<Locale, Copy>;
  /** Unset = announced but not yet published. */
  href?: string;
};

// Summer 2026 categories: 1 = Grades 1–2 … 5 = Grades 9–11.
const PAST_PAPERS_2026: PrepResource[] = (["Mathematics", "English"] as const).flatMap((subject) =>
  GRADE_BANDS.map((band, i) => {
    const grades = band === "9–12" ? "9–11" : band;
    return {
      id: `2026-${subject}-${i + 1}`,
      kind: "past-paper" as const,
      subject,
      bands: [band],
      copy: {
        en: { title: `Summer 2026 · ${subject} · Category ${i + 1}`, note: `Grades ${grades} · paper + answer key` },
        ru: {
          title: `Лето 2026 · ${PREP_SUBJECT_RU[subject]} · Категория ${i + 1}`,
          note: `${grades} классы · задания и ответы`,
        },
      },
    };
  }),
);

export const PREP_RESOURCES: PrepResource[] = [...PAST_PAPERS_2026];
