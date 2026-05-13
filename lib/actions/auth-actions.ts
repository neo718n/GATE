"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { registrationSchema } from "@/lib/validation/registration-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Server action result type for registration operations
 */
export type RegistrationResult = {
  success: boolean;
  error?: string;
  userId?: string;
  requiresVerification?: boolean;
};

/**
 * Unified registration server action that creates both user and participant records.
 *
 * This action handles the simplified registration flow by:
 * 1. Validating all registration data (user + participant fields)
 * 2. Creating user account via Better Auth (email + optional password for authentication)
 * 3. Creating basic participant record via databaseHook (automatic)
 * 4. Updating participant record with additional profile fields
 * 5. Preparing for email OTP verification
 *
 * **Flow:**
 * - User submits unified registration form with all fields
 * - Server validates data against registration schema
 * - Better Auth creates user record with custom fields (firstName, lastName, country, phone)
 * - Database hook automatically creates participant record with basic fields
 * - Server action updates participant record with additional fields (city, school, grade, dateOfBirth, gender)
 * - Returns success with userId for client to initiate OTP verification
 *
 * **Architecture Note:**
 * This uses eventual consistency - the user record is created first, then the participant
 * record is created/updated. If participant update fails, the user record still exists
 * (orphaned user scenario). Orphaned users are monitored via check-orphaned-users.ts script.
 *
 * **Authorization:** None (public registration endpoint)
 *
 * @param formData - Form data containing all registration fields:
 *   - email: User's email address (required)
 *   - password: User's password for authentication (optional, for email/password auth)
 *   - firstName: User's first name (required)
 *   - lastName: User's last name (required)
 *   - country: ISO 3166-1 alpha-2 country code (required)
 *   - phone: E.164 format phone number (required)
 *   - city: Participant's city (required)
 *   - school: Participant's school name (required)
 *   - grade: Participant's grade level (required)
 *   - dateOfBirth: Date in YYYY-MM-DD format (required)
 *   - gender: One of: male, female, prefer_not_to_say (required)
 *
 * @returns RegistrationResult object with success status and userId or error message
 *
 * @throws {Error} Never throws - all errors are caught and returned in result object
 *
 * @example
 * // In a client component or form
 * const formData = new FormData();
 * formData.append("email", "student@example.com");
 * formData.append("firstName", "John");
 * // ... append other fields
 * const result = await registerUser(formData);
 * if (result.success) {
 *   // Proceed to OTP verification
 *   await sendVerificationOTP(result.userId);
 * } else {
 *   // Show error message
 *   console.error(result.error);
 * }
 */
export async function registerUser(formData: FormData): Promise<RegistrationResult> {
  try {
    // Extract all fields from FormData
    const rawData = {
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      country: formData.get("country") as string,
      phone: formData.get("phone") as string,
      city: formData.get("city") as string,
      school: formData.get("school") as string,
      grade: formData.get("grade") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as string,
    };

    // Validate registration data with Zod schema
    const validationResult = registrationSchema.safeParse(rawData);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed. Please check your inputs.",
      };
    }

    const validatedData = validationResult.data;

    // Extract password separately (not in validation schema since it's auth-only)
    const password = formData.get("password") as string | null;

    // Check if password is required based on auth configuration
    // If emailAndPassword is enabled, password is required for initial authentication
    if (!password) {
      return {
        success: false,
        error: "Password is required for registration.",
      };
    }

    // Validate password meets minimum requirements (Better Auth requires 8+ chars)
    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long.",
      };
    }

    // Create user account via Better Auth server API
    // This will trigger the databaseHook which creates a basic participant record
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: password,
        name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
        // Custom fields stored in user table
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        country: validatedData.country,
        phone: validatedData.phone,
      },
    });

    // Check if signup failed
    if (!signUpResult?.user?.id) {
      // Better Auth returns error in the response
      return {
        success: false,
        error: "Registration failed. The email may already be registered. Please try logging in or use a different email.",
      };
    }

    const userId = signUpResult.user.id;

    // Wait a brief moment for the databaseHook to complete participant creation
    // This is a workaround for eventual consistency - the hook runs async
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Update participant record with additional fields
    // The databaseHook created the basic participant record, now we add profile details
    try {
      await db
        .update(participants)
        .set({
          city: validatedData.city,
          school: validatedData.school,
          grade: validatedData.grade,
          dateOfBirth: validatedData.dateOfBirth,
          gender: validatedData.gender,
          registrationStatus: "submitted", // Mark as submitted (pending verification)
          updatedAt: new Date(),
        })
        .where(eq(participants.userId, userId));
    } catch (participantError) {
      // Log error but don't fail the registration - user account was created
      // This creates an "orphaned" user scenario that should be monitored
      console.error("Failed to update participant record for user:", userId, participantError);

      // Return success anyway since user account was created
      // Frontend can still proceed to verification step
      // The participant record can be completed later or via admin intervention
      return {
        success: true,
        userId,
        requiresVerification: true,
        error: "Registration partially successful. Please contact support if issues persist.",
      };
    }

    // Revalidate relevant paths
    revalidatePath("/register");
    revalidatePath("/participant");

    // Return success - client should now initiate OTP verification
    return {
      success: true,
      userId,
      requiresVerification: true,
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error during registration:", error);

    // Return generic error message (don't leak implementation details)
    return {
      success: false,
      error: "An unexpected error occurred during registration. Please try again.",
    };
  }
}

/**
 * Helper function to send OTP verification email after registration.
 *
 * This should be called by the client after successful registration to trigger
 * the OTP email. Better Auth's emailOTP plugin handles the actual email sending.
 *
 * **Usage:**
 * Call this from the client-side after registerUser succeeds:
 * ```typescript
 * await authClient.emailOtp.sendVerificationOtp({
 *   email: email,
 *   type: "email-verification"
 * });
 * ```
 *
 * **Note:** This is typically handled on the client side using authClient, not as a
 * server action, since Better Auth's OTP plugin has built-in client methods.
 * This comment serves as documentation for the integration pattern.
 */
// No server action needed - client calls authClient.emailOtp.sendVerificationOtp directly
