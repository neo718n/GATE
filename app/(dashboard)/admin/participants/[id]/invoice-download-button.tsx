"use client";

import { Button } from "@/components/ui/button";

export function InvoiceDownloadButton({ paymentId }: { paymentId: number }) {
  return (
    <div className="flex gap-1">
      <a href={`/api/invoice/${paymentId}`}>
        <Button type="button" variant="outline" size="sm" className="text-[10px]">
          Invoice
        </Button>
      </a>
      <a href={`/api/receipt/${paymentId}`}>
        <Button type="button" variant="outline" size="sm" className="text-[10px]">
          Receipt
        </Button>
      </a>
    </div>
  );
}
