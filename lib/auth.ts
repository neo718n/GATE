/**
 * @fileoverview Better Auth configuration and setup for G.A.T.E. Assessment
 *
 * This module configures Better Auth, a full-stack authentication library for Next.js.
 * It provides email/password authentication with OTP-based email verification via Resend,
 * secure session management with cookie caching, and custom user fields for RBAC integration.
 *
 * **Key Features:**
 * - Email/password authentication with required email verification
 * - 6-digit OTP codes sent via Resend (10-minute expiration)
 * - Session management with 7-day expiration and automatic refresh
 * - Drizzle ORM integration for PostgreSQL database
 * - Custom user fields: role, firstName, lastName, country, phone
 * - Next.js cookie adapter for server/client session synchronization
 *
 * **Required Environment Variables:**
 * @env BETTER_AUTH_SECRET - Secret key for signing tokens and sessions (required)
 * @env BETTER_AUTH_URL - Base URL for auth callbacks (optional, defaults to NEXT_PUBLIC_APP_URL)
 * @env NEXT_PUBLIC_APP_URL - Public app URL (optional, defaults to http://localhost:3000)
 * @env DATABASE_URL - PostgreSQL connection string (required by db module)
 * @env RESEND_API_KEY - Resend API key for sending OTP emails (required by email module)
 *
 * **Architecture:**
 * This is the server-side auth configuration. Client-side hooks are in auth-client.ts.
 * Authorization guards and RBAC logic are in authz.ts. API routes are handled by
 * app/api/auth/[...all]/route.ts which delegates to Better Auth's built-in handlers.
 *
 * @example
 * // Server-side usage (e.g., in server actions or API routes)
 * import { auth } from "@/lib/auth";
 * const session = await auth.api.getSession({ headers: await headers() });
 *
 * @see {@link ./auth-client.ts} for client-side React hooks
 * @see {@link ./authz.ts} for server-side authorization guards
 * @see {@link https://www.better-auth.com/docs} Better Auth documentation
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import { resend, DEFAULT_FROM } from "./email";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

/**
 * Main Better Auth instance for G.A.T.E. Assessment application.
 *
 * Configured with email/password authentication, OTP email verification,
 * Drizzle ORM adapter for PostgreSQL, and custom user fields for RBAC.
 *
 * **Configuration Details:**
 *
 * - **App Name:** "G.A.T.E. Assessment" - displayed in email templates and UI
 * - **Base URL:** Uses BETTER_AUTH_URL → NEXT_PUBLIC_APP_URL → localhost:3000 fallback
 * - **Secret:** Loaded from BETTER_AUTH_SECRET env var (validates at startup)
 *
 * - **Database:** Drizzle adapter with PostgreSQL provider
 *   - Tables: user, session, account, verification
 *   - Schema: Defined in ./db/schema.ts
 *
 * - **Email & Password:**
 *   - Email verification required before login
 *   - Minimum password length: 8 characters
 *   - Auto sign-in after successful registration
 *
 * - **Custom User Fields:**
 *   - role: string (default: "participant") - Used for RBAC authorization
 *   - firstName: string (optional)
 *   - lastName: string (optional)
 *   - country: string (optional)
 *   - phone: string (optional)
 *   - Note: role has input: false to prevent client-side modification
 *
 * - **Session Management:**
 *   - Expires in 7 days (604,800 seconds)
 *   - Updates session age daily (86,400 seconds)
 *   - Cookie cache enabled with 5-minute max age for performance
 *
 * **Plugins:**
 *
 * 1. **emailOTP** - Sends 6-digit verification codes via Resend
 *    - OTP length: 6 digits
 *    - Expiration: 10 minutes (600 seconds)
 *    - Custom email template with G.A.T.E. branding
 *    - Throws error if Resend API fails
 *
 * 2. **nextCookies** - Next.js cookie adapter for SSR/client sync
 *    - Enables session sharing between server and client
 *    - Required for server components and API routes
 *
 * @example
 * // Get current session in a server action
 * import { auth } from "@/lib/auth";
 * import { headers } from "next/headers";
 *
 * export async function myServerAction() {
 *   const session = await auth.api.getSession({
 *     headers: await headers()
 *   });
 *
 *   if (!session) {
 *     throw new Error("Not authenticated");
 *   }
 *
 *   return session.user;
 * }
 *
 * @example
 * // Sign in a user (server-side)
 * const result = await auth.api.signInEmail({
 *   body: {
 *     email: "user@example.com",
 *     password: "securepassword"
 *   }
 * });
 *
 * @see {@link https://www.better-auth.com/docs/authentication/email-password} Email/Password docs
 * @see {@link https://www.better-auth.com/docs/plugins/email-otp} Email OTP plugin docs
 */
export const auth = betterAuth({
  appName: "G.A.T.E. Assessment",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "participant",
        required: false,
        input: false,
      },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      country: { type: "string", required: false },
      phone: { type: "string", required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp }: { email: string; otp: string; type: string }) {
        const { error } = await resend.emails.send({
          from: DEFAULT_FROM,
          to: email,
          subject: "Your G.A.T.E. verification code",
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#FFFFFF;border:1px solid #E2E8F0">
            <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;color:#C9993A;margin:0 0 28px">G.A.T.E. Assessment</p>
            <h1 style="font-size:24px;font-weight:300;color:#1A2B42;margin:0 0 10px;font-family:Georgia,serif">Verify Your Email</h1>
            <p style="font-size:13px;font-weight:300;color:#64748B;line-height:1.8;margin:0 0 32px">Enter the verification code below to activate your G.A.T.E. Assessment account.</p>
            <div style="text-align:center;padding:28px 24px;background:#F8FAFC;border:1px solid #E2E8F0;margin:0 0 32px">
              <span style="font-size:40px;font-weight:300;letter-spacing:0.4em;color:#1A2B42;font-family:Georgia,serif">${otp}</span>
            </div>
            <p style="font-size:11px;font-weight:300;color:#94A3B8;line-height:1.8;padding-top:24px;border-top:1px solid #E2E8F0">This code expires in <strong style="color:#1A2B42">10 minutes</strong>. If you did not register for G.A.T.E., you can safely ignore this email.</p>
          </div>`,
        });
        if (error) throw new Error(error.message);
      },
    }),
    nextCookies(),
  ],
});

/**
 * Type definition for the Better Auth instance.
 *
 * Use this type when passing the auth instance to other functions or components
 * that need to accept a Better Auth instance as a parameter.
 *
 * @example
 * import type { Auth } from "@/lib/auth";
 *
 * function validateSession(authInstance: Auth) {
 *   return authInstance.api.getSession();
 * }
 */
export type Auth = typeof auth;

/**
 * Type definition for the user session object returned by Better Auth.
 *
 * Includes the authenticated user's data along with session metadata.
 *
 * **Session Structure:**
 * - `session.id` - Unique session identifier
 * - `session.userId` - User ID associated with the session
 * - `session.expiresAt` - Session expiration timestamp
 * - `session.token` - Session token (for API calls)
 * - `session.user` - User object with all fields including custom fields:
 *   - `user.id` - Unique user identifier
 *   - `user.email` - User's email address
 *   - `user.emailVerified` - Email verification status (boolean)
 *   - `user.role` - User role for RBAC (e.g., "participant", "admin", "coordinator")
 *   - `user.firstName` - User's first name (optional)
 *   - `user.lastName` - User's last name (optional)
 *   - `user.country` - User's country (optional)
 *   - `user.phone` - User's phone number (optional)
 *   - `user.createdAt` - Account creation timestamp
 *   - `user.updatedAt` - Last update timestamp
 *
 * @example
 * import type { Session } from "@/lib/auth";
 *
 * function getUserRole(session: Session | null): string {
 *   if (!session?.user?.role) {
 *     return "guest";
 *   }
 *   return session.user.role;
 * }
 *
 * @example
 * // Type guard for checking if session exists
 * function requireSession(session: Session | null): asserts session is Session {
 *   if (!session) {
 *     throw new Error("Session required");
 *   }
 * }
 */
export type Session = typeof auth.$Infer.Session;
