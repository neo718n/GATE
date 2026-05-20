"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updatePartner,
  regenerateApiKey,
  regenerateSharedSecret,
  regenerateWebhookSecret,
} from "@/lib/actions/integrations";
import type { IntegrationPartnerStatus } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecretField } from "@/components/partner/secret-field";

const SELECT_CLASS =
  "h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground focus:border-gate-gold focus:outline-none";

export function PartnerSettingsForm({
  partnerId,
  name: initialName,
  status: initialStatus,
  webhookUrl: initialWebhookUrl,
}: {
  partnerId: number;
  name: string;
  status: IntegrationPartnerStatus;
  webhookUrl: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<IntegrationPartnerStatus>(initialStatus);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSecret, setNewSecret] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updatePartner({
        partnerId,
        name,
        status,
        webhookUrl: webhookUrl.trim() || null,
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function rotate(
    kind: "api" | "shared" | "webhook",
    label: string,
    fn: () => Promise<{ [k: string]: string }>,
    field: string,
  ) {
    setError(null);
    setRotating(kind);
    try {
      const r = await fn();
      setNewSecret({ label, value: r[field] });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate");
    } finally {
      setRotating(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {newSecret && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gate-gold/40 bg-gate-gold/5 p-5">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            New secret generated — shown <strong>once</strong>. The old value is
            now invalid.
          </p>
          <SecretField label={newSecret.label} value={newSecret.value} />
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewSecret(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <form
        onSubmit={save}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Settings
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Partner name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as IntegrationPartnerStatus)
              }
              className={SELECT_CLASS}
            >
              <option value="active">Active</option>
              <option value="sandbox">Sandbox</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="webhook">Webhook URL</Label>
          <Input
            id="webhook"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://arcmc.com/hooks/gate"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" variant="gold" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {saved && (
            <span className="text-xs text-green-600 dark:text-green-400">
              Saved
            </span>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Credentials
        </h2>
        <p className="text-xs font-light text-muted-foreground">
          Rotating a credential immediately invalidates the previous value. The
          new value is shown once.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={rotating !== null}
            onClick={() =>
              rotate(
                "shared",
                "Shared secret (HS256)",
                () => regenerateSharedSecret(partnerId),
                "sharedSecret",
              )
            }
          >
            {rotating === "shared" ? "Rotating…" : "Rotate shared secret"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rotating !== null}
            onClick={() =>
              rotate(
                "api",
                "API key",
                () => regenerateApiKey(partnerId),
                "apiKey",
              )
            }
          >
            {rotating === "api" ? "Rotating…" : "Rotate API key"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rotating !== null}
            onClick={() =>
              rotate(
                "webhook",
                "Webhook secret",
                () => regenerateWebhookSecret(partnerId),
                "webhookSecret",
              )
            }
          >
            {rotating === "webhook" ? "Rotating…" : "Rotate webhook secret"}
          </Button>
        </div>
      </div>
    </div>
  );
}
