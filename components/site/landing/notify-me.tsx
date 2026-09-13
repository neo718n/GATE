"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useActionState,
  type ReactNode,
} from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { submitWaitlistSignup, type WaitlistFormState } from "@/app/actions/waitlist";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/components/site/landing/country-combobox";
import { DEFAULT_COUNTRY_ISO } from "@/lib/phone-codes";

type NotifyMeContextValue = {
  open: () => void;
  defaultCountryIso: string;
};

const NotifyMeContext = createContext<NotifyMeContextValue | null>(null);

export function useNotifyMe(): NotifyMeContextValue {
  const ctx = useContext(NotifyMeContext);
  if (!ctx) throw new Error("useNotifyMe must be used within a NotifyMeProvider");
  return ctx;
}

export function NotifyMeButton({
  children,
  className,
  variant = "gold",
  size = "lg",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "outline" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const { open } = useNotifyMe();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        onClick?.();
        open();
      }}
    >
      {children}
    </Button>
  );
}

export function NotifyMeProvider({
  defaultCountryIso,
  children,
}: {
  defaultCountryIso: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <NotifyMeContext.Provider
      value={{ open: () => setIsOpen(true), defaultCountryIso: defaultCountryIso || DEFAULT_COUNTRY_ISO }}
    >
      {children}
      {isOpen && <NotifyMeDialog onClose={() => setIsOpen(false)} />}
    </NotifyMeContext.Provider>
  );
}

const INITIAL_STATE: WaitlistFormState = { success: false, error: null, fieldErrors: {} };

export function NotifyMeForm({
  source,
  layout = "stacked",
  submitLabel = "Notify Me",
  onDone,
}: {
  source: string;
  layout?: "stacked" | "grid";
  submitLabel?: string;
  onDone?: () => void;
}) {
  const { defaultCountryIso: iso } = useNotifyMe();
  const [state, action, pending] = useActionState(submitWaitlistSignup, INITIAL_STATE);
  const grid = layout === "grid";

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gate-gold/12">
          <Check className="h-6 w-6 text-gate-gold" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
            You&apos;re on the list.
          </h3>
          <p className="max-w-sm text-sm font-normal leading-[1.7] text-foreground/65">
            We&apos;ll write the moment the next edition is confirmed — host city, dates, and how
            to apply.
          </p>
        </div>
        {onDone && (
          <Button type="button" variant="outline" size="md" onClick={onDone} className="mt-2">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <input type="hidden" name="detectedCountryIso" value={iso} />
      <input type="hidden" name="source" value={source} />

      {state.error && (
        <p className="rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3 text-xs text-red-400">
          {state.error}
        </p>
      )}

      <div className={grid ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "flex flex-col gap-5"}>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${source}-fullName`}>Full Name</Label>
          <Input id={`${source}-fullName`} name="fullName" placeholder="Charlotte Weber" required />
          {state.fieldErrors.fullName && (
            <p className="text-xs text-red-400">{state.fieldErrors.fullName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${source}-email`}>Email</Label>
          <Input
            id={`${source}-email`}
            name="email"
            type="email"
            placeholder="charlotte.weber@example.com"
            required
          />
          {state.fieldErrors.email && <p className="text-xs text-red-400">{state.fieldErrors.email}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${source}-phoneNumber`}>Phone Number</Label>
          <div className="flex gap-2">
            <CountryCombobox name="phoneCountryIso" defaultIso={iso} variant="dial" />
            <Input
              id={`${source}-phoneNumber`}
              name="phoneNumber"
              type="tel"
              placeholder="71 234 56 78"
              className="flex-1"
              required
            />
          </div>
          {state.fieldErrors.phoneNumber && (
            <p className="text-xs text-red-400">{state.fieldErrors.phoneNumber}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${source}-countryIso`}>Country</Label>
          <CountryCombobox id={`${source}-countryIso`} name="countryIso" defaultIso={iso} variant="country" />
          {state.fieldErrors.countryIso && (
            <p className="text-xs text-red-400">{state.fieldErrors.countryIso}</p>
          )}
        </div>
      </div>

      <TurnstileWidget className="mt-1" />

      <Button type="submit" variant="gold" size="lg" disabled={pending} className="group mt-1 w-full">
        {pending ? "Submitting..." : submitLabel}
        {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </Button>
      <p className="-mt-1 text-center text-[11px] font-normal leading-relaxed text-foreground/45">
        Edition announcements only. Unsubscribe any time.
      </p>
    </form>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

function NotifyMeDialog({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Keep Tab inside the dialog — without this, focus walks off into the page
  // behind the overlay, which a keyboard or screen-reader user cannot see.
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el.tagName === "IFRAME",
    );
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;

    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        trapFocus(e);
      }}
    >
      <div
        className="absolute inset-0 bg-gate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notify-me-title"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl outline-none animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8 sm:p-10">
          <div className="mb-7 flex flex-col gap-2 pr-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gate-gold">
              Next Edition
            </span>
            <h3
              id="notify-me-title"
              className="font-serif text-[26px] font-medium leading-[1.15] text-foreground sm:text-3xl"
            >
              Dates not announced.
            </h3>
            <p className="text-sm font-normal leading-[1.65] text-foreground/65">
              One email when the host city and dates are confirmed. Registration opens to this
              list first.
            </p>
          </div>
          <NotifyMeForm source="homepage_modal" submitLabel="Notify Me When Dates Are Set" onDone={onClose} />
        </div>
      </div>
    </div>
  );
}
