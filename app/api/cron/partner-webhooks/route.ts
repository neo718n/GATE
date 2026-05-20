import { NextResponse } from "next/server";
import { processDueWebhooks } from "@/lib/partner/webhook";

export const dynamic = "force-dynamic";

/**
 * Retry due partner webhook deliveries. Protect with a bearer secret and call
 * on a schedule (e.g. Vercel Cron) — `Authorization: Bearer <PARTNER_WEBHOOK_CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.PARTNER_WEBHOOK_CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  const result = await processDueWebhooks(50);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
