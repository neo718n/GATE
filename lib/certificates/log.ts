import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { certificateVerifications } from "@/lib/db/schema";
import type { LookupStatus } from "./types";

type LogStatus = LookupStatus | "rate_limited";

interface LogArgs {
  certificateId: number | null;
  attemptedCode: string;
  status: LogStatus;
  ip: string | null;
  countryCode: string | null;
  userAgent: string | null;
}

function dailySalt(): string {
  const base = process.env.IP_HASH_SALT ?? "";
  const day = new Date().toISOString().slice(0, 10);
  return `${base}|${day}`;
}

export function hashIp(ip: string | null): string {
  return createHash("sha256")
    .update((ip ?? "unknown") + dailySalt())
    .digest("hex")
    .slice(0, 16);
}

export function classifyUserAgent(ua: string | null): string {
  if (!ua) return "api";
  const u = ua.toLowerCase();
  if (/bot|crawl|spider|curl|wget|python|httpie|axios|fetch\//.test(u))
    return "bot";
  if (/mobile|android|iphone|ipad|ipod/.test(u)) return "mobile";
  return "browser";
}

export async function logVerification(args: LogArgs): Promise<void> {
  try {
    await db.insert(certificateVerifications).values({
      certificateId: args.certificateId,
      attemptedCode: args.attemptedCode.slice(0, 100),
      ipHash: hashIp(args.ip),
      countryCode: args.countryCode,
      userAgentClass: classifyUserAgent(args.userAgent),
      resultStatus: args.status,
    });
  } catch {
    // Logging must never break the verification response
  }
}

export function ipFromHeaders(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

export function countryFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    null
  );
}
