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
        await resend.emails.send({
          from: DEFAULT_FROM,
          to: email,
          subject: "Your G.A.T.E. verification code",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#060F1C">
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.45em;color:#C9993A;margin:0 0 28px">G.A.T.E. Assessment</p>
            <h1 style="font-size:26px;font-weight:300;color:#FAFBFC;margin:0 0 12px;font-family:Georgia,serif">Verify Your Email</h1>
            <p style="font-size:13px;font-weight:300;color:#8A9BB0;line-height:1.8;margin:0 0 32px">Enter the code below to activate your G.A.T.E. Assessment account.</p>
            <div style="text-align:center;padding:28px 24px;background:#0B1F3A;border:1px solid rgba(201,153,58,0.25);margin:0 0 32px">
              <span style="font-size:38px;font-weight:300;letter-spacing:0.35em;color:#C9993A;font-family:Georgia,serif">${otp}</span>
            </div>
            <p style="font-size:11px;font-weight:300;color:#8A9BB0;line-height:1.7">This code expires in <strong style="color:#FAFBFC">10 minutes</strong>. If you did not register for G.A.T.E., you can safely ignore this email.</p>
          </div>`,
        });
      },
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
