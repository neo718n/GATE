"use client";

import { useActionState } from "react";
import { submitPartnerApplication, type PartnerFormState } from "@/app/actions/partnership";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const INITIAL: PartnerFormState = { success: false, error: null, fieldErrors: {} };

const TYPES = [
  { value: "university", label: "University" },
  { value: "school", label: "School" },
  { value: "academic_institution", label: "Academic Institution" },
  { value: "organization", label: "Educational Organization" },
];

const COOP_TYPES = [
  "Official Partner School",
  "Exam Center",
  "Sponsor",
  "Academic Advisor",
  "Regional Representative",
  "Other",
];

export function PartnershipForm() {
  const [state, action, pending] = useActionState(submitPartnerApplication, INITIAL);

  if (state.success) {
    return (
      <div className="border border-gate-gold/30 bg-gate-gold/5 p-8 flex flex-col gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gate-gold">Application Received</p>
        <p className="text-sm font-light text-gate-800/65 leading-[1.9]">
          Thank you for your interest in partnering with G.A.T.E. Our team will review your application and contact you within 5–7 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {state.error && (
        <p className="text-xs text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">{state.error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input id="organizationName" name="organizationName" placeholder="Institution name" required />
          {state.fieldErrors.organizationName && <p className="text-xs text-red-400">{state.fieldErrors.organizationName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Organization Type</Label>
          <select id="type" name="type" required className="flex h-10 w-full border border-border/50 bg-gate-white px-3 py-2 text-sm font-light text-gate-800 placeholder:text-gate-gray/50 focus:outline-none focus:ring-1 focus:ring-gate-gold/40">
            <option value="">Select type</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {state.fieldErrors.type && <p className="text-xs text-red-400">{state.fieldErrors.type}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="Country" required />
          {state.fieldErrors.country && <p className="text-xs text-red-400">{state.fieldErrors.country}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="City (optional)" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" placeholder="https://example.com (optional)" />
        {state.fieldErrors.website && <p className="text-xs text-red-400">{state.fieldErrors.website}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactName">Contact Person</Label>
          <Input id="contactName" name="contactName" placeholder="Full name" required />
          {state.fieldErrors.contactName && <p className="text-xs text-red-400">{state.fieldErrors.contactName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" placeholder="email@institution.com" required />
          {state.fieldErrors.contactEmail && <p className="text-xs text-red-400">{state.fieldErrors.contactEmail}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cooperationType">Partnership Type Interest</Label>
        <select id="cooperationType" name="cooperationType" className="flex h-10 w-full border border-border/50 bg-gate-white px-3 py-2 text-sm font-light text-gate-800 placeholder:text-gate-gray/50 focus:outline-none focus:ring-1 focus:ring-gate-gold/40">
          <option value="">Select (optional)</option>
          {COOP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea id="message" name="message" placeholder="Tell us about your institution and how you see the partnership developing..." rows={4} />
      </div>

      <Button type="submit" variant="gold" size="md" disabled={pending}>
        {pending ? "Submitting..." : "Submit Partnership Application"}
      </Button>
    </form>
  );
}
