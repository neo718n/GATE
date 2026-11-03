// Brand identity used by metadata, structured data, sitemap and llms.txt.
// One source of truth so Google and AI assistants see the same names
// everywhere.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gate-assessment.org").replace(/\/$/, "");

export const BRAND = {
  name: "G.A.T.E.",
  legalName: "Global Academic & Theoretical Excellence Assessment",
  /** What the letters stand for — stated up front so search engines and AI
   *  answers don't guess (e.g. "Gifted and Talented Education"). */
  expansion: "Global Academic & Theoretical Excellence",
  shortDescription:
    "G.A.T.E. (GATE) stands for Global Academic & Theoretical Excellence. It is an international academic program for students in Grades 1–12: a week at a Chinese university combining an academic assessment graded by university professors, campus life, lectures and cultural excursions.",
  email: "partnerships@gate-assessment.org",
  operator: "EdSquare",
  founded: "2025",
  logo: "/brand/GATE-Logo-Primary-Dark@2x.png",
  // Only profiles that actually exist.
  sameAs: ["https://instagram.com/gate.assessment"],
} as const;

/** Public contact channels. WhatsApp is the priority channel. */
export const CONTACT = {
  whatsapp: { display: "+61 469 898 853", href: "https://wa.me/61469898853" },
  email: { display: "partnerships@gate-assessment.org", href: "mailto:partnerships@gate-assessment.org" },
  instagram: { display: "@gate.assessment", href: "https://instagram.com/gate.assessment" },
} as const;

/**
 * Every way people type the name. Used as schema.org alternateName and as
 * metadata keywords. "Olympiad" appears here on purpose and nowhere in page
 * copy.
 */
export const BRAND_ALIASES = [
  "GATE",
  "G.A.T.E",
  "G.A.T.E.",
  "Gate",
  "GATE Assessment",
  "G.A.T.E. Assessment",
  "Gate Assessment",
  "GATE Olympiad",
  "G.A.T.E. Olympiad",
  "Gate Olympiad",
  "GATE Olympiad Camp",
  "GATE Academic Camp",
  "GATE China Camp",
  "GATE Winter Camp",
  "GATE Summer Camp",
  "Global Academic & Theoretical Excellence Assessment",
  "Global Academic and Theoretical Excellence",
] as const;

export const SEO_KEYWORDS = [
  ...BRAND_ALIASES,
  "gate-assessment.org",
  "international olympiad camp China",
  "academic camp China for students",
  "olympiad for school students",
  "math olympiad camp China",
  "English olympiad for kids",
  "Shaoxing University winter camp",
  "Xidian University summer camp",
];

/**
 * Answers the "GATE Olympiad" search intent in visible copy without
 * positioning GATE as a competition. Used on /about, every upcoming year's
 * FAQ and llms.txt.
 */
export const OLYMPIAD_FAQ = {
  q: "Is G.A.T.E. an olympiad?",
  a: "Many families search for us as \"GATE Olympiad\" — and G.A.T.E. is more than an olympiad. As in an olympiad, 1st, 2nd and 3rd place in every subject and grade band receive gold, silver and bronze medals, place certificates and prizes. But the most important outcome is the diagnostic report every participant receives: where they are strong, which areas need development, and recommended resources to close those gaps.",
} as const;

/**
 * Plain-language disambiguation. Shown on /about and in llms.txt so search
 * engines and AI assistants don't mix GATE up with unrelated namesakes.
 */
export const NOT_TO_CONFUSE = [
  "the GATE engineering entrance exam in India (Graduate Aptitude Test in Engineering)",
  "the Gate.io cryptocurrency exchange",
  "US school programs for gifted students that are also called GATE — G.A.T.E. is not a gifted-and-talented program and does not stand for “Gifted and Talented Education”",
] as const;

/** One-line answer to "what does G.A.T.E. stand for", used in llms.txt. */
export const NAME_MEANING =
  "G.A.T.E. stands for Global Academic & Theoretical Excellence. It does not stand for “Gifted and Talented Education” or “Gifted & Talented Education Assessment”.";
