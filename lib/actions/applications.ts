"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, repInviteLinks, representatives } from "@/lib/db/schema";
import { getCurrentEdition } from "@/lib/editions";
import { stripe } from "@/lib/stripe";
import { requireRole } from "@/lib/authz";
import { applicationSchema, makeReference, type ApplicationInput } from "@/lib/applications/schema";
import { sendApplicationConfirmation } from "@/lib/applications/email";
import { requestRepCode, requireRep, signOutRep, verifyRepCode } from "@/lib/reps/auth";
import { localizePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { localizeEdition, subjectLabel } from "@/lib/editions-ru";

type FieldErrors = Partial<Record<keyof ApplicationInput | "form", string>>;
export type SubmitResult =
  | { ok: true; checkoutUrl?: string; reference: string }
  | { ok: false; errors: FieldErrors };

async function validate(raw: unknown): Promise<{ ok: true; data: ApplicationInput } | { ok: false; errors: FieldErrors }> {
  const parsed = applicationSchema(getCurrentEdition(), await getLocale()).safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = (issue.path[0] as keyof ApplicationInput) ?? "form";
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

function rowFrom(data: ApplicationInput) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    country: data.country,
    city: data.city,
    school: data.school,
    grade: data.grade,
    subject: data.subject,
    email: data.email,
    contactMethod: data.contactMethod,
    contactValue: data.contactMethod === "email" ? data.email : data.contactValue,
    guardianName: data.guardianName,
    guardianPhone: data.guardianPhone,
    confirmedAt: new Date(),
  };
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "apply.gate-assessment.org";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/* ───────────────────────── Individual (online payment) ───────────────────────── */

export async function submitIndividualApplication(raw: unknown): Promise<SubmitResult> {
  const v = await validate(raw);
  if (!v.ok) return v;
  const locale = await getLocale();
  const ru = locale === "ru";
  const edition = getCurrentEdition();
  if (!edition.price) {
    return {
      ok: false,
      errors: { form: ru ? "Онлайн-оплата для этой программы пока не открыта." : "Online payment isn't open for this program yet." },
    };
  }
  const shown = localizeEdition(edition, locale);

  const amountCents = edition.price.amount * 100;
  const reference = makeReference(edition);
  const [app] = await db
    .insert(applications)
    .values({
      ...rowFrom(v.data),
      reference,
      editionSlug: edition.slug,
      source: "individual",
      status: "pending_payment",
      amountCents,
    })
    .returning();

  const base = await origin();
  // GATE absorbs the card fee: the family is charged exactly the program fee.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: ru ? "ru" : "en",
    customer_email: app.email,
    client_reference_id: reference,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: ru ? `${shown.name} — стоимость участия` : `${edition.name} — program fee`,
            description: ru
              ? `${app.firstName} ${app.lastName} · ${subjectLabel(app.subject, locale)} · ${app.grade} класс · ${shown.city}, ${shown.dateLabel}`
              : `${app.firstName} ${app.lastName} · ${app.subject} · Grade ${app.grade} · ${edition.city}, ${edition.dateLabel}`,
          },
        },
      },
    ],
    // `locale` lets the webhook send the confirmation email in the visitor's language.
    metadata: { kind: "application", applicationId: String(app.id), reference, locale },
    success_url: `${base}${localizePath("/success", locale)}?ref=${reference}`,
    cancel_url: `${base}${localizePath("/", locale)}?cancelled=${reference}`,
  });

  await db.update(applications).set({ stripeCheckoutSessionId: session.id }).where(eq(applications.id, app.id));
  return { ok: true, checkoutUrl: session.url ?? undefined, reference };
}

/* ───────────────────────── Representative link (no payment) ───────────────────────── */

export async function submitLinkApplication(token: string, raw: unknown): Promise<SubmitResult> {
  const link = await db.query.repInviteLinks.findFirst({
    where: and(eq(repInviteLinks.token, token), eq(repInviteLinks.active, true)),
    with: { representative: true },
  });
  const locale = await getLocale();
  if (!link || !link.representative.active) {
    return {
      ok: false,
      errors: {
        form:
          locale === "ru"
            ? "Эта ссылка для регистрации больше не действует. Попросите у представителя новую."
            : "This registration link is no longer active. Please ask your representative for a new one.",
      },
    };
  }
  const v = await validate(raw);
  if (!v.ok) return v;
  const edition = getCurrentEdition();
  const [app] = await db
    .insert(applications)
    .values({
      ...rowFrom(v.data),
      reference: makeReference(edition),
      editionSlug: edition.slug,
      source: "representative",
      status: "submitted",
      representativeId: link.representativeId,
      inviteLinkId: link.id,
    })
    .returning();
  await sendApplicationConfirmation(app, locale).catch((e) => console.error("Application email failed:", e));
  return { ok: true, reference: app.reference };
}

/* ───────────────────────── Representative portal ───────────────────────── */

export async function repRequestCode(email: string) {
  return requestRepCode(email);
}

export async function repVerifyCode(email: string, code: string) {
  return verifyRepCode(email, code);
}

export async function repSignOut() {
  await signOutRep();
}

export async function repAddStudent(raw: unknown): Promise<SubmitResult> {
  const rep = await requireRep();
  const v = await validate(raw);
  if (!v.ok) return v;
  const edition = getCurrentEdition();
  const [app] = await db
    .insert(applications)
    .values({
      ...rowFrom(v.data),
      reference: makeReference(edition),
      editionSlug: edition.slug,
      source: "representative",
      status: "submitted",
      representativeId: rep.id,
    })
    .returning();
  revalidatePath("/rep", "layout");
  return { ok: true, reference: app.reference };
}

export async function repUpdateStudent(id: number, raw: unknown): Promise<SubmitResult> {
  const rep = await requireRep();
  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.id, id), eq(applications.representativeId, rep.id)),
  });
  if (!existing) {
    return { ok: false, errors: { form: (await getLocale()) === "ru" ? "Ученик не найден." : "Student not found." } };
  }
  const v = await validate(raw);
  if (!v.ok) return v;
  await db
    .update(applications)
    .set({ ...rowFrom(v.data), updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/rep", "layout");
  return { ok: true, reference: existing.reference };
}

export async function repRemoveStudent(id: number) {
  const rep = await requireRep();
  await db
    .update(applications)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.representativeId, rep.id)));
  revalidatePath("/rep", "layout");
}

export async function repCreateLink(label: string) {
  const rep = await requireRep();
  const clean = label.trim().slice(0, 80) || ((await getLocale()) === "ru" ? "Ссылка для регистрации" : "Registration link");
  const token = randomBytes(9).toString("base64url");
  await db.insert(repInviteLinks).values({ representativeId: rep.id, token, label: clean });
  revalidatePath("/rep", "layout");
  return { token };
}

export async function repToggleLink(id: number, active: boolean) {
  const rep = await requireRep();
  await db
    .update(repInviteLinks)
    .set({ active })
    .where(and(eq(repInviteLinks.id, id), eq(repInviteLinks.representativeId, rep.id)));
  revalidatePath("/rep", "layout");
}

/* ───────────────────────── Admin: representative whitelist ───────────────────────── */

export async function adminAddRepresentative(formData: FormData) {
  await requireRole(["super_admin", "admin"]);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!email.includes("@") || name.length < 2) return { ok: false as const, error: "Name and a valid email are required." };
  await db
    .insert(representatives)
    .values({
      email,
      name,
      organization: String(formData.get("organization") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
    })
    .onConflictDoUpdate({ target: representatives.email, set: { name, active: true, updatedAt: new Date() } });
  revalidatePath("/admin/representatives");
  return { ok: true as const };
}

export async function adminSetRepresentativeActive(id: number, active: boolean) {
  await requireRole(["super_admin", "admin"]);
  await db.update(representatives).set({ active, updatedAt: new Date() }).where(eq(representatives.id, id));
  revalidatePath("/admin/representatives");
}
