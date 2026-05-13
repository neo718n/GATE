"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function PaymentSubmitButton({
  label,
  disabled = false,
}: {
  label: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" size="md" disabled={pending || disabled}>
      {pending ? "Processing…" : label}
    </Button>
  );
}
