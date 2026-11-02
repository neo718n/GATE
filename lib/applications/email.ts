import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, type Application } from "@/lib/db/schema";
import { getEdition } from "@/lib/editions";
import { localizeEdition, subjectLabel } from "@/lib/editions-ru";
import { DEFAULT_FROM, resend } from "@/lib/email";
import type { Locale } from "@/lib/i18n/config";
import { CONTACT_METHODS } from "./schema";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const T = {
  en: {
    subject: (ref: string) => `Application received — ${ref}`,
    title: "Application received",
    thanks: (name: string) => `Thank you, ${name}.`,
    paid: "Your payment was successful and your place is reserved.",
    received: "Your application has been received.",
    contact: (channel: string) => `Our team will contact you via <strong>${channel}</strong> with the next steps.`,
    application: "Application",
    participant: "Participant",
    program: "Program",
    subjectGrade: "Subject · Grade",
    grade: (g: number) => `Grade ${g}`,
    paidLabel: "Paid",
    footer: "Questions? WhatsApp +61 469 898 853 or reply to partnerships@gate-assessment.org. Please keep your application number for reference.",
  },
  ru: {
    subject: (ref: string) => `Заявка принята — ${ref}`,
    title: "Заявка принята",
    thanks: (name: string) => `Спасибо, ${name}!`,
    paid: "Оплата прошла успешно, место за вами.",
    received: "Мы получили вашу заявку.",
    contact: (channel: string) => `Наша команда свяжется с вами через <strong>${channel}</strong> и расскажет о следующих шагах.`,
    application: "Заявка",
    participant: "Участник",
    program: "Программа",
    subjectGrade: "Предмет · класс",
    grade: (g: number) => `${g} класс`,
    paidLabel: "Оплачено",
    footer: "Остались вопросы? Пишите в WhatsApp +61 469 898 853 или на partnerships@gate-assessment.org. Сохраните номер заявки — он пригодится.",
  },
};

/**
 * "Application received" email. Sent once per application — the
 * confirmationEmailSentAt stamp guards against Stripe webhook retries.
 */
export async function sendApplicationConfirmation(app: Application, locale: Locale = "en") {
  if (app.confirmationEmailSentAt) return;
  const t = T[locale];
  const base = getEdition(app.editionSlug);
  const edition = base ? localizeEdition(base, locale) : undefined;
  const method = CONTACT_METHODS.find((c) => c.value === app.contactMethod);
  const channel = (locale === "ru" ? method?.labelRu : method?.label) ?? "email";
  const paid = app.status === "paid";

  const rows: [string, string][] = [
    [t.application, app.reference],
    [t.participant, `${app.firstName} ${app.lastName}`],
    [t.program, edition ? `${edition.name} · ${edition.city} · ${edition.dateLabel}` : app.editionSlug],
    [t.subjectGrade, `${subjectLabel(app.subject, locale)} · ${t.grade(app.grade)}`],
    ...(paid && app.amountCents ? ([[t.paidLabel, `$${(app.amountCents / 100).toLocaleString("en-US")}`]] as [string, string][]) : []),
  ];

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM,
    to: app.email,
    subject: t.subject(app.reference),
    html: `<div lang="${locale}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;background:#FAF7F0;border-radius:24px">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.28em;color:#C9993A;margin:0 0 24px">G.A.T.E.</p>
      <h1 style="font-size:28px;font-weight:500;color:#0B1F3A;margin:0 0 10px;font-family:Georgia,serif">${t.title}</h1>
      <p style="font-size:14px;color:#3A4A62;line-height:1.7;margin:0 0 26px">
        ${t.thanks(esc(app.firstName))} ${paid ? t.paid : t.received}
        ${t.contact(esc(channel))}
      </p>
      <table style="width:100%;border-collapse:collapse;background:#FFFFFF;border-radius:18px;overflow:hidden">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:12px 18px;font-size:12px;color:#6B7A90;border-bottom:1px solid #F3EDE0">${k}</td><td style="padding:12px 18px;font-size:14px;color:#0B1F3A;font-weight:600;border-bottom:1px solid #F3EDE0;text-align:right">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="font-size:12px;color:#6B7A90;line-height:1.7;margin:26px 0 0">${t.footer}</p>
    </div>`,
  });
  if (error) throw new Error(error.message);

  await db.update(applications).set({ confirmationEmailSentAt: new Date() }).where(eq(applications.id, app.id));
}
