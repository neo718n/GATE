"use client";

import { useActionState } from "react";
import { submitCareerApplication, type CareerFormState } from "@/app/actions/career";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const INITIAL: CareerFormState = { success: false, error: null, fieldErrors: {} };

export function CareerForm({ positionTitle }: { positionTitle: string }) {
  const [state, action, pending] = useActionState(submitCareerApplication, INITIAL);

  if (state.success) {
    return (
      <div className="border border-gate-gold/30 bg-gate-gold/5 p-8 flex flex-col gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gate-gold">Application Received</p>
        <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
          Thank you for applying to G.A.T.E. Our HR team will review your application and be in touch within 7–10 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="positionTitle" value={positionTitle} />

      {state.error && (
        <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">{state.error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" placeholder="Your full name" required />
          {state.fieldErrors.fullName && <p className="text-xs text-red-400">{state.fieldErrors.fullName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          {state.fieldErrors.email && <p className="text-xs text-red-400">{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="Country of residence" required />
          {state.fieldErrors.country && <p className="text-xs text-red-400">{state.fieldErrors.country}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+1 234 567 8900" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="motivationText">Motivation Letter</Label>
        <Textarea id="motivationText" name="motivationText" placeholder="Tell us about your background, why you want to work with G.A.T.E., and what you would bring to this role..." rows={6} required />
        {state.fieldErrors.motivationText && <p className="text-xs text-red-400">{state.fieldErrors.motivationText}</p>}
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending} className="mt-1">
        {pending ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
