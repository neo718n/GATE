"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendTestWebhook, resendWebhook } from "@/lib/actions/integrations";
import { Button } from "@/components/ui/button";

type Delivery = {
  id: number;
  event: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

const STATUS_COLOR: Record<string, string> = {
  delivered: "text-green-700 dark:text-green-400",
  pending: "text-amber-600 dark:text-amber-400",
  failed: "text-red-600 dark:text-red-400",
};

export function WebhookDeliveries({
  partnerId,
  deliveries,
}: {
  partnerId: number;
  deliveries: Delivery[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Webhook deliveries
        </h2>
        <Button
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={async () => {
            setTestResult(null);
            setBusy("test");
            try {
              const r = await sendTestWebhook(partnerId);
              setTestResult(r.ok ? "Test delivered (200)" : `Failed: ${r.error}`);
              router.refresh();
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "test" ? "Sending…" : "Send test webhook"}
        </Button>
      </div>

      {testResult && (
        <p className="text-xs text-muted-foreground">{testResult}</p>
      )}

      {deliveries.length === 0 ? (
        <p className="text-xs font-light text-muted-foreground">
          No deliveries yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className="grid grid-cols-[1.4fr_0.8fr_0.5fr_1.6fr_70px] items-center gap-3 px-4 py-2.5 text-xs"
            >
              <code className="truncate font-mono text-muted-foreground">
                {d.event}
              </code>
              <span
                className={`font-semibold uppercase tracking-[0.12em] ${STATUS_COLOR[d.status] ?? ""}`}
              >
                {d.status}
              </span>
              <span className="text-muted-foreground">×{d.attempts}</span>
              <span className="truncate text-muted-foreground">
                {d.lastError ?? "—"}
              </span>
              <button
                type="button"
                disabled={busy !== null}
                onClick={async () => {
                  setBusy(`resend-${d.id}`);
                  try {
                    await resendWebhook(d.id, partnerId);
                    router.refresh();
                  } finally {
                    setBusy(null);
                  }
                }}
                className="text-right font-semibold uppercase tracking-[0.12em] text-gate-gold hover:underline disabled:opacity-50"
              >
                {busy === `resend-${d.id}` ? "…" : "Resend"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
