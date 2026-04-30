import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { payments, participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { generateAndUploadReceipt } from "@/lib/generate-receipt";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const paymentId = Number(id);
  if (isNaN(paymentId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: { cycle: true, round: true },
  });

  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = (session.user as { role?: string }).role;
  const isAdmin = role === "super_admin" || role === "admin";
  if (!isAdmin && payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let key = payment.receiptPdfKey;

  if (!key) {
    const participant = payment.participantId
      ? await db.query.participants.findFirst({
          where: eq(participants.id, payment.participantId),
          with: { user: true },
        })
      : null;

    key = (await generateAndUploadReceipt({
      paymentId: payment.id,
      receiptNumber: `RCT-${String(payment.id).padStart(6, "0")}`,
      paidAt: new Date(payment.updatedAt).toLocaleDateString("en-US"),
      participant: {
        name: participant?.fullName ?? "-",
        email: participant?.user?.email ?? "-",
        country: participant?.country ?? "-",
      },
      cycle: payment.cycle?.name ?? "-",
      round: payment.round?.name,
      amountCents: payment.amountCents,
      serviceFeeCents: payment.serviceFeeCents ?? 0,
      cardLast4: payment.cardLast4,
      cardBrand: payment.cardBrand,
      stripeChargeId: payment.stripeChargeId,
      stripePaymentIntentId: payment.stripePaymentIntentId,
    })).key;

    await db.update(payments).set({ receiptPdfKey: key }).where(eq(payments.id, paymentId));
  }

  const filename = `receipt-RCT-${String(paymentId).padStart(6, "0")}.pdf`;
  const url = await getPresignedDownloadUrl(key, 300, filename);
  return NextResponse.redirect(url);
}
