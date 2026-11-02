// Absolute URLs for the two portals. Local development uses the
// *.localhost subdomains, which browsers resolve without any setup.

const PROD = process.env.NODE_ENV === "production";

export const APPLY_URL =
  process.env.NEXT_PUBLIC_APPLY_URL ?? (PROD ? "https://apply.gate-assessment.org" : "http://apply.localhost:3000");

export const PARTNERS_URL =
  process.env.NEXT_PUBLIC_PARTNERS_URL ?? (PROD ? "https://partners.gate-assessment.org" : "http://partners.localhost:3000");

export const MAIN_URL = PROD ? "https://gate-assessment.org" : "http://localhost:3000";

export const inviteUrl = (token: string) => `${APPLY_URL}/r/${token}`;
