import { NextResponse } from "next/server";
import { z } from "zod";
import { formatCode } from "@/lib/certificates/code";
import {
  countryFromHeaders,
  ipFromHeaders,
  logVerification,
} from "@/lib/certificates/log";
import { lookupByCode } from "@/lib/certificates/lookup";
import { checkRateLimit } from "@/lib/rate-limit";

const NO_STORE = { "Cache-Control": "no-store" } as const;
const MAX_CODES = 50;

const bodySchema = z.object({
  codes: z.array(z.string().min(1).max(100)).min(1).max(MAX_CODES),
});

export async function POST(request: Request) {
  const ip = ipFromHeaders(request.headers) ?? "unknown";
  const rate = checkRateLimit(`verify-bulk-public:${ip}`, 5, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many bulk requests. Please wait a minute." },
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
        ip,
        countryCode: countryFromHeaders(request.headers),
        userAgent: request.headers.get("user-agent"),
      });
      return { code, status: r.status, certificate: r.certificate ?? null };
    }),
  );

  return NextResponse.json({ results }, { headers: NO_STORE });
}
