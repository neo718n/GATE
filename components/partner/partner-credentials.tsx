"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  revealSharedSecret,
  revealWebhookSecret,
  rotateOwnApiKey,
  rotateOwnSharedSecret,
  rotateOwnWebhookSecret,
  updateOwnWebhookUrl,
} from "@/lib/actions/partner-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecretField } from "@/components/partner/secret-field";

export function PartnerCredentials({
  clientId,
  launchUrl,
  webhookUrl,
  hasSharedSecret,
  hasWebhookSecret,
}: {
  clientId: string;
  launchUrl: string;
  webhookUrl: string | null;
  hasSharedSecret: boolean;
  hasWebhookSecret: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [shared, setShared] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);

  const [url, setUrl] = useState(webhookUrl ?? "");
  const [savedUrl, setSavedUrl] = useState(false);

  async function run<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
    setError(null);
    setBusy(key);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Identity */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Identity
        </h2>
        <SecretField label="Client ID (JWT issuer)" value={clientId} defaultHidden={false} />
        <SecretField label="Launch endpoint" value={launchUrl} defaultHidden={false} mono />
      </section>

      {/* Shared secret */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Shared secret (HS256)
        </h2>
        <p className="text-xs font-light text-muted-foreground">
          Used to sign launch tokens. Keep it secret — anyone with it can launch
          your exams.
        </p>
        {shared ? (
          <SecretField label="Shared secret" value={shared} />
        ) : (
          <p className="text-xs text-muted-foreground">
            {hasSharedSecret ? "•••••••••••••••• (hidden)" : "Not set"}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {hasSharedSecret && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={async () => {
                const v = await run("reveal-shared", revealSharedSecret);
                if (v) setShared(v);
              }}
            >
              {busy === "reveal-shared" ? "Revealing…" : "Reveal"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={async () => {
              const v = await run("rotate-shared", rotateOwnSharedSecret);
              if (v) {
                setShared(v);
                router.refresh();
              }
            }}
          >
            {busy === "rotate-shared" ? "Rotating…" : "Rotate"}
          </Button>
        </div>
      </section>

      {/* API key */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          API key
        </h2>
        <p className="text-xs font-light text-muted-foreground">
          Used in the <code>X-API-Key</code> header for read endpoints. Stored
          hashed — it cannot be revealed, only rotated.
        </p>
        {apiKey ? (
          <SecretField label="New API key" value={apiKey} />
        ) : (
          <p className="text-xs text-muted-foreground">•••••••••••••••• (hidden)</p>
        )}
        <div>
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={async () => {
              const v = await run("rotate-api", rotateOwnApiKey);
              if (v) {
                setApiKey(v);
                router.refresh();
              }
            }}
          >
            {busy === "rotate-api" ? "Rotating…" : "Rotate API key"}
          </Button>
        </div>
      </section>

      {/* Webhook */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Webhook
        </h2>
        <form
          className="flex flex-col gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await run("save-url", () => updateOwnWebhookUrl(url));
            if (ok !== null) {
              setSavedUrl(true);
              router.refresh();
              setTimeout(() => setSavedUrl(false), 2000);
            }
          }}
        >
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <div className="flex items-center gap-2">
            <Input
              id="webhook-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://arcmc.com/hooks/gate"
            />
            <Button type="submit" variant="gold" size="sm" disabled={busy !== null}>
              {busy === "save-url" ? "Saving…" : "Save"}
            </Button>
          </div>
          {savedUrl && (
            <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
          )}
        </form>

        {webhookSecret ? (
          <SecretField label="Webhook secret" value={webhookSecret} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Webhook secret: {hasWebhookSecret ? "•••••••••••••••• (hidden)" : "Not set"}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {hasWebhookSecret && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={async () => {
                const v = await run("reveal-webhook", revealWebhookSecret);
                if (v) setWebhookSecret(v);
              }}
            >
              {busy === "reveal-webhook" ? "Revealing…" : "Reveal secret"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={async () => {
              const v = await run("rotate-webhook", rotateOwnWebhookSecret);
              if (v) {
                setWebhookSecret(v);
                router.refresh();
              }
            }}
          >
            {busy === "rotate-webhook" ? "Rotating…" : "Rotate secret"}
          </Button>
        </div>
      </section>
    </div>
  );
}
