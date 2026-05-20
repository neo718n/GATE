"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PartnerLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { error: err } = await signIn.email({
        email,
        password,
        callbackURL: "/examPartner",
      });

      if (err) {
        setError(err.message ?? "Sign in failed. Please try again.");
        setPending(false);
        return;
      }

      window.location.href = "/examPartner";
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="mb-1 flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-light text-foreground">
          Sign In
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Access your partner assessment portal
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ops@arcmc.com"
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

      <Button
        type="submit"
        variant="gold"
        size="md"
        disabled={pending}
        className="mt-1"
      >
        {pending ? "Signing in…" : "Sign In"}
      </Button>

      <p className="text-center text-xs font-light text-muted-foreground">
        Credentials are provisioned by your assessment administrator.
      </p>
    </form>
  );
}
