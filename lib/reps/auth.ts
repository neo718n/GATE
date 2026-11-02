import "server-only";
import { createHash, randomBytes, randomInt } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { repOtps, repSessions, representatives, type Representative } from "@/lib/db/schema";
import { DEFAULT_FROM, resend } from "@/lib/email";
import { localizePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";

// Representative sign-in is separate from better-auth: only emails an admin
// has whitelisted in `representatives` can request a code, and a session
// lasts 90 days.

export const REP_COOKIE = "gate_rep_session";
const SESSION_DAYS = 90;
const OTP_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_PER_WINDOW = 3;

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const normalize = (email: string) => email.trim().toLowerCase();

export type RequestCodeResult = { ok: true } | { ok: false; reason: "not_listed" | "rate_limited" | "send_failed" };

export async function requestRepCode(rawEmail: string): Promise<RequestCodeResult> {
  const email = normalize(rawEmail);
  const rep = await db.query.representatives.findFirst({
    where: and(eq(representatives.email, email), eq(representatives.active, true)),
  });
  if (!rep) return { ok: false, reason: "not_listed" };

  const windowStart = new Date(Date.now() - OTP_MINUTES * 60_000);
  const recent = await db
    .select({ id: repOtps.id })
    .from(repOtps)
    .where(and(eq(repOtps.email, email), gt(repOtps.createdAt, windowStart)));
  if (recent.length >= OTP_MAX_PER_WINDOW) return { ok: false, reason: "rate_limited" };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.insert(repOtps).values({
    email,
    codeHash: sha256(`${email}:${code}`),
    expiresAt: new Date(Date.now() + OTP_MINUTES * 60_000),
  });

  const ru = (await getLocale()) === "ru";
  const t = ru
    ? {
        subject: `${code} — код для входа в кабинет партнёра G.A.T.E.`,
        hello: `Здравствуйте, ${escapeHtml(rep.name)}!`,
        use: "Введите этот код, чтобы войти в кабинет партнёра.",
        expires: `Код действует ${OTP_MINUTES} минут. Если вы его не запрашивали, просто проигнорируйте это письмо.`,
      }
    : {
        subject: `${code} is your G.A.T.E. partner sign-in code`,
        hello: `Hello ${escapeHtml(rep.name)},`,
        use: "Use this code to sign in to your partner dashboard.",
        expires: `The code expires in ${OTP_MINUTES} minutes. If you didn't request it, you can ignore this email.`,
      };

  const { error } = await resend.emails.send({
    from: DEFAULT_FROM,
    to: email,
    subject: t.subject,
    html: `<div lang="${ru ? "ru" : "en"}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#FAF7F0;border-radius:24px">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.28em;color:#C9993A;margin:0 0 24px">G.A.T.E. Partners</p>
      <h1 style="font-size:26px;font-weight:500;color:#0B1F3A;margin:0 0 8px;font-family:Georgia,serif">${t.hello}</h1>
      <p style="font-size:14px;color:#3A4A62;line-height:1.7;margin:0 0 28px">${t.use}</p>
      <div style="text-align:center;padding:26px;background:#FFFFFF;border-radius:18px;margin:0 0 28px">
        <span style="font-size:38px;letter-spacing:0.35em;color:#0B1F3A;font-family:Georgia,serif">${code}</span>
      </div>
      <p style="font-size:12px;color:#6B7A90;line-height:1.7;margin:0">${t.expires}</p>
    </div>`,
  });
  if (error) return { ok: false, reason: "send_failed" };
  return { ok: true };
}

export type VerifyCodeResult = { ok: true } | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

export async function verifyRepCode(rawEmail: string, code: string): Promise<VerifyCodeResult> {
  const email = normalize(rawEmail);
  const otp = await db.query.repOtps.findFirst({
    where: and(eq(repOtps.email, email), isNull(repOtps.usedAt)),
    orderBy: desc(repOtps.createdAt),
  });
  if (!otp || otp.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  if (otp.codeHash !== sha256(`${email}:${code.trim()}`)) {
    await db.update(repOtps).set({ attempts: otp.attempts + 1 }).where(eq(repOtps.id, otp.id));
    return { ok: false, reason: "invalid" };
  }

  const rep = await db.query.representatives.findFirst({
    where: and(eq(representatives.email, email), eq(representatives.active, true)),
  });
  if (!rep) return { ok: false, reason: "invalid" };

  await db.update(repOtps).set({ usedAt: new Date() }).where(eq(repOtps.id, otp.id));

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(repSessions).values({
    representativeId: rep.id,
    tokenHash: sha256(token),
    expiresAt,
    userAgent: (await headers()).get("user-agent")?.slice(0, 300) ?? null,
  });
  await db.update(representatives).set({ lastLoginAt: new Date() }).where(eq(representatives.id, rep.id));

  (await cookies()).set({
    name: REP_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return { ok: true };
}

export async function getRepSession(): Promise<Representative | null> {
  const token = (await cookies()).get(REP_COOKIE)?.value;
  if (!token) return null;
  const session = await db.query.repSessions.findFirst({
    where: and(eq(repSessions.tokenHash, sha256(token)), gt(repSessions.expiresAt, new Date())),
    with: { representative: true },
  });
  if (!session || !session.representative.active) return null;
  return session.representative;
}

/** Use in rep pages; sends signed-out visitors to the sign-in screen. */
export async function requireRep(): Promise<Representative> {
  const rep = await getRepSession();
  if (!rep) redirect(localizePath("/", await getLocale()));
  return rep;
}

export async function signOutRep() {
  const jar = await cookies();
  const token = jar.get(REP_COOKIE)?.value;
  if (token) await db.delete(repSessions).where(eq(repSessions.tokenHash, sha256(token)));
  jar.delete(REP_COOKIE);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
