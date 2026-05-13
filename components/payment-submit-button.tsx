"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function PaymentSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" size="md" disabled={pending}>
      {pending ? "Processing…" : label}
    </Button>
  );
}
