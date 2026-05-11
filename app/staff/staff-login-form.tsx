"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  coordinator: "/coordinator",
  partner_contact: "/partner",
};

export function StaffLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { error: err, data } = await signIn.email({
      email,
      password,
      callbackURL: "/admin",
    });

    if (err) {
      setError(err.message ?? "Sign in failed. Please check your credentials.");
      setPending(false);
      return;
    }

    const role = (data as unknown as { user?: { role?: string } })?.user?.role ?? "";
    router.push(ROLE_HOME[role] ?? "/admin");
  }

  return (
    <div className="w-full border border-gate-fog bg-gate-white p-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
            Staff Portal
          </span>
          <h1 className="font-serif text-3xl font-light text-gate-800">
            Administration
          </h1>
          <p className="text-sm font-light text-gate-800/65 mt-1">
            Restricted access. Staff credentials only.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 border border-red-200 bg-red-50 px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gate-assessment.org"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
          {pending ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
