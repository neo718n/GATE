"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createPartnerTenant,
  type ProvisionResult,
} from "@/lib/actions/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecretField } from "@/components/partner/secret-field";

export function NewPartnerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const r = await createPartnerTenant({ name, loginEmail: email });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create partner");
    } finally {
      setPending(false);
    }
  }

  function done() {
    setResult(null);
    setOpen(false);
    setName("");
    setEmail("");
    router.refresh();
  }

  // One-time credentials panel
  if (result) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-gate-gold/40 bg-gate-gold/5 p-6">
        <div>
          <h3 className="font-serif text-lg font-light text-foreground">
            Partner created — save these now
          </h3>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            These secrets are shown <strong>once</strong>. Share them securely
            with the partner; they cannot be retrieved later (only rotated).
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <SecretField label="Client ID" value={result.clientId} defaultHidden={false} />
          <SecretField label="Shared secret (HS256)" value={result.sharedSecret} />
          <SecretField label="API key" value={result.apiKey} />
          <SecretField label="Portal login email" value={result.loginEmail} defaultHidden={false} mono={false} />
          <SecretField label="Temporary password" value={result.tempPassword} />
        </div>
        <div>
          <Button variant="gold" size="sm" onClick={done}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New partner
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="font-serif text-lg font-light text-foreground">
        New integration partner
      </h3>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-name">Partner name</Label>
          <Input
            id="partner-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ArcMC"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-email">Portal login email</Label>
          <Input
            id="partner-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ops@arcmc.com"
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" variant="gold" size="sm" disabled={pending}>
          {pending ? "Creating…" : "Create partner"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
