import { renderToBuffer } from "@react-pdf/renderer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET } from "@/lib/r2";
import { InvoicePDF } from "@/components/invoice-pdf";

interface GenerateInvoiceParams {
  paymentId: number;
  invoiceNumber: string;
  issuedAt: string;
  participant: { name: string; email: string; country: string };
  cycle: string;
  round?: string;
  amountCents: number;
  status: string;
}

export async function generateAndUploadInvoice(params: GenerateInvoiceParams): Promise<{ key: string; buffer: Buffer }> {
  const buffer = await renderToBuffer(
    <InvoicePDF
      invoiceNumber={params.invoiceNumber}
      issuedAt={params.issuedAt}
      participant={params.participant}
      cycle={params.cycle}
      round={params.round}
      amountCents={params.amountCents}
      status={params.status}
    />
  );

  const key = `invoices/invoice-${params.paymentId}.pdf`;
  const filename = `invoice-INV-${String(params.paymentId).padStart(6, "0")}.pdf`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentDisposition: `attachment; filename="${filename}"`,
    })
  );

  return { key, buffer };
}

