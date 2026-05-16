"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useEffect, useRef } from "react";

interface Props {
  /** Hidden input name. Use this same name when reading FormData on the server. */
  name?: string;
  className?: string;
  /** Called with the token once Turnstile completes. */
  onVerify?: (token: string) => void;
}

/**
 * Universal Cloudflare Turnstile widget.
 *
 * Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set — safe drop-in
 * for any public form. The hidden input ensures the token reaches the server
 * via FormData under the standard "cf-turnstile-response" name.
 */
export function TurnstileWidget({
  name = "cf-turnstile-response",
  className,
  onVerify,
}: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    return () => {
      ref.current?.remove();
    };
  }, []);

  if (!siteKey) return null;

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      onSuccess={onVerify}
      options={{
        theme: "auto",
        size: "flexible",
        responseField: true,
        responseFieldName: name,
      }}
      className={className}
    />
  );
}
