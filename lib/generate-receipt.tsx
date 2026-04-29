import { renderToBuffer } from "@react-pdf/renderer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { ReceiptPDF } from "@/components/receipt-pdf";

interface GenerateReceiptParams {
  paymentId: number;
  receiptNumber: string;
  paidAt: string;
  participant: { name: string; email: string; country: string };
  cycle: string;
  round?: string;
  amountCents: number;
  serviceFeeCents: number;
  cardLast4?: string | null;
  cardBrand?: string | null;
  stripeChargeId?: string | null;
  stripePaymentIntentId?: string | null;
}

export async function generateAndUploadReceipt(params: GenerateReceiptParams): Promise<string> {
  const buffer = await renderToBuffer(
    <ReceiptPDF
      receiptNumber={params.receiptNumber}
      paidAt={params.paidAt}
      participant={params.participant}
      cycle={params.cycle}
      round={params.round}
      amountCents={params.amountCents}
      serviceFeeCents={params.serviceFeeCents}
      cardLast4={params.cardLast4}
      cardBrand={params.cardBrand}
      stripeChargeId={params.stripeChargeId}
      stripePaymentIntentId={params.stripePaymentIntentId}
    />
  );

  const key = `receipts/receipt-${params.paymentId}.pdf`;
  const filename = `receipt-GATE-${String(params.paymentId).padStart(6, "0")}.pdf`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentDisposition: `attachment; filename="${filename}"`,
    })
  );

  return key;
}
