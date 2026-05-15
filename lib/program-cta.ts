export const PROGRAM_SLUGS = {
  ONLINE: "online-program",
  CHINA_CAMP: "china-camp",
} as const;

export type ProgramSlug = (typeof PROGRAM_SLUGS)[keyof typeof PROGRAM_SLUGS];

export function programCtaHref(slug: string, isAuthenticated: boolean): string {
  const safe = encodeURIComponent(slug);
  return isAuthenticated
    ? `/participant/enrollment?program=${safe}`
    : `/register?program=${safe}`;
}

export const PENDING_PROGRAM_COOKIE = "gate.pending_program";
export const PENDING_PROGRAM_COOKIE_MAX_AGE_SEC = 15 * 60;
