"use client";

import { Button } from "@/components/ui/button";

export function InvoiceDownloadButton({ paymentId }: { paymentId: number }) {
  return (
    <a href={`/api/invoice/${paymentId}`}>
      <Button type="button" variant="outline" size="sm" className="text-[10px]">
        PDF
      </Button>
    </a>
  );
}
