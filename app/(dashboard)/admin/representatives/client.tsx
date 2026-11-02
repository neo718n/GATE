"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { adminAddRepresentative, adminSetRepresentativeActive } from "@/lib/actions/applications";

const field =
  "h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gate-gold";

export function AddRepresentativeForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      ref={ref}
      action={(fd) =>
        start(async () => {
          const res = await adminAddRepresentative(fd);
          if (!res.ok) return setError(res.error);
          setError(null);
          ref.current?.reset();
          toast.success("Representative added — they can now sign in with their email");
        })
      }
      className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
    >
      <input name="name" placeholder="Full name" required className={field} />
      <input name="email" type="email" placeholder="Email" required className={field} />
      <input name="organization" placeholder="Organization (optional)" className={field} />
      <input name="phone" placeholder="Phone (optional)" className={field} />
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-gate-gold px-5 text-sm font-semibold text-gate-800 transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Add to whitelist
      </button>
      {error && <p className="text-sm text-destructive md:col-span-5">{error}</p>}
    </form>
  );
}

export function RepresentativeToggle({ id, active }: { id: number; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => adminSetRepresentativeActive(id, !active))}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        active ? "border-green-200 text-green-700" : "border-border text-foreground/50"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </button>
  );
}
