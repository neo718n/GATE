"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContact, type ContactFormState } from "@/app/actions/contact";
import { TurnstileWidget } from "@/components/turnstile-widget";

const INITIAL: ContactFormState = { success: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, INITIAL);

  if (state.success) {
    return (
      <div className="flex flex-col items-start gap-4 border border-gate-gold/30 bg-gate-gold/5 p-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gate-gold">
          Message Sent
        </span>
        <p className="text-sm font-light text-gate-800/65">
          Thank you for reaching out. We will get back to you as soon as
          possible.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {state.error && (
        <p className="text-sm text-red-400 border border-red-400/30 bg-red-400/5 px-4 py-3">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Smith"
            autoComplete="name"
            required
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-red-400">{state.fieldErrors.name}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            required
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-400">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Registration inquiry, partnership, etc."
          required
        />
        {state.fieldErrors?.subject && (
          <p className="text-xs text-red-400">{state.fieldErrors.subject}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Write your message here..."
          rows={6}
          required
        />
        {state.fieldErrors?.message && (
          <p className="text-xs text-red-400">{state.fieldErrors.message}</p>
        )}
      </div>

      <TurnstileWidget />

      <Button type="submit" variant="gold" size="md" disabled={pending}>
        {pending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}

