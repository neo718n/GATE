"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { waitlistSignups } from "@/lib/db/schema";
import { getCountryByIso } from "@/lib/phone-codes";
import { checkRateLimit } from "@/lib/rate-limit";
import { hashIp, ipFromHeaders, classifyUserAgent, countryFromHeaders } from "@/lib/certificates/log";

const SOURCES = ["homepage_hero", "homepage_modal", "homepage_next_edition"] as const;

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  phoneCountryIso: z.string().length(2, "Select a dial code"),
  phoneNumber: z
    .string()
    .trim()
    .min(4, "Enter a valid phone number")
    .max(32)
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  countryIso: z.string().length(2, "Select a country"),
  detectedCountryIso: z.string().optional(),
  source: z.enum(SOURCES).optional(),
});

export type WaitlistFormState = {
  success: boolean;
  error: string | null;
  fieldErrors: Partial<Record<keyof z.infer<typeof schema>, string>>;
};

export async function submitWaitlistSignup(
  _prev: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  const headerList = await headers();
  const ip = ipFromHeaders(headerList);
  const ipKey = hashIp(ip);

  // 5 signups per hour from one address is far above honest use and well
  // below what makes the table a spam target.
  const { ok } = checkRateLimit(`waitlist:${ipKey}`, 5, 60 * 60 * 1000);
  if (!ok) {
    return {
      success: false,
      error: "Too many submissions from this connection. Please try again later.",
      fieldErrors: {},
    };
  }

  const turnstileToken = formData.get("cf-turnstile-response");
  const tokenOk = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
  );
  if (!tokenOk) {
    return {
      success: false,
      error: "Human verification failed. Please refresh and try again.",
      fieldErrors: {},
    };
  }

  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: WaitlistFormState["fieldErrors"] = {};
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      (fieldErrors as Record<string, string>)[k] = v?.[0] ?? "";
    }
    return { success: false, error: null, fieldErrors };
  }

  const phoneCountry = getCountryByIso(parsed.data.phoneCountryIso);
  const residenceCountry = getCountryByIso(parsed.data.countryIso);
  const lead = {
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: `${phoneCountry.dial} ${parsed.data.phoneNumber}`.trim(),
    countryName: residenceCountry.name,
    source: parsed.data.source ?? "homepage_hero",
  };

  try {
    await db
      .insert(waitlistSignups)
      .values({
        ...lead,
        phoneCountryIso: phoneCountry.iso2,
        countryIso: residenceCountry.iso2,
        detectedCountryIso:
          parsed.data.detectedCountryIso?.toUpperCase() ||
          countryFromHeaders(headerList)?.toUpperCase() ||
          null,
        ipHash: ipKey,
        userAgentClass: classifyUserAgent(headerList.get("user-agent")),
      })
      // Someone signing up twice is not an error to them — refresh their
      // details and show the same confirmation.
      .onConflictDoUpdate({
        target: waitlistSignups.email,
        set: {
          fullName: lead.fullName,
          phone: lead.phone,
          phoneCountryIso: phoneCountry.iso2,
          countryName: residenceCountry.name,
          countryIso: residenceCountry.iso2,
          updatedAt: new Date(),
        },
      });
  } catch {
    return { success: false, error: "Submission failed. Please try again.", fieldErrors: {} };
  }

  return { success: true, error: null, fieldErrors: {} };
}
