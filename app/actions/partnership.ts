"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";

const schema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  type: z.enum(["university", "school", "academic_institution", "organization"]),
  country: z.string().min(2, "Country is required"),
  city: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Enter a valid email"),
  contactPhone: z.string().optional(),
  cooperationType: z.string().optional(),
  message: z.string().optional(),
});

export type PartnerFormState = {
  success: boolean;
  error: string | null;
  fieldErrors: Partial<Record<keyof z.infer<typeof schema>, string>>;
};

export async function submitPartnerApplication(
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: PartnerFormState["fieldErrors"] = {};
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      (fieldErrors as Record<string, string>)[k] = v?.[0] ?? "";
    }
    return { success: false, error: null, fieldErrors };
  }

  try {
    await db.insert(partners).values({
      organizationName: parsed.data.organizationName,
      type: parsed.data.type,
      country: parsed.data.country,
      city: parsed.data.city ?? null,
      website: parsed.data.website || null,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone ?? null,
      cooperationType: parsed.data.cooperationType ?? null,
      message: parsed.data.message ?? null,
    });
    return { success: true, error: null, fieldErrors: {} };
  } catch {
    return { success: false, error: "Submission failed. Please try again.", fieldErrors: {} };
  }
}
