"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/data/countries";

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { error: err } = await signUp.email({
        email: form.email,
        password: form.password,
        name: `${form.firstName} ${form.lastName}`.trim(),
        firstName: form.firstName,
        lastName: form.lastName,
        country: form.country,
      } as Parameters<typeof signUp.email>[0]);

      if (err) {
        setError(err.message ?? "Registration failed. Please try again.");
        setPending(false);
        return;
      }

      await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
        type: "email-verification",
      });

      sessionStorage.setItem("gate_verify_pw", form.password);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-1">
        <h1 className="font-serif text-3xl font-light text-foreground">
          Apply Now
        </h1>
        <p className="text-sm font-light text-muted-foreground">
          Create your G.A.T.E. Assessment account
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={set("firstName")}
            placeholder="Kenji"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={set("lastName")}
            placeholder="Nakamura"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="k.nakamura@sekolah.edu.sg"
          autoComplete="email"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="country">Country</Label>
        <Select
          id="country"
          value={form.country}
          onChange={set("country")}
          required
        >
          <option value="" disabled>Select your country...</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
        {pending ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-xs font-light text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-gate-gold hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </form>
  );
}