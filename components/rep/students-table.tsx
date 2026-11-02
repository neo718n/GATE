"use client";

import { Link, useLocale } from "@/lib/i18n/client";
import { subjectLabel } from "@/lib/editions-ru";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Download, Search } from "lucide-react";
import { CONTACT_METHODS } from "@/lib/applications/schema";
import { cn } from "@/lib/utils";

export type StudentRow = {
  id: number;
  reference: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  grade: number;
  subject: string;
  email: string;
  contactMethod: string;
  contactValue: string;
  viaLink: string | null;
  createdAt: string;
};

const T = {
  en: {
    search: "Search name, email, city or application number",
    allSubjects: "All subjects",
    allCountries: "All countries",
    export: "Export CSV",
    student: "Student",
    country: "Country",
    subjectGrade: "Subject · Grade",
    contact: "Contact",
    added: "Added",
    via: (l: string) => ` · via “${l}”`,
    noMatches: "No matches",
    none: "No students yet",
    tryOther: "Try a different search or filter.",
    addFirst: "Add your first student or share a registration link.",
    showing: (a: number, b: number) => `Showing ${a} of ${b}`,
    dateLocale: "en-GB",
  },
  ru: {
    search: "Поиск по имени, почте, городу или номеру заявки",
    allSubjects: "Все предметы",
    allCountries: "Все страны",
    export: "Выгрузить CSV",
    student: "Ученик",
    country: "Страна",
    subjectGrade: "Предмет · класс",
    contact: "Контакт",
    added: "Добавлен",
    via: (l: string) => ` · по ссылке «${l}»`,
    noMatches: "Ничего не найдено",
    none: "Учеников пока нет",
    tryOther: "Попробуйте изменить запрос или фильтр.",
    addFirst: "Добавьте первого ученика или поделитесь ссылкой для регистрации.",
    showing: (a: number, b: number) => `Показано ${a} из ${b}`,
    dateLocale: "ru-RU",
  },
};

export function StudentsTable({ rows, subjects }: { rows: StudentRow[]; subjects: string[] }) {
  const locale = useLocale();
  const t = T[locale];
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const countries = useMemo(() => [...new Set(rows.map((r) => r.country))].sort(), [rows]);

  const filtered = rows.filter((r) => {
    const hay = `${r.firstName} ${r.lastName} ${r.reference} ${r.email} ${r.city}`.toLowerCase();
    return (!q || hay.includes(q.toLowerCase())) && (!subject || r.subject === subject) && (!country || r.country === country);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-white p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            className="h-11 w-full rounded-xl bg-ivory pl-11 pr-4 text-[14px] outline-none placeholder:text-ink-3/70 focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,153,58,0.18)]"
          />
        </div>
        <select
          value={subject ?? ""}
          onChange={(e) => setSubject(e.target.value || null)}
          className="h-11 rounded-xl bg-ivory px-3 text-[14px] text-ink outline-none"
        >
          <option value="">{t.allSubjects}</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{subjectLabel(s, locale)}</option>
          ))}
        </select>
        <select
          value={country ?? ""}
          onChange={(e) => setCountry(e.target.value || null)}
          className="h-11 rounded-xl bg-ivory px-3 text-[14px] text-ink outline-none"
        >
          <option value="">{t.allCountries}</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {/* Plain anchor on purpose: a file download, not a page navigation. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/students/export"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 px-4 text-[13px] font-semibold text-ink hover:border-gate-gold"
        >
          <Download className="h-4 w-4" /> {t.export}
        </a>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
        <div className="hidden grid-cols-[1.6fr_1fr_1fr_1.2fr_0.9fr_32px] gap-4 border-b border-line bg-ivory/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3 md:grid">
          <span>{t.student}</span>
          <span>{t.country}</span>
          <span>{t.subjectGrade}</span>
          <span>{t.contact}</span>
          <span>{t.added}</span>
          <span />
        </div>
        <AnimatePresence initial={false}>
          {filtered.map((r) => {
            const m = CONTACT_METHODS.find((c) => c.value === r.contactMethod);
            const method = (locale === "ru" ? m?.labelRu : m?.label) ?? r.contactMethod;
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Link
                  href={`/students/${r.id}`}
                  className="grid grid-cols-1 gap-1 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-ivory/60 md:grid-cols-[1.6fr_1fr_1fr_1.2fr_0.9fr_32px] md:items-center md:gap-4"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory-2 text-[12px] font-semibold text-ink">
                      {r.firstName[0]}
                      {r.lastName[0]}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] font-semibold text-ink">
                        {r.firstName} {r.lastName}
                      </span>
                      <span className="truncate text-[12px] text-ink-3">
                        {r.reference}
                        {r.viaLink ? t.via(r.viaLink) : ""}
                      </span>
                    </span>
                  </span>
                  <span className="text-[13px] text-ink-2">
                    {r.country}
                    <span className="text-ink-3"> · {r.city}</span>
                  </span>
                  <span className="text-[13px] text-ink-2">
                    {subjectLabel(r.subject, locale)} · {r.grade}
                  </span>
                  <span className="truncate text-[13px] text-ink-2">
                    <span className="text-ink-3">{method}:</span> {r.contactValue}
                  </span>
                  <span className="text-[12px] text-ink-3">
                    {new Date(r.createdAt).toLocaleDateString(t.dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <ChevronRight className="hidden h-4 w-4 text-ink-3 md:block" />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className={cn("flex flex-col items-center gap-2 px-5 py-14 text-center")}>
            <p className="font-serif text-2xl text-ink">{rows.length ? t.noMatches : t.none}</p>
            <p className="text-[13px] text-ink-3">{rows.length ? t.tryOther : t.addFirst}</p>
          </div>
        )}
      </div>
      <p className="px-1 text-[12px] text-ink-3">
        {t.showing(filtered.length, rows.length)}
      </p>
    </div>
  );
}
