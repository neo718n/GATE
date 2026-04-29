"use client";

import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoice-pdf";
import { Button } from "@/components/ui/button";

interface Payment {
  id: number;
  amountCents: number;
  status: string;
  createdAt: Date;
  cycle?: { name: string } | null;
  round?: { name: string } | null;
}

export function InvoiceDownloadButton({
  payment,
  participant,
}: {
  payment: Payment;
  participant: { name: string; email: string; country: string };
}) {
  async function handleDownload() {
    const blob = await pdf(
      <InvoicePDF
        invoiceNumber={`GATE-${String(payment.id).padStart(6, "0")}`}
        issuedAt={new Date(payment.createdAt).toLocaleDateString()}
        participant={participant}
        cycle={payment.cycle?.name ?? "—"}
        round={payment.round?.name}
        amountCents={payment.amountCents}
        status={payment.status}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-GATE-${String(payment.id).padStart(6, "0")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-[10px]"
      onClick={handleDownload}
    >
      PDF
    </Button>
  );
}
