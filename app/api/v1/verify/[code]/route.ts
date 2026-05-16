import { NextResponse } from "next/server";
import { formatCode } from "@/lib/certificates/code";
import {
  countryFromHeaders,
  ipFromHeaders,
  logVerification,
} from "@/lib/certificates/log";
import { lookupByCode } from "@/lib/certificates/lookup";
import { checkRateLimit } from "@/lib/rate-limit";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const canonical = formatCode(decodeURIComponent(code));

  const ip = ipFromHeaders(request.headers) ?? "unknown";
  const rate = checkRateLimit(`verify:${ip}`, 30, 60_000);
  if (!rate.ok) {
    void logVerification({
      certificateId: null,
      attemptedCode: canonical,
      status: "rate_limited",
      ip,
      countryCode: countryFromHeaders(request.headers),
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json(
      { status: "rate_limited", error: "Too many requests" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": "60" } },
    );
  }

  const result = await lookupByCode(canonical);

  void logVerification({
    certificateId: null,
    attemptedCode: canonical,
    status: result.status,
    ip,
    countryCode: countryFromHeaders(request.headers),
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json(
    { status: result.status, certificate: result.certificate ?? null },
    { headers: NO_STORE },
  );
}
