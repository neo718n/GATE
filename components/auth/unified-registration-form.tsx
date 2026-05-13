"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/data/countries";

const PHONE_CODES = [
  { country: "Uzbekistan", dial: "+998", flag: "🇺🇿", iso: "UZ" },
  { country: "Kazakhstan", dial: "+7 (KZ)", flag: "🇰🇿", iso: "KZ" },
  { country: "Russia", dial: "+7 (RU)", flag: "🇷🇺", iso: "RU" },
  { country: "United States", dial: "+1 (US)", flag: "🇺🇸", iso: "US" },
  { country: "Canada", dial: "+1 (CA)", flag: "🇨🇦", iso: "CA" },
  { country: "United Kingdom", dial: "+44", flag: "🇬🇧", iso: "GB" },
  { country: "Germany", dial: "+49", flag: "🇩🇪", iso: "DE" },
  { country: "France", dial: "+33", flag: "🇫🇷", iso: "FR" },
  { country: "Azerbaijan", dial: "+994", flag: "🇦🇿", iso: "AZ" },
  { country: "Kyrgyzstan", dial: "+996", flag: "🇰🇬", iso: "KG" },
  { country: "Tajikistan", dial: "+992", flag: "🇹🇯", iso: "TJ" },
  { country: "Turkmenistan", dial: "+993", flag: "🇹🇲", iso: "TM" },
  { country: "Georgia", dial: "+995", flag: "🇬🇪", iso: "GE" },
  { country: "Armenia", dial: "+374", flag: "🇦🇲", iso: "AM" },
  { country: "Ukraine", dial: "+380", flag: "🇺🇦", iso: "UA" },
  { country: "Belarus", dial: "+375", flag: "🇧🇾", iso: "BY" },
  { country: "Poland", dial: "+48", flag: "🇵🇱", iso: "PL" },
  { country: "Turkey", dial: "+90", flag: "🇹🇷", iso: "TR" },
  { country: "South Korea", dial: "+82", flag: "🇰🇷", iso: "KR" },
  { country: "China", dial: "+86", flag: "🇨🇳", iso: "CN" },
  { country: "Japan", dial: "+81", flag: "🇯🇵", iso: "JP" },
  { country: "India", dial: "+91", flag: "🇮🇳", iso: "IN" },
  { country: "Pakistan", dial: "+92", flag: "🇵🇰", iso: "PK" },
  { country: "Indonesia", dial: "+62", flag: "🇮🇩", iso: "ID" },
  { country: "Malaysia", dial: "+60", flag: "🇲🇾", iso: "MY" },
  { country: "Singapore", dial: "+65", flag: "🇸🇬", iso: "SG" },
  { country: "Thailand", dial: "+66", flag: "🇹🇭", iso: "TH" },
  { country: "Vietnam", dial: "+84", flag: "🇻🇳", iso: "VN" },
  { country: "Philippines", dial: "+63", flag: "🇵🇭", iso: "PH" },
  { country: "UAE", dial: "+971", flag: "🇦🇪", iso: "AE" },
  { country: "Saudi Arabia", dial: "+966", flag: "🇸🇦", iso: "SA" },
  { country: "Iran", dial: "+98", flag: "🇮🇷", iso: "IR" },
  { country: "Egypt", dial: "+20", flag: "🇪🇬", iso: "EG" },
  { country: "South Africa", dial: "+27", flag: "🇿🇦", iso: "ZA" },
  { country: "Nigeria", dial: "+234", flag: "🇳🇬", iso: "NG" },
  { country: "Kenya", dial: "+254", flag: "🇰🇪", iso: "KE" },
  { country: "Ethiopia", dial: "+251", flag: "🇪🇹", iso: "ET" },
  { country: "Brazil", dial: "+55", flag: "🇧🇷", iso: "BR" },
  { country: "Mexico", dial: "+52", flag: "🇲🇽", iso: "MX" },
  { country: "Argentina", dial: "+54", flag: "🇦🇷", iso: "AR" },
  { country: "Colombia", dial: "+57", flag: "🇨🇴", iso: "CO" },
  { country: "Australia", dial: "+61", flag: "🇦🇺", iso: "AU" },
  { country: "Romania", dial: "+40", flag: "🇷🇴", iso: "RO" },
  { country: "Czech Republic", dial: "+420", flag: "🇨🇿", iso: "CZ" },
  { country: "Hungary", dial: "+36", flag: "🇭🇺", iso: "HU" },
  { country: "Mongolia", dial: "+976", flag: "🇲🇳", iso: "MN" },
  { country: "Afghanistan", dial: "+93", flag: "🇦🇫", iso: "AF" },
];

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Grade ${i + 1}`,
}));

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function UnifiedRegistrationForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phoneCode: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    school: "",
    grade: "",
    gender: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  // Auto-populate phone code when country changes
  useEffect(() => {
    if (form.country) {
      const matchedPhone = PHONE_CODES.find((p) => p.iso === form.country);
      if (matchedPhone) {
        setForm((prev) => ({ ...prev, phoneCode: matchedPhone.dial }));
      }
    }
  }, [form.country]);

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
        <Label>Phone</Label>
        <div className="flex gap-2">
          <Select
            value={form.phoneCode}
            onChange={set("phoneCode")}
            className="w-32 flex-shrink-0"
            required
          >
            <option value="" disabled>Code</option>
            {PHONE_CODES.map((p) => (
              <option key={p.iso} value={p.dial}>
                {p.flag} {p.dial}
              </option>
            ))}
          </Select>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="90 123 45 67"
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={set("dateOfBirth")}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            value={form.gender}
            onChange={set("gender")}
            required
          >
            <option value="" disabled>Select gender...</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={form.city}
          onChange={set("city")}
          placeholder="e.g. London, Seoul, Almaty"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="school">School / Institution</Label>
          <Input
            id="school"
            value={form.school}
            onChange={set("school")}
            placeholder="e.g. Lyceum No. 1"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="grade">Grade / Year</Label>
          <Select
            id="grade"
            value={form.grade}
            onChange={set("grade")}
            required
          >
            <option value="" disabled>Select grade...</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>
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
