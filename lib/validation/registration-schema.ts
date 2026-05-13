import { z } from "zod";

/**
 * E.164 phone number format validation regex
 * Format: +[country code][number]
 * Example: +12125551234
 * Length: 1-15 digits after the + sign
 */
const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * ISO 3166-1 alpha-2 country code validation regex
 * Format: Two uppercase letters
 * Example: US, GB, CA
 */
const ISO_COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

/**
 * Date string validation regex (YYYY-MM-DD)
 * Example: 2005-01-01
 */
const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Gender enum values matching the database schema
 */
const genderValues = ["male", "female", "prefer_not_to_say"] as const;

/**
 * Unified registration schema for the simplified 2-step registration flow
 *
 * This schema validates all user and participant data collected in the first step
 * of the registration process, combining what was previously spread across
 * multiple forms (Register → Complete Profile).
 *
 * Fields are validated to match database schema constraints and business rules.
 */
export const registrationSchema = z.object({
  // User authentication fields
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  // User profile fields (stored in user table)
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  country: z
    .string()
    .min(1, "Country is required")
    .regex(ISO_COUNTRY_CODE_REGEX, "Country must be a valid ISO 3166-1 alpha-2 code (e.g., US, GB, CA)"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(E164_PHONE_REGEX, "Phone number must be in E.164 format (e.g., +12125551234)"),

  // Participant-specific fields (stored in participants table)
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name must not exceed 100 characters"),

  school: z
    .string()
    .min(1, "School name is required")
    .max(200, "School name must not exceed 200 characters"),

  grade: z
    .string()
    .min(1, "Grade is required")
    .max(10, "Grade must not exceed 10 characters"),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(DATE_STRING_REGEX, "Date of birth must be in YYYY-MM-DD format")
    .refine((date) => {
      // Validate that the date string is a valid date
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid date")
    .refine((date) => {
      // Validate that participant is at least 5 years old
      const parsed = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - parsed.getFullYear();
      return age >= 5;
    }, "Participant must be at least 5 years old")
    .refine((date) => {
      // Validate that date is not in the future
      const parsed = new Date(date);
      const today = new Date();
      return parsed <= today;
    }, "Date of birth cannot be in the future"),

  gender: z
    .enum(genderValues, {
      errorMap: () => ({ message: "Gender must be one of: male, female, prefer_not_to_say" }),
    }),
});

/**
 * TypeScript type inferred from the registration schema
 * Use this type for type-safe form handling and validation
 */
export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Validation result type for server-side validation
 */
export type RegistrationValidationResult = {
  success: boolean;
  data?: RegistrationFormData;
  error?: string;
  fieldErrors?: Partial<Record<keyof RegistrationFormData, string>>;
};
