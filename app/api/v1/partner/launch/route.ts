import { NextResponse } from "next/server";
import { verifyLaunchToken, consumeNonce } from "@/lib/partner/auth";
import {
  resolvePartnerParticipant,
  mintPartnerSession,
} from "@/lib/partner/identity";
import { startPartnerExamSession } from "@/lib/partner/exam-session";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

function errorPage(message: string, status = 400) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Launch error</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#0b1220;color:#e2e8f0">
<div style="max-width:440px;text-align:center;padding:32px">
<div style="font-size:44px">⛔</div>
<h1 style="font-weight:600;font-size:18px;margin:14px 0 8px">Unable to start exam</h1>
<p style="color:#94a3b8;font-size:14px;line-height:1.6">${escapeHtml(message)}</p>
<p style="color:#64748b;font-size:12px;margin-top:24px">Please ask your administrator to relaunch the exam.</p>
</div></body></html>`;
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handle(req: Request, token: string | null) {
  if (!token) return errorPage("Missing launch token.", 400);

  let verified;
  try {
    verified = await verifyLaunchToken(token);
  } catch (e) {
    return errorPage(
      e instanceof Error ? e.message : "Invalid launch token.",
      401,
    );
  }
  const { partner, claims } = verified;

  const rl = checkRateLimit(`partner-launch:${partner.clientId}`, 120, 60_000);
  if (!rl.ok) return errorPage("Too many launches. Please retry shortly.", 429);

  // Single-use replay guard.
  const fresh = await consumeNonce(claims.jti, partner.id, claims.exp);
  if (!fresh) {
    await writeAuditLog(
      null,
      "partner_launch_replay",
      "integration_partner",
      partner.id,
      { jti: claims.jti, sub: claims.sub },
    );
    return errorPage("This launch link has already been used.", 401);
  }

  const examId = Number(claims.exam_ref);
  if (!Number.isInteger(examId)) {
    return errorPage("Invalid exam reference.", 400);
  }

  let resolved;
  try {
    resolved = await resolvePartnerParticipant(partner, claims);
    await mintPartnerSession(resolved.userId, resolved.email);
  } catch {
    return errorPage("Could not start your session. Please try again.", 500);
  }

  const started = await startPartnerExamSession({
    examId,
    participantId: resolved.participantId,
    partnerId: partner.id,
    externalAssignmentId: claims.assignment_id ?? null,
    returnUrl: claims.return_url ?? null,
    grade: claims.grade ?? null,
  });
  if ("error" in started) return errorPage(started.error, 400);

  await writeAuditLog(
    resolved.userId,
    "partner_launch",
    "exam_session",
    started.sessionId,
    { partnerId: partner.id, externalUserId: claims.sub, examId },
  );

  return NextResponse.redirect(
    new URL(`/exam/${started.sessionId}`, req.url),
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(req, url.searchParams.get("token"));
}

export async function POST(req: Request) {
  let token: string | null = null;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { token?: string };
    token = body?.token ?? null;
  } else {
    const form = await req.formData().catch(() => null);
    token = (form?.get("token") as string | null) ?? null;
  }
  return handle(req, token);
}
