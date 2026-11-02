import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { CheckCircle2, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { getEdition } from "@/lib/editions";
import { localizeEdition, subjectLabel } from "@/lib/editions-ru";
import { CONTACT_METHODS } from "@/lib/applications/schema";
import { sendApplicationConfirmation } from "@/lib/applications/email";
import { Link } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { MAIN_URL } from "@/lib/portal-urls";

export async function generateMetadata(): Promise<Metadata> {
  const ru = (await getLocale()) === "ru";
  return { title: ru ? "Заявка принята" : "Application received", robots: { index: false } };
}

const T = {
  en: {
    notFound: "We couldn't find that application",
    notFoundLead: "If you completed a payment, please contact us with your email and we'll find it.",
    paidTitle: "You're in!",
    pendingTitle: "Payment is being confirmed",
    paidLead: (name: string, program: string, channel: string) =>
      `Thank you, ${name}. Your payment was successful and your place at ${program} is reserved. We'll contact you via ${channel} with the next steps.`,
    theProgram: "the program",
    pendingLead: "This usually takes a few seconds. Refresh the page shortly — a confirmation email will follow as soon as the payment clears.",
    number: "Application number",
    participant: "Participant",
    program: "Program",
    subjectGrade: "Subject · Grade",
    grade: (g: number) => `Grade ${g}`,
    paid: "Paid",
    sentTo: "Confirmation sent to",
    back: "Back to gate-assessment.org",
  },
  ru: {
    notFound: "Мы не нашли такую заявку",
    notFoundLead: "Если вы уже оплатили участие, напишите нам и укажите свою почту — мы всё найдём.",
    paidTitle: "Вы с нами!",
    pendingTitle: "Подтверждаем оплату",
    paidLead: (name: string, program: string, channel: string) =>
      `Спасибо, ${name}! Оплата прошла успешно, место в программе ${program} за вами. Мы свяжемся с вами через ${channel} и расскажем о следующих шагах.`,
    theProgram: "G.A.T.E.",
    pendingLead: "Обычно это занимает несколько секунд. Обновите страницу чуть позже — письмо с подтверждением придёт, как только платёж пройдёт.",
    number: "Номер заявки",
    participant: "Участник",
    program: "Программа",
    subjectGrade: "Предмет · класс",
    grade: (g: number) => `${g} класс`,
    paid: "Оплачено",
    sentTo: "Подтверждение отправлено на",
    back: "Вернуться на gate-assessment.org",
  },
};

async function loadAndReconcile(reference: string, locale: Locale) {
  let app = await db.query.applications.findFirst({ where: eq(applications.reference, reference) });
  // The webhook normally marks the payment; if the visitor lands here first,
  // confirm with Stripe directly so the page never shows a stale state.
  if (app && app.status === "pending_payment" && app.stripeCheckoutSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(app.stripeCheckoutSessionId);
      if (session.payment_status === "paid") {
        [app] = await db
          .update(applications)
          .set({
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: (session.payment_intent as string | null) ?? null,
            updatedAt: new Date(),
          })
          .where(eq(applications.id, app.id))
          .returning();
        await sendApplicationConfirmation(app, locale).catch((e) => console.error("Application email failed:", e));
      }
    } catch (e) {
      console.error("Stripe reconcile failed:", e);
    }
  }
  return app;
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const locale = await getLocale();
  const t = T[locale];
  const { ref } = await searchParams;
  const app = ref ? await loadAndReconcile(ref, locale) : undefined;
  const base = app ? getEdition(app.editionSlug) : undefined;
  const edition = base ? localizeEdition(base, locale) : undefined;
  const paid = app?.status === "paid";
  const method = CONTACT_METHODS.find((c) => c.value === app?.contactMethod);
  const channel = (locale === "ru" ? method?.labelRu : method?.label) ?? "email";

  return (
    <div className="relative overflow-hidden">
      <div className="gold-aura pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 py-20 text-center md:py-28">
        {!app ? (
          <>
            <h1 className="font-serif text-4xl font-medium text-ink">{t.notFound}</h1>
            <p className="text-ink-2">{t.notFoundLead}</p>
          </>
        ) : (
          <>
            <span className={`flex h-20 w-20 items-center justify-center rounded-full ${paid ? "bg-gate-gold text-ink" : "bg-ivory-2 text-ink-3"}`}>
              {paid ? <CheckCircle2 className="h-10 w-10" /> : <Clock className="h-10 w-10" />}
            </span>
            <h1 className="font-serif text-4xl font-medium leading-tight text-ink md:text-6xl">{paid ? t.paidTitle : t.pendingTitle}</h1>
            <p className="max-w-lg text-[15px] leading-relaxed text-ink-2">
              {paid ? t.paidLead(app.firstName, edition?.name ?? t.theProgram, channel) : t.pendingLead}
            </p>
            <div className="w-full rounded-[2rem] border border-line bg-white p-6 text-left shadow-[0_40px_80px_-50px_rgba(11,31,58,0.4)]">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(
                  [
                    [t.number, app.reference],
                    [t.participant, `${app.firstName} ${app.lastName}`],
                    [t.program, edition ? `${edition.name} · ${edition.dateLabel}` : app.editionSlug],
                    [t.subjectGrade, `${subjectLabel(app.subject, locale)} · ${t.grade(app.grade)}`],
                    ...(paid && app.amountCents ? [[t.paid, `$${(app.amountCents / 100).toLocaleString("en-US")}`]] : []),
                    [t.sentTo, app.email],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">{k}</dt>
                    <dd className={`text-[15px] font-semibold text-ink ${k === t.number ? "font-serif text-2xl tracking-wide" : ""}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        )}
        <Link href={MAIN_URL} className="inline-flex h-12 items-center rounded-full border border-ink/15 bg-white px-6 text-[14px] font-semibold text-ink hover:border-gate-gold">
          {t.back}
        </Link>
      </div>
    </div>
  );
}
