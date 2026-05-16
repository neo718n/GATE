import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { formatCode } from "@/lib/certificates/code";
import {
  countryFromHeaders,
  ipFromHeaders,
  logVerification,
} from "@/lib/certificates/log";
import { lookupByCode } from "@/lib/certificates/lookup";
import { checkRateLimit } from "@/lib/rate-limit";

const NO_STORE = { "Cache-Control": "no-store" } as const;
const MAX_CODES = 100;

const bodySchema = z.object({
  codes: z.array(z.string().min(1).max(100)).min(1).max(MAX_CODES),
});

function checkApiKey(header: string | null): {
  ok: boolean;
  matchedKey: string | null;
} {
  if (!header) return { ok: false, matchedKey: null };
  const env = process.env.VERIFY_API_KEYS;
  if (!env) return { ok: false, matchedKey: null };
  const keys = env.split(",").map((k) => k.trim()).filter(Boolean);
  for (const k of keys) {
    if (k.length !== header.length) continue;
    if (timingSafeEqual(Buffer.from(k), Buffer.from(header))) {
      return { ok: true, matchedKey: k };
    }
  }
  return { ok: false, matchedKey: null };
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const auth = checkApiKey(apiKey);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Invalid or missing X-API-Key header" },
      { status: 401, headers: NO_STORE },
    );
  }

  const rate = checkRateLimit(`verify-bulk:${auth.matchedKey}`, 10, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": "60" } },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = await request.json();
    parsed = bodySchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request body" },
      { status: 400, headers: NO_STORE },
    );
  }

  const canonical = parsed.codes.map(formatCode);
  const results = await Promise.all(
    canonical.map(async (code) => {
      const r = await lookupByCode(code);
      void logVerification({
        certificateId: null,
        attemptedCode: code,
        status: r.status,
        ip: ipFromHeaders(request.headers),
        countryCode: countryFromHeaders(request.headers),
        userAgent: "api",
      });
      return { code, status: r.status, certificate: r.certificate ?? null };
    }),
  );

  return NextResponse.json({ results }, { headers: NO_STORE });
}
