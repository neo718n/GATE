"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { careerApplications } from "@/lib/db/schema";
import { getLocale } from "@/lib/i18n/server";

const RU_FIELD_ERRORS: Record<string, string> = {
  positionTitle: "Выберите вакансию.",
  fullName: "Укажите имя и фамилию.",
  email: "Проверьте адрес электронной почты.",
  country: "Укажите страну.",
  motivationText: "Сопроводительное письмо должно быть не короче 50 символов.",
};

const schema = z.object({
  positionTitle: z.string().min(2, "Position is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  motivationText: z.string().min(50, "Motivation letter must be at least 50 characters"),
});

export type CareerFormState = {
  success: boolean;
  error: string | null;
  fieldErrors: Partial<Record<keyof z.infer<typeof schema>, string>>;
};

export async function submitCareerApplication(
  _prev: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  const ru = (await getLocale()) === "ru";
  const turnstileToken = formData.get("cf-turnstile-response");
  const tokenOk = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
  );
  if (!tokenOk) {
    return {
      success: false,
      error: ru
        ? "Не удалось подтвердить, что вы не робот. Обновите страницу и попробуйте ещё раз."
        : "Human verification failed. Please refresh and try again.",
      fieldErrors: {},
    };
  }

  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: CareerFormState["fieldErrors"] = {};
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      (fieldErrors as Record<string, string>)[k] = (ru && RU_FIELD_ERRORS[k]) || (v?.[0] ?? "");
    }
    return { success: false, error: null, fieldErrors };
  }

  try {
    await db.insert(careerApplications).values({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      country: parsed.data.country,
      motivationText: parsed.data.motivationText,
    });
    return { success: true, error: null, fieldErrors: {} };
  } catch {
    return {
      success: false,
      error: ru ? "Не удалось отправить отклик. Попробуйте ещё раз." : "Submission failed. Please try again.",
      fieldErrors: {},
    };
  }
}
