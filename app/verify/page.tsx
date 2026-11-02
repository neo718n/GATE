import { ShieldCheck, Hash, FileCheck2 } from "lucide-react";
import { VerifyCodeForm } from "@/components/verify/verify-code-form";
import { getLocale, pageMetadata } from "@/lib/i18n/server";

export const generateMetadata = () =>
  pageMetadata("/verify", {
    en: {
      title: "Verify a Certificate · G.A.T.E.",
      description: "Independently verify any G.A.T.E. certificate issued by the G.A.T.E. Assessment Authority.",
    },
    ru: {
      title: "Проверка сертификата · G.A.T.E.",
      description: "Проверьте подлинность любого сертификата G.A.T.E., выданного G.A.T.E. Assessment Authority.",
    },
  });

const T = {
  en: {
    badge: "Official Verification",
    title: "Verify a G.A.T.E. Certificate",
    lead: "Enter the verification code printed on the certificate, or scan its QR code, to confirm authenticity.",
    how: "How verification works",
    steps: [
      { icon: Hash, title: "Unique code", body: "Every certificate carries an unguessable code with a cryptographic signature." },
      {
        icon: FileCheck2,
        title: "Authoritative source",
        body: "Results are matched against the official G.A.T.E. Assessment registry — not the certificate file itself.",
      },
      { icon: ShieldCheck, title: "Tamper-evident", body: "Any modification to a code or its embedded signature will fail verification." },
    ],
  },
  ru: {
    badge: "Официальная проверка",
    title: "Проверка сертификата G.A.T.E.",
    lead: "Введите код проверки, напечатанный на сертификате, или отсканируйте QR-код — и убедитесь в его подлинности.",
    how: "Как устроена проверка",
    steps: [
      { icon: Hash, title: "Уникальный код", body: "У каждого сертификата свой код с криптографической подписью — подобрать его невозможно." },
      {
        icon: FileCheck2,
        title: "Официальный источник",
        body: "Данные сверяются с официальным реестром G.A.T.E. Assessment, а не с самим файлом сертификата.",
      },
      { icon: ShieldCheck, title: "Защита от подделки", body: "Любое изменение кода или встроенной подписи — и проверка не пройдёт." },
    ],
  },
};

export default async function VerifyPage() {
  const t = T[await getLocale()];
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center space-y-3 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          <ShieldCheck className="h-3 w-3 text-gate-gold" aria-hidden />
          {t.badge}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{t.title}</h1>
        <p className="text-sm sm:text-base text-foreground/60 max-w-md mx-auto">{t.lead}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
        <VerifyCodeForm />
      </div>

      <section aria-labelledby="how-it-works" className="mt-12 sm:mt-16 border-t border-border/60 pt-10">
        <h2 id="how-it-works" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50 text-center mb-6">
          {t.how}
        </h2>
        <ol className="grid sm:grid-cols-3 gap-6 text-sm">
          {t.steps.map((s) => (
            <li key={s.title} className="space-y-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gate-gold/10 text-gate-gold">
                <s.icon className="h-4 w-4" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="text-foreground/60 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
