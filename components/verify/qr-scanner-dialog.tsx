"use client";

import { X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

interface Props {
  onScanned: (raw: string) => void;
  onClose: () => void;
}

export function QrScannerDialog({ onScanned, onClose }: Props) {
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setUnsupported(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scan QR code"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-tight">
            Scan certificate QR code
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="rounded-lg p-1.5 text-foreground/60 hover:text-foreground hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gate-gold/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gate-900">
          {unsupported ? (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-6 w-6 text-gate-gold mx-auto" />
                <p className="text-sm text-gate-white/80">
                  Your browser can't access the camera. Please type the
                  verification code instead.
                </p>
              </div>
            </div>
          ) : (
            <Scanner
              onScan={(results) => {
                if (results[0]?.rawValue) onScanned(results[0].rawValue);
              }}
              onError={() => setUnsupported(true)}
              formats={["qr_code"]}
              components={{ finder: true }}
            />
          )}
        </div>
        <p className="mt-3 text-xs text-foreground/50">
          Point your camera at the QR code printed on the certificate.
        </p>
      </div>
    </div>
  );
}
