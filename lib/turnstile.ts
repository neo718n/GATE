import "server-only";

export const TURNSTILE_FIELD = "cf-turnstile-response";

/**
 * Verify a Cloudflare Turnstile token against Cloudflare's siteverify endpoint.
 *
 * Returns `true` and short-circuits when `TURNSTILE_SECRET_KEY` is not configured
 * (dev / preview environments), so callers don't need to branch.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export function isTurnstileConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}
