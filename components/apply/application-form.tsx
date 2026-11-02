"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentEdition } from "@/lib/editions";
import { localizeEdition, subjectLabel } from "@/lib/editions-ru";
import {
  CONTACT_METHODS,
  ageOn,
  applicationSchema,
  subjectsForGrade,
  type ApplicationInput,
  type ContactMethod,
} from "@/lib/applications/schema";
import type { SubmitResult } from "@/lib/actions/applications";
import { Link, useLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { ChipGroup, CountrySelect, DateOfBirthPicker, Field, LatinInput, inputClass } from "./fields";
import { cn } from "@/lib/utils";

export type FormMode = "individual" | "link" | "rep";

type Values = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "";
  country: string;
  city: string;
  school: string;
  grade: number | undefined;
  subject: string;
  email: string;
  contactMethod: ContactMethod;
  contactValue: string;
  guardianName: string;
  guardianPhone: string;
  confirmAccuracy: boolean;
  confirmTerms: boolean;
  confirmGuardian: boolean;
};

const EMPTY: Values = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  country: "",
  city: "",
  school: "",
  grade: undefined,
  subject: "",
  email: "",
  contactMethod: "whatsapp",
  contactValue: "",
  guardianName: "",
  guardianPhone: "",
  confirmAccuracy: false,
  confirmTerms: false,
  confirmGuardian: false,
};

const STEP_FIELDS = [
  ["firstName", "lastName", "dateOfBirth", "gender", "country", "city", "school", "grade", "subject"],
  ["email", "contactMethod", "contactValue", "guardianName", "guardianPhone"],
  ["confirmAccuracy", "confirmTerms", "confirmGuardian"],
] as const;

type Errors = Partial<Record<keyof Values | "form", string>>;

const T = {
  en: {
    steps: ["Participant", "Contact", "Review"],
    payment: "Payment",
    addStudent: "Add a student",
    registeringWith: (p: string) => `Registering with ${p}`,
    application: "Application",
    fee: "Program fee",
    privacy: "Your details are used only for this program.",
    continueToPayment: (price: string) => `Continue to payment · ${price}`,
    saveStudent: "Save student",
    submitApplication: "Submit application",
    step: (n: number) => `Step ${n}`,
    s1Title: "About the participant",
    s1Lead: "Write the name exactly as in the passport, in Latin letters.",
    firstName: "First name",
    lastName: "Last name",
    dob: "Date of birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    country: "Country",
    detected: "Detected from your location — change it if needed",
    city: "City",
    school: "School",
    grade: "Grade",
    subject: "Subject",
    gradeFirst: "Choose the grade first to see the subjects open to it.",
    grades: (a: number, b: number) => `Grades ${a}–${b}`,
    s2Title: "How can we reach you?",
    s2Lead: "Choose the channel that works best — we'll contact you there with the next steps.",
    email: "Email",
    preferred: "Preferred way to contact",
    handle: (label: string, instagram: boolean) => `${label} ${instagram ? "username" : "number or username"}`,
    guardian: "Parent or guardian",
    fullName: "Full name",
    phone: "Phone (with country code)",
    s3Title: "Check and confirm",
    s3Lead: "Please review everything carefully — certificates and visa documents use these details.",
    confirmAccuracy: "All details are correct and the name matches the participant's passport.",
    accept: "I accept the",
    terms: "Terms of Participation",
    and: "and",
    rules: "Rules",
    consent: "As the parent or guardian, I consent to the participant taking part in the program.",
    back: "Back",
    next: "Continue",
    stripe: "Secure payment by Stripe",
    edit: "Edit",
    name: "Name",
    countryCity: "Country · City",
    gradeSubject: "Grade · Subject",
    gradeN: (g: number | undefined) => `Grade ${g}`,
    contactVia: "Contact via",
    guardianRow: "Parent / guardian",
    received: "Application received",
    partnerNext: (p: string) => `${p} will be in touch with the next steps.`,
    teamNext: "Our team will contact you with the next steps.",
    confirmationSent: "A confirmation was sent to",
    number: "Application number",
  },
  ru: {
    steps: ["Участник", "Контакты", "Проверка"],
    payment: "Оплата",
    addStudent: "Новый ученик",
    registeringWith: (p: string) => `Регистрация через ${p}`,
    application: "Заявка",
    fee: "Стоимость участия",
    privacy: "Ваши данные используются только для этой программы.",
    continueToPayment: (price: string) => `Перейти к оплате · ${price}`,
    saveStudent: "Сохранить ученика",
    submitApplication: "Отправить заявку",
    step: (n: number) => `Шаг ${n}`,
    s1Title: "Об участнике",
    s1Lead: "Имя и фамилию пишите латиницей — точно как в загранпаспорте.",
    firstName: "Имя",
    lastName: "Фамилия",
    dob: "Дата рождения",
    gender: "Пол",
    male: "Мужской",
    female: "Женский",
    country: "Страна",
    detected: "Определили по вашему местоположению — при необходимости измените",
    city: "Город",
    school: "Школа",
    grade: "Класс",
    subject: "Предмет",
    gradeFirst: "Сначала выберите класс — покажем доступные предметы.",
    grades: (a: number, b: number) => `${a}–${b} классы`,
    s2Title: "Как с вами связаться?",
    s2Lead: "Выберите удобный канал — именно там мы расскажем о следующих шагах.",
    email: "Электронная почта",
    preferred: "Удобный способ связи",
    handle: (label: string, instagram: boolean) => (instagram ? `Имя пользователя в ${label}` : `${label}: номер или имя пользователя`),
    guardian: "Родитель или законный представитель",
    fullName: "Имя и фамилия",
    phone: "Телефон (с кодом страны)",
    s3Title: "Проверьте и подтвердите",
    s3Lead: "Внимательно проверьте данные — по ним оформляются сертификаты и документы для визы.",
    confirmAccuracy: "Все данные верны, а имя совпадает с загранпаспортом участника.",
    accept: "Я принимаю",
    terms: "Условия участия",
    and: "и",
    rules: "Правила",
    consent: "Как родитель или законный представитель, я даю согласие на участие ребёнка в программе.",
    back: "Назад",
    next: "Далее",
    stripe: "Безопасная оплата через Stripe",
    edit: "Изменить",
    name: "Имя",
    countryCity: "Страна · город",
    gradeSubject: "Класс · предмет",
    gradeN: (g: number | undefined) => `${g} класс`,
    contactVia: "Способ связи",
    guardianRow: "Родитель",
    received: "Заявка принята",
    partnerNext: (p: string) => `${p} свяжется с вами и расскажет о следующих шагах.`,
    teamNext: "Наша команда свяжется с вами и расскажет о следующих шагах.",
    confirmationSent: "Подтверждение отправлено на",
    number: "Номер заявки",
  },
};

type Dict = (typeof T)["en"];

const methodLabel = (c: (typeof CONTACT_METHODS)[number], locale: Locale) => (locale === "ru" ? c.labelRu : c.label);

export function ApplicationForm({
  mode,
  submit,
  initial,
  partnerName,
  onSaved,
  submitLabel,
  detectedCountry,
}: {
  mode: FormMode;
  submit: (values: unknown) => Promise<SubmitResult>;
  initial?: Partial<Values>;
  partnerName?: string;
  onSaved?: (reference: string) => void;
  submitLabel?: string;
  /** Country guessed from the visitor's IP; pre-selected but editable. */
  detectedCountry?: string;
}) {
  const locale = useLocale();
  const t: Dict = T[locale];
  const edition = getCurrentEdition();
  const shown = localizeEdition(edition, locale);
  const schema = useMemo(() => applicationSchema(edition, locale), [edition, locale]);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [values, setValues] = useState<Values>({
    ...EMPTY,
    ...(detectedCountry ? { country: detectedCountry } : {}),
    ...initial,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Values>(key: K, v: Values[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      // A grade change can make the chosen subject unavailable.
      if (key === "grade" && next.subject) {
        const ok = subjectsForGrade(edition, v as number).some((s) => s.name === next.subject);
        if (!ok) next.subject = "";
      }
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const isMinor = values.dateOfBirth
    ? ageOn(values.dateOfBirth, new Date(`${edition.startDate}T00:00:00Z`)) < 18
    : true;

  function check(stepIndex: number): boolean {
    const parsed = schema.safeParse(values);
    if (parsed.success) return true;
    const want = new Set<string>(STEP_FIELDS.slice(0, stepIndex + 1).flatMap((s) => s as readonly string[]));
    const next: Errors = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]) as keyof Values;
      if (want.has(key) && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const go = (to: number) => {
    if (to > step && !check(step)) return;
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = () => {
    if (!check(STEP_FIELDS.length - 1)) return;
    startTransition(async () => {
      const res = await submit(values as unknown as ApplicationInput);
      if (!res.ok) {
        setErrors(res.errors as Errors);
        const firstStep = STEP_FIELDS.findIndex((s) => (s as readonly string[]).some((f) => f in res.errors));
        if (firstStep >= 0 && firstStep !== step) {
          setDir(-1);
          setStep(firstStep);
        }
        return;
      }
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      if (onSaved) onSaved(res.reference);
      else setDone(res.reference);
    });
  };

  if (done) return <SubmittedPanel t={t} reference={done} partnerName={partnerName} email={values.email} />;

  const subjects = subjectsForGrade(edition, values.grade);
  const grades = Array.from({ length: edition.grades[1] - edition.grades[0] + 1 }, (_, i) => edition.grades[0] + i);
  const method = CONTACT_METHODS.find((c) => c.value === values.contactMethod)!;
  const finalLabel =
    submitLabel ??
    (mode === "individual" && edition.price
      ? t.continueToPayment(shown.price?.label ?? edition.price.label)
      : mode === "rep"
        ? t.saveStudent
        : t.submitApplication);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr] lg:gap-10">
      {/* Summary rail */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-[2rem] bg-ink p-6 text-ivory shadow-[0_40px_80px_-40px_rgba(11,31,58,0.6)] md:p-7">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-gold-2">
            {mode === "rep" ? t.addStudent : partnerName ? t.registeringWith(partnerName) : t.application}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-medium leading-tight">{shown.name}</h2>
          <p className="mt-1 text-[13px] text-ivory/70">
            {shown.host} · {shown.city}
            <br />
            {shown.dateLabel}
          </p>
          {mode === "individual" && shown.price && (
            <div className="mt-5 flex items-end justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-[12px] text-ivory/70">{t.fee}</span>
              <span className="font-serif text-3xl font-medium text-gate-gold-2">{shown.price.label}</span>
            </div>
          )}
          <ol className="mt-6 flex flex-col gap-1">
            {[...t.steps, ...(mode === "individual" ? [t.payment] : [])].map((label, i) => {
              const state = i < step ? "done" : i === step ? "current" : "todo";
              return (
                <li key={label} className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                      state === "done" && "bg-gate-gold text-ink",
                      state === "current" && "bg-white text-ink",
                      state === "todo" && "bg-white/10 text-ivory/50",
                    )}
                  >
                    {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn("text-[14px]", state === "todo" ? "text-ivory/50" : "text-ivory")}>{label}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <p className="mt-4 flex items-center gap-2 px-2 text-[12px] text-ink-3">
          <ShieldCheck className="h-4 w-4 text-gate-gold" /> {t.privacy}
        </p>
      </aside>

      {/* Form card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,31,58,0.4)] md:p-10">
        <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-ivory-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gate-gold to-gate-gold-2"
            animate={{ width: `${((step + 1) / STEP_FIELDS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-7"
          >
            {step === 0 && (
              <>
                <StepHeading eyebrow={t.step(1)} title={t.s1Title} lead={t.s1Lead} />
                <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
                  <Field label={t.firstName} error={errors.firstName} htmlFor="firstName">
                    <LatinInput id="firstName" value={values.firstName} onChange={(v) => set("firstName", v)} invalid={!!errors.firstName} placeholder="e.g. Emma" autoComplete="given-name" />
                  </Field>
                  <Field label={t.lastName} error={errors.lastName} htmlFor="lastName">
                    <LatinInput id="lastName" value={values.lastName} onChange={(v) => set("lastName", v)} invalid={!!errors.lastName} placeholder="e.g. Schneider" autoComplete="family-name" />
                  </Field>
                  <Field label={t.dob} error={errors.dateOfBirth} htmlFor="dob">
                    <DateOfBirthPicker id="dob" value={values.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} invalid={!!errors.dateOfBirth} />
                  </Field>
                  <Field label={t.gender} error={errors.gender}>
                    <ChipGroup
                      layoutGroup="gender"
                      columns="grid-cols-2"
                      value={values.gender || undefined}
                      onChange={(v) => set("gender", v)}
                      options={[
                        { value: "male", label: t.male },
                        { value: "female", label: t.female },
                      ]}
                    />
                  </Field>
                  <Field
                    label={t.country}
                    error={errors.country}
                    htmlFor="country"
                    hint={detectedCountry && values.country === detectedCountry ? t.detected : undefined}
                  >
                    <CountrySelect id="country" value={values.country} onChange={(v) => set("country", v)} invalid={!!errors.country} />
                  </Field>
                  <Field label={t.city} error={errors.city} htmlFor="city">
                    <LatinInput id="city" value={values.city} onChange={(v) => set("city", v)} invalid={!!errors.city} placeholder="e.g. Vienna" />
                  </Field>
                  <Field label={t.school} error={errors.school} htmlFor="school" className="sm:col-span-2">
                    <LatinInput id="school" value={values.school} onChange={(v) => set("school", v)} invalid={!!errors.school} placeholder="e.g. St. Mary's Grammar School" />
                  </Field>
                </div>
                <Field label={t.grade} error={errors.grade}>
                  <ChipGroup
                    layoutGroup="grade"
                    columns="grid-cols-6 sm:grid-cols-12"
                    value={values.grade}
                    onChange={(v) => set("grade", v)}
                    options={grades.map((g) => ({ value: g, label: String(g) }))}
                  />
                </Field>
                <Field label={t.subject} error={errors.subject} hint={values.grade ? undefined : t.gradeFirst}>
                  <ChipGroup
                    layoutGroup="subject"
                    columns="grid-cols-2 sm:grid-cols-3"
                    value={values.subject || undefined}
                    onChange={(v) => set("subject", v)}
                    options={edition.subjects.map((s) => ({
                      value: s.name,
                      label: subjectLabel(s.name, locale),
                      hint: t.grades(s.grades[0], s.grades[1]),
                      disabled: !!values.grade && !subjects.some((x) => x.name === s.name),
                    }))}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <StepHeading eyebrow={t.step(2)} title={t.s2Title} lead={t.s2Lead} />
                <Field label={t.email} error={errors.email} htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value.replace(/[^\u0000-\u007F]/g, ""))}
                    className={inputClass(!!errors.email)}
                    placeholder="name@example.com"
                  />
                </Field>
                <Field label={t.preferred} error={errors.contactMethod}>
                  <ChipGroup
                    layoutGroup="contact"
                    columns="grid-cols-2 sm:grid-cols-5"
                    value={values.contactMethod}
                    onChange={(v) => set("contactMethod", v)}
                    options={CONTACT_METHODS.map((c) => ({ value: c.value, label: methodLabel(c, locale) }))}
                  />
                </Field>
                {values.contactMethod !== "email" && (
                  <Field label={t.handle(methodLabel(method, locale), values.contactMethod === "instagram")} error={errors.contactValue} htmlFor="contactValue">
                    <LatinInput id="contactValue" value={values.contactValue} onChange={(v) => set("contactValue", v)} invalid={!!errors.contactValue} placeholder={method.placeholder} />
                  </Field>
                )}
                <div className="rounded-[1.5rem] bg-ivory p-5 md:p-6">
                  <p className="mb-5 text-[13px] font-semibold text-ink">{t.guardian}</p>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2">
                    <Field label={t.fullName} error={errors.guardianName} htmlFor="guardianName">
                      <LatinInput id="guardianName" value={values.guardianName} onChange={(v) => set("guardianName", v)} invalid={!!errors.guardianName} placeholder="e.g. Anna Schneider" />
                    </Field>
                    <Field label={t.phone} error={errors.guardianPhone} htmlFor="guardianPhone">
                      <input
                        id="guardianPhone"
                        inputMode="tel"
                        value={values.guardianPhone}
                        onChange={(e) => set("guardianPhone", e.target.value.replace(/[^+0-9\s()-]/g, ""))}
                        className={inputClass(!!errors.guardianPhone)}
                        placeholder="+44 7700 900456"
                      />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <StepHeading eyebrow={t.step(3)} title={t.s3Title} lead={t.s3Lead} />
                <ReviewList t={t} locale={locale} values={values} onEdit={(s) => go(s)} />
                <div className="flex flex-col gap-3">
                  <Confirm checked={values.confirmAccuracy} onChange={(v) => set("confirmAccuracy", v)} error={errors.confirmAccuracy}>
                    {t.confirmAccuracy}
                  </Confirm>
                  <Confirm checked={values.confirmTerms} onChange={(v) => set("confirmTerms", v)} error={errors.confirmTerms}>
                    {t.accept}{" "}
                    <Link href="https://gate-assessment.org/terms" target="_blank" className="font-semibold text-ink underline underline-offset-2">
                      {t.terms}
                    </Link>{" "}
                    {t.and}{" "}
                    <Link href="https://gate-assessment.org/rules" target="_blank" className="font-semibold text-ink underline underline-offset-2">
                      {t.rules}
                    </Link>
                    .
                  </Confirm>
                  {isMinor && (
                    <Confirm checked={values.confirmGuardian} onChange={(v) => set("confirmGuardian", v)} error={errors.confirmGuardian}>
                      {t.consent}
                    </Confirm>
                  )}
                </div>
                {errors.form && <p className="rounded-2xl bg-[#b03030]/10 px-4 py-3 text-[13px] font-medium text-[#b03030]">{errors.form}</p>}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-ink-2 transition-colors hover:bg-ivory">
              <ArrowLeft className="h-4 w-4" /> {t.back}
            </button>
          ) : (
            <span />
          )}
          {step < STEP_FIELDS.length - 1 ? (
            <button type="button" onClick={() => go(step + 1)} className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[14px] font-semibold text-ivory transition-colors hover:bg-gate-700">
              {t.next} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={pending}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gate-gold px-7 text-[14px] font-semibold text-ink shadow-[0_14px_30px_-12px_rgba(201,153,58,0.7)] transition-colors hover:bg-gate-gold-2 disabled:opacity-70"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "individual" ? <CreditCard className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {finalLabel}
            </button>
          )}
        </div>
        {mode === "individual" && step === STEP_FIELDS.length - 1 && (
          <p className="mt-4 flex items-center justify-end gap-1.5 text-[12px] text-ink-3">
            <Lock className="h-3.5 w-3.5" /> {t.stripe}
          </p>
        )}
      </div>
    </div>
  );
}

function StepHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gate-gold">{eyebrow}</span>
      <h3 className="font-serif text-3xl font-medium text-ink md:text-4xl">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-2">{lead}</p>
    </div>
  );
}

function Confirm({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-[14px] leading-relaxed transition-colors",
          checked ? "border-gate-gold bg-gate-gold/10 text-ink" : error ? "border-[#b03030]/50 text-ink-2" : "border-ink/10 text-ink-2 hover:border-gate-gold",
        )}
      >
        <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", checked ? "border-ink bg-ink text-ivory" : "border-ink/25 bg-white")}>
          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span>{children}</span>
      </button>
      {error && <p className="mt-1.5 px-1 text-[12px] font-medium text-[#b03030]">{error}</p>}
    </div>
  );
}

function ReviewList({ t, locale, values, onEdit }: { t: Dict; locale: Locale; values: Values; onEdit: (step: number) => void }) {
  const method = CONTACT_METHODS.find((c) => c.value === values.contactMethod)!;
  const dob = values.dateOfBirth
    ? new Date(`${values.dateOfBirth}T00:00:00`).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const groups: { step: number; title: string; rows: [string, string][] }[] = [
    {
      step: 0,
      title: t.steps[0],
      rows: [
        [t.name, `${values.firstName} ${values.lastName}`],
        [t.dob, dob],
        [t.gender, values.gender === "male" ? t.male : t.female],
        [t.countryCity, `${values.country} · ${values.city}`],
        [t.school, values.school],
        [t.gradeSubject, `${t.gradeN(values.grade)} · ${subjectLabel(values.subject, locale)}`],
      ],
    },
    {
      step: 1,
      title: t.steps[1],
      rows: [
        [t.email, values.email],
        [t.contactVia, values.contactMethod === "email" ? t.email : `${methodLabel(method, locale)} · ${values.contactValue}`],
        [t.guardianRow, `${values.guardianName} · ${values.guardianPhone}`],
      ],
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <div key={g.title} className="rounded-[1.5rem] bg-ivory p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">{g.title}</span>
            <button type="button" onClick={() => onEdit(g.step)} className="text-[12px] font-semibold text-gate-gold hover:underline">
              {t.edit}
            </button>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {g.rows.map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <dt className="text-[11px] text-ink-3">{k}</dt>
                <dd className="text-[14px] font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function SubmittedPanel({ t, reference, partnerName, email }: { t: Dict; reference: string; partnerName?: string; email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-[2rem] border border-line bg-white p-10 text-center shadow-[0_40px_80px_-50px_rgba(11,31,58,0.4)]"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gate-gold text-ink"
      >
        <Sparkles className="h-7 w-7" />
      </motion.span>
      <h2 className="font-serif text-4xl font-medium text-ink">{t.received}</h2>
      <p className="text-[15px] leading-relaxed text-ink-2">
        {partnerName ? t.partnerNext(partnerName) : t.teamNext} {t.confirmationSent} <strong className="text-ink">{email}</strong>.
      </p>
      <div className="rounded-2xl bg-ivory px-6 py-4">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3">{t.number}</span>
        <span className="font-serif text-3xl font-medium tracking-wide text-ink">{reference}</span>
      </div>
    </motion.div>
  );
}
