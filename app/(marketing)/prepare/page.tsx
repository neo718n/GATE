import { PageHero } from "@/components/site/kit";
import { PrepareBrowser } from "./prepare-browser";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition } from "@/lib/editions-ru";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/prepare", {
    en: {
      title: "Prepare — past papers and sample problems",
      description:
        "Prepare for G.A.T.E. (GATE): past papers with answer keys and sample problems in Mathematics, English, Physics, Chemistry and Informatics, by grade.",
    },
    ru: {
      title: "Подготовка — задания прошлых лет и примеры задач",
      description:
        "Подготовка к G.A.T.E. (GATE): задания прошлых лет с ответами и примеры задач по математике, английскому, физике, химии и информатике — по классам.",
    },
  });

export default async function PreparePage() {
  const locale = await getLocale();
  const current = localizeEdition(getCurrentEdition(), locale);
  const ru = locale === "ru";

  return (
    <>
      <PageHero
        eyebrow={ru ? "Подготовка" : "Prepare"}
        title={ru ? `Готовимся к программе ${current.name}` : `Get ready for ${current.name}`}
        lead={
          ru
            ? "Задания прошлых лет с ответами и примеры задач — с фильтром по предмету и классу, чтобы каждый тренировался на своём уровне."
            : "Past papers with answer keys and sample problems — filtered by subject and grade, so every participant practises at the right level."
        }
      />
      <section className="bg-ivory px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <PrepareBrowser />
        </div>
      </section>
    </>
  );
}
