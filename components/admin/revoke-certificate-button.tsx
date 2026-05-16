"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  revokeCertificate,
  unrevokeCertificate,
} from "@/lib/certificates/issue";

export function RevokeCertificateButton({
  certificateId,
  isRevoked,
}: {
  certificateId: number;
  isRevoked: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function act() {
    setConfirming(false);
    startTransition(async () => {
      if (isRevoked) {
        await unrevokeCertificate({ certificateId });
      } else {
        const reason = window.prompt("Reason for revocation? (optional)");
        await revokeCertificate({
          certificateId,
          reason: reason ?? undefined,
        });
      }
    });
  }

  if (isRevoked) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={act}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        )}
        Restore
      </Button>
    );
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        disabled={isPending}
      >
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
        Revoke
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={act}
        disabled={isPending}
      >
        Confirm
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
