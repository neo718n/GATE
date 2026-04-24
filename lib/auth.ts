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

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
