import { and, desc, eq, ne } from "drizzle-orm";
import { ArrowUpRight, Link2, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { applications, repInviteLinks } from "@/lib/db/schema";
import { requireRep } from "@/lib/reps/auth";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition, subjectLabel } from "@/lib/editions-ru";
import { Link } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import { BarList, StatCard } from "@/components/rep/charts";
import { PageTitle } from "@/components/rep/rep-shell";

function tally<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

const daysAgo = (n: number) => new Date().getTime() - n * 86_400_000;

const BANDS = ["1–2", "3–4", "5–6", "7–8", "9–12"];
const bandOf = (g: number) => BANDS[g <= 2 ? 0 : g <= 4 ? 1 : g <= 6 ? 2 : g <= 8 ? 3 : 4];

const T = {
  en: {
    hello: (n: string) => `Hello, ${n}`,
    share: "Share a link",
    add: "Add student",
    students: "Students",
    studentsHint: "Registered for this program",
    week: "This week",
    weekHint: "Added in the last 7 days",
    viaLinks: "Via your links",
    viaLinksHint: "Filled the shared form",
    activeLinks: "Active links",
    created: (n: number) => `${n} created in total`,
    byCountry: "By country",
    bySubject: "By subject",
    byGrade: "By grade",
    none: "No students yet",
    latest: "Latest students",
    viewAll: "View all",
    emptyLead: "Add a student yourself, or create a registration link and share it with your students' group.",
    band: (b: string) => `Grades ${b}`,
    grade: (g: number) => `Grade ${g}`,
    dateLocale: "en-GB",
  },
  ru: {
    hello: (n: string) => `Здравствуйте, ${n}`,
    share: "Поделиться ссылкой",
    add: "Добавить ученика",
    students: "Ученики",
    studentsHint: "Зарегистрированы на программу",
    week: "За неделю",
    weekHint: "Добавлены за последние 7 дней",
    viaLinks: "По вашим ссылкам",
    viaLinksHint: "Заполнили форму сами",
    activeLinks: "Активные ссылки",
    created: (n: number) => `Всего создано: ${n}`,
    byCountry: "По странам",
    bySubject: "По предметам",
    byGrade: "По классам",
    none: "Учеников пока нет",
    latest: "Новые ученики",
    viewAll: "Все ученики",
    emptyLead: "Добавьте ученика сами или создайте ссылку для регистрации и отправьте её в чат группы.",
    band: (b: string) => `${b} классы`,
    grade: (g: number) => `${g} класс`,
    dateLocale: "ru-RU",
  },
};

export default async function RepDashboard() {
  const rep = await requireRep();
  const locale = await getLocale();
  const t = T[locale];
  const edition = localizeEdition(getCurrentEdition(), locale);
  const [students, links] = await Promise.all([
    db.query.applications.findMany({
      where: and(eq(applications.representativeId, rep.id), ne(applications.status, "cancelled")),
      orderBy: desc(applications.createdAt),
    }),
    db.query.repInviteLinks.findMany({ where: eq(repInviteLinks.representativeId, rep.id) }),
  ]);

  const weekAgo = daysAgo(7);
  const thisWeek = students.filter((s) => s.createdAt.getTime() > weekAgo).length;
  const viaLinks = students.filter((s) => s.inviteLinkId).length;
  const firstName = rep.name.split(" ")[0];

  return (
    <>
      <PageTitle
        eyebrow={`${edition.name} · ${edition.dateLabel}`}
        title={t.hello(firstName)}
        action={
          <div className="flex gap-2">
            <Link href="/links" className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-white px-5 text-[13px] font-semibold text-ink hover:border-gate-gold">
              <Link2 className="h-4 w-4" /> {t.share}
            </Link>
            <Link href="/students/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-ivory hover:bg-gate-700">
              <Plus className="h-4 w-4" /> {t.add}
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t.students} value={students.length} hint={t.studentsHint} accent />
        <StatCard label={t.week} value={thisWeek} hint={t.weekHint} />
        <StatCard label={t.viaLinks} value={viaLinks} hint={t.viaLinksHint} />
        <StatCard label={t.activeLinks} value={links.filter((l) => l.active).length} hint={t.created(links.length)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <BarList title={t.byCountry} rows={tally(students, (s) => s.country)} empty={t.none} />
        <BarList title={t.bySubject} rows={tally(students, (s) => subjectLabel(s.subject, locale))} empty={t.none} />
        <BarList title={t.byGrade} rows={tally(students, (s) => t.band(bandOf(s.grade)))} empty={t.none} />
      </div>

      <div className="mt-3 rounded-[1.75rem] border border-line bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-3">{t.latest}</h2>
          <Link href="/students" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink hover:text-gate-gold">
            {t.viewAll} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {students.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-serif text-2xl text-ink">{t.none}</p>
            <p className="max-w-sm text-[13px] text-ink-3">{t.emptyLead}</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {students.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link href={`/students/${s.id}`} className="flex items-center justify-between gap-4 py-3 hover:opacity-80">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory-2 text-[12px] font-semibold text-ink">
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[14px] font-semibold text-ink">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="text-[12px] text-ink-3">
                        {s.country} · {subjectLabel(s.subject, locale)} · {t.grade(s.grade)}
                      </span>
                    </span>
                  </span>
                  <span className="text-[12px] text-ink-3">{s.createdAt.toLocaleDateString(t.dateLocale, { day: "numeric", month: "short" })}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
