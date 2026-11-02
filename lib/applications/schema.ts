import { z } from "zod";
import { getCurrentEdition, type Edition } from "@/lib/editions";
import type { Locale } from "@/lib/i18n/config";

// Names must match the passport, so only Latin letters are accepted.
const LATIN_NAME = /^[A-Za-z][A-Za-z\s'.-]*$/;
const LATIN_TEXT = /^[A-Za-z0-9][A-Za-z0-9\s'.,&()/-]*$/;
// Handles and numbers: Latin, digits and the usual punctuation.
const CONTACT = /^[A-Za-z0-9@+_.\-\s()/:]+$/;

const MESSAGES = {
  en: {
    required: (label: string) => `${label} is required`,
    latinName: (label: string) => `${label}: Latin letters only, as in the passport`,
    latinText: (label: string) => `${label}: Latin characters only`,
    firstName: "First name",
    lastName: "Last name",
    city: "City",
    school: "School",
    guardianName: "Parent / guardian name",
    dob: "Date of birth is required",
    gender: "Select gender",
    country: "Country is required",
    grade: "Select grade",
    subject: "Select a subject",
    email: "Enter a valid email",
    contactLatin: "Latin characters only",
    requiredShort: "Required",
    guardianPhone: "Parent / guardian phone is required",
    phoneDigits: "Digits only, with country code",
    confirmAccuracy: "Please confirm the details match the passport",
    confirmTerms: "Please accept the Terms and Rules",
    subjectGrade: "This subject isn't open to the selected grade",
    contactValue: "Tell us your number or username",
    dobCheck: "Please check the date of birth",
    guardianConsent: "A parent or guardian must consent for participants under 18",
  },
  ru: {
    required: (label: string) => `Заполните поле «${label}»`,
    latinName: (label: string) => `${label}: только латиница, как в загранпаспорте`,
    latinText: (label: string) => `${label}: только латинские буквы`,
    firstName: "Имя",
    lastName: "Фамилия",
    city: "Город",
    school: "Школа",
    guardianName: "Имя родителя",
    dob: "Укажите дату рождения",
    gender: "Выберите пол",
    country: "Выберите страну",
    grade: "Выберите класс",
    subject: "Выберите предмет",
    email: "Проверьте адрес электронной почты",
    contactLatin: "Только латинские буквы и цифры",
    requiredShort: "Обязательное поле",
    guardianPhone: "Укажите телефон родителя",
    phoneDigits: "Только цифры, с кодом страны",
    confirmAccuracy: "Подтвердите, что данные совпадают с паспортом",
    confirmTerms: "Примите Условия участия и Правила",
    subjectGrade: "Этот предмет недоступен для выбранного класса",
    contactValue: "Укажите номер или имя пользователя",
    dobCheck: "Проверьте дату рождения",
    guardianConsent: "Для участников младше 18 лет нужно согласие родителя или законного представителя",
  },
};

export const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp", labelRu: "WhatsApp", placeholder: "+44 7700 900123" },
  { value: "telegram", label: "Telegram", labelRu: "Telegram", placeholder: "@username or +44…" },
  { value: "instagram", label: "Instagram", labelRu: "Instagram", placeholder: "@username" },
  { value: "phone", label: "Phone call", labelRu: "Звонок", placeholder: "+44 7700 900123" },
  { value: "email", label: "Email", labelRu: "Почта", placeholder: "Same as above" },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]["value"];

export function ageOn(dateOfBirth: string, on: Date): number {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  let age = on.getUTCFullYear() - dob.getUTCFullYear();
  const m = on.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && on.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

/** Subjects open to a grade in the given program year. */
export function subjectsForGrade(edition: Edition, grade: number | undefined) {
  if (!grade) return edition.subjects;
  return edition.subjects.filter((s) => grade >= s.grades[0] && grade <= s.grades[1]);
}

export function applicationSchema(edition: Edition = getCurrentEdition(), locale: Locale = "en") {
  const m = MESSAGES[locale];
  const [minGrade, maxGrade] = edition.grades;

  const latinName = (label: string) =>
    z.string().trim().min(1, m.required(label)).max(60).regex(LATIN_NAME, m.latinName(label));
  const latinText = (label: string) =>
    z.string().trim().min(2, m.required(label)).max(120).regex(LATIN_TEXT, m.latinText(label));

  return z
    .object({
      firstName: latinName(m.firstName),
      lastName: latinName(m.lastName),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, m.dob),
      gender: z.enum(["male", "female"], { message: m.gender }),
      country: z.string().trim().min(2, m.country).max(80),
      city: latinText(m.city),
      school: latinText(m.school),
      grade: z.coerce.number({ message: m.grade }).int().min(minGrade, m.grade).max(maxGrade, m.grade),
      subject: z.string().min(1, m.subject),
      email: z.string().trim().toLowerCase().email(m.email),
      contactMethod: z.enum(["whatsapp", "telegram", "instagram", "phone", "email"]),
      contactValue: z.string().trim().max(80).regex(CONTACT, m.contactLatin).or(z.literal("")),
      guardianName: latinName(m.guardianName).refine((v) => v.length >= 2, m.requiredShort),
      guardianPhone: z.string().trim().min(6, m.guardianPhone).max(30).regex(/^[+0-9\s()-]+$/, m.phoneDigits),
      confirmAccuracy: z.literal(true, { message: m.confirmAccuracy }),
      confirmTerms: z.literal(true, { message: m.confirmTerms }),
      confirmGuardian: z.boolean(),
    })
    .superRefine((v, ctx) => {
      const subject = edition.subjects.find((s) => s.name === v.subject);
      if (!subject || v.grade < subject.grades[0] || v.grade > subject.grades[1]) {
        ctx.addIssue({ code: "custom", path: ["subject"], message: m.subjectGrade });
      }
      if (v.contactMethod !== "email" && v.contactValue.length < 3) {
        ctx.addIssue({ code: "custom", path: ["contactValue"], message: m.contactValue });
      }
      const age = ageOn(v.dateOfBirth, new Date(`${edition.startDate}T00:00:00Z`));
      if (Number.isNaN(age) || age < 4 || age > 21) {
        ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: m.dobCheck });
      } else if (age < 18 && !v.confirmGuardian) {
        ctx.addIssue({ code: "custom", path: ["confirmGuardian"], message: m.guardianConsent });
      }
    });
}

export type ApplicationInput = z.infer<ReturnType<typeof applicationSchema>>;

/** Short, human-friendly reference such as GATE-27W-4F9K2Q. */
export function makeReference(edition: Edition): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const tail = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `GATE-${String(edition.year).slice(2)}${edition.season === "winter" ? "W" : "S"}-${tail}`;
}
