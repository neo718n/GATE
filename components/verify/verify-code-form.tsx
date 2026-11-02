"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ScanLine, ArrowRight, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { formatCode, isValidCodeShape } from "@/lib/certificates/code";
import { useLocale } from "@/lib/i18n/client";
import { localizePath } from "@/lib/i18n/config";

const QrScannerDialog = dynamic(
  () => import("./qr-scanner-dialog").then((m) => m.QrScannerDialog),
  { ssr: false },
);

export function VerifyCodeForm() {
  const router = useRouter();
  const locale = useLocale();
  const ru = locale === "ru";
  const [code, setCode] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function go(canonical: string) {
    setError(null);
    if (!isValidCodeShape(canonical)) {
      setError(
        ru
          ? "Похоже, это не код проверки G.A.T.E. Коды выглядят так: GATE-ГГГГ-ПРЕДМЕТ-XXXXXX."
          : "That doesn't look like a valid G.A.T.E. verification code. Codes follow the pattern GATE-YYYY-SUBJECT-XXXXXX.",
      );
      return;
    }
    startTransition(() => {
      router.push(localizePath(`/verify/${encodeURIComponent(canonical)}`, locale));
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    go(formatCode(code));
  }

  function handleScanned(raw: string) {
    setScanOpen(false);
    try {
      const url = new URL(raw);
      const match = url.pathname.match(/\/verify\/([^/]+)/);
      if (match?.[1]) {
        go(formatCode(decodeURIComponent(match[1])));
        return;
      }
    } catch {
      // not a URL — treat as raw code
    }
    setCode(formatCode(raw));
    go(formatCode(raw));
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="w-full">
        <label htmlFor="cert-code" className="sr-only">
          {ru ? "Код проверки" : "Verification code"}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            id="cert-code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={ru ? "Код проверки" : "Verification code"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "code-error" : "code-hint"}
            placeholder="GATE-2026-MATH-A7K9X2"
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            className="flex-1 h-14 rounded-xl border border-border bg-card px-5 font-mono text-base tracking-wider text-foreground placeholder:text-foreground/30 focus-visible:outline-none focus-visible:border-gate-gold focus-visible:ring-2 focus-visible:ring-gate-gold/20 transition-colors uppercase"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending || code.length === 0}
            className="h-14"
          >
            {isPending ? (ru ? "Проверяем…" : "Verifying…") : ru ? "Проверить" : "Verify"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p
            id="code-hint"
            className="text-xs text-foreground/50 font-sans"
          >
            {ru ? "Код указан на каждом сертификате G.A.T.E. под QR-кодом." : "Found on every G.A.T.E. certificate, beneath the QR code."}
          </p>
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-gate-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gate-gold/30 rounded px-1"
          >
            <ScanLine className="h-3.5 w-3.5" aria-hidden />
            {ru ? "Сканировать QR" : "Scan QR"}
          </button>
        </div>
        {error && (
          <div
            id="code-error"
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              aria-hidden
            />
            <span>{error}</span>
          </div>
        )}
      </form>
      {scanOpen && (
        <QrScannerDialog
          onScanned={handleScanned}
          onClose={() => setScanOpen(false)}
        />
      )}
    </>
  );
}
