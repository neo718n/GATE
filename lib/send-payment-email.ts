import { generateAndUploadInvoice } from "@/lib/generate-invoice";
import { generateAndUploadReceipt } from "@/lib/generate-receipt";
import { resend, DEFAULT_FROM } from "@/lib/email";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface SendPaymentEmailParams {
  paymentId: number;
  amountCents: number;
  serviceFeeCents: number;
  cardLast4?: string | null;
  cardBrand?: string | null;
  stripeChargeId?: string | null;
  stripePaymentIntentId?: string | null;
  cycle: string;
  round?: string;
  participant: { name: string; email: string; country: string };
}

export async function sendPaymentConfirmationEmail(params: SendPaymentEmailParams) {
  const paidAt = new Date().toLocaleDateString("en-US");
  const invoiceNumber = `INV-${String(params.paymentId).padStart(6, "0")}`;
  const receiptNumber = `RCT-${String(params.paymentId).padStart(6, "0")}`;
  const totalAmt = `$${(params.amountCents / 100).toFixed(2)}`;

  const [{ key: invoiceKey, buffer: invoiceBuffer }, { key: receiptKey, buffer: receiptBuffer }] =
    await Promise.all([
      generateAndUploadInvoice({
        paymentId: params.paymentId,
        invoiceNumber,
        issuedAt: paidAt,
        participant: params.participant,
        cycle: params.cycle,
        round: params.round,
        amountCents: params.amountCents,
        status: "paid",
      }),
      generateAndUploadReceipt({
        paymentId: params.paymentId,
        receiptNumber,
        paidAt,
        participant: params.participant,
        cycle: params.cycle,
        round: params.round,
        amountCents: params.amountCents,
        serviceFeeCents: params.serviceFeeCents,
        cardLast4: params.cardLast4,
        cardBrand: params.cardBrand,
        stripeChargeId: params.stripeChargeId,
        stripePaymentIntentId: params.stripePaymentIntentId,
      }),
    ]);

  await db
    .update(payments)
    .set({ invoicePdfKey: invoiceKey, receiptPdfKey: receiptKey })
    .where(eq(payments.id, params.paymentId));

  const programLine = params.round ? `${params.cycle} – ${params.round}` : params.cycle;

  await resend.emails.send({
    from: DEFAULT_FROM,
    to: params.participant.email,
    subject: `Payment Confirmed — ${receiptNumber} | G.A.T.E. Assessment`,
    html: buildEmailHtml({ ...params, invoiceNumber, receiptNumber, totalAmt, paidAt, programLine }),
    attachments: [
      { filename: `invoice-${invoiceNumber}.pdf`, content: invoiceBuffer },
      { filename: `receipt-${receiptNumber}.pdf`, content: receiptBuffer },
    ],
  });
}

function buildEmailHtml(p: {
  participant: { name: string };
  totalAmt: string;
  programLine: string;
  invoiceNumber: string;
  receiptNumber: string;
  paidAt: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">
        <tr><td style="height:5px;background:#c9993a;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px 40px 20px;">
          <div style="font-size:22px;font-weight:bold;letter-spacing:2px;color:#111111;">G.A.T.E.</div>
          <div style="font-size:11px;color:#666666;margin-top:4px;">Global Assessment &amp; Testing for Excellence</div>
        </td></tr>
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #cccccc;"></div></td></tr>
        <tr><td style="padding:28px 40px 32px;">
          <h1 style="font-size:22px;color:#111111;margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;">Payment Confirmed</h1>
          <p style="font-size:14px;color:#444444;margin:0 0 24px;line-height:1.6;">
            Dear ${p.participant.name}, your payment of <strong>${p.totalAmt}</strong> has been received and confirmed.
            Your invoice and receipt are attached to this email as PDF files.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #cccccc;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 16px;font-size:12px;color:#666666;border-right:1px solid #cccccc;border-bottom:1px solid #cccccc;width:45%;">Amount Paid</td>
              <td style="padding:10px 16px;font-size:13px;color:#111111;font-weight:bold;border-bottom:1px solid #cccccc;">${p.totalAmt}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:12px;color:#666666;border-right:1px solid #cccccc;border-bottom:1px solid #cccccc;">Program</td>
              <td style="padding:10px 16px;font-size:12px;color:#111111;border-bottom:1px solid #cccccc;">${p.programLine}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:12px;color:#666666;border-right:1px solid #cccccc;border-bottom:1px solid #cccccc;">Date</td>
              <td style="padding:10px 16px;font-size:12px;color:#111111;border-bottom:1px solid #cccccc;">${p.paidAt}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:12px;color:#666666;border-right:1px solid #cccccc;border-bottom:1px solid #cccccc;">Invoice No.</td>
              <td style="padding:10px 16px;font-size:12px;color:#111111;font-weight:bold;border-bottom:1px solid #cccccc;">${p.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:12px;color:#666666;border-right:1px solid #cccccc;">Receipt No.</td>
              <td style="padding:10px 16px;font-size:12px;color:#111111;font-weight:bold;">${p.receiptNumber}</td>
            </tr>
          </table>
          <p style="font-size:13px;color:#666666;margin:0 0 8px;line-height:1.6;">
            Please retain the attached documents for your records.
          </p>
          <p style="font-size:13px;color:#666666;margin:0;line-height:1.6;">
            Questions? Contact us at <a href="mailto:support@gate-assessment.org" style="color:#c9993a;text-decoration:none;">support@gate-assessment.org</a>
          </p>
        </td></tr>
        <tr><td style="border-top:1px solid #cccccc;padding:16px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px;color:#999999;">G.A.T.E. Assessment &middot; Assessment Management Platform</td>
              <td align="right" style="font-size:11px;color:#c9993a;">gate-assessment.org</td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
