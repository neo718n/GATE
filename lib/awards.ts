import type { Award } from "@/lib/db/schema";

// Shared display vocabulary for the `award` enum (gold/silver/bronze/
// honorable_mention/participation) — used by certificates, results, and
// event badge contest performance. Previously duplicated between
// components/verify/result-card.tsx and lib/certificates/render-pdf.tsx;
// consolidated here so a third/fourth consumer doesn't copy-paste again.

export const AWARD_LABELS: Record<Award, string> = {
  gold: "Gold Medal",
  silver: "Silver Medal",
  bronze: "Bronze Medal",
  honorable_mention: "Honorable Mention",
  participation: "Participation",
};

// Tailwind classes — web (React DOM) use only, not usable inside @react-pdf/renderer.
export const AWARD_CLASSES: Record<Award, string> = {
  gold: "bg-gate-gold/15 text-gate-gold border-gate-gold/30",
  silver: "bg-foreground/10 text-foreground border-foreground/20",
  bronze: "bg-amber-700/10 text-amber-700 dark:text-amber-500 border-amber-700/30",
  honorable_mention: "bg-gate-700/10 text-gate-700 dark:text-gate-600 border-gate-700/30",
  participation: "bg-foreground/5 text-foreground/70 border-border",
};
