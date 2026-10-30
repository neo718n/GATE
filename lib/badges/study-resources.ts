// Curated study resources for the China Camp 2026 diagnostic report — one
// shortlist per (topic × grade band). Every URL below was opened and confirmed
// to resolve to the named page on 2026-10-30 (Khan Academy pages checked in a
// real browser since curl gets a bot challenge there). Re-check before reusing
// for a future cohort — unit slugs on Khan Academy do change occasionally.

import type { MathQuestionKey } from "@/lib/badges/answer-keys";

export interface StudyResource {
  title: string;
  provider: string;
  url: string;
  why: string;
  // Subscription required — flagged in the PDF so families are not surprised.
  paid?: true;
}

export type MathDomain = MathQuestionKey["domain"];
export type MathBand = "junior" | "middle" | "senior";
export type EnglishSection = "A" | "B" | "C";
export type EnglishPaper = "cat4" | "cat5";

// Category 1–2 → Grades 1–4, 3–4 → Grades 5–8, 5 → Grades 9–11
export function mathBandFor(category: number): MathBand {
  if (category <= 2) return "junior";
  if (category <= 4) return "middle";
  return "senior";
}

const R = {
  khanEarly: {
    title: "Early Math Review",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/early-math",
    why: "Short videos + instant-feedback practice on counting, place value and early operations.",
  },
  khanPlaceValue: {
    title: "4th Grade — Place Value",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/cc-fourth-grade-math/imp-place-value-and-rounding-2",
    why: "Builds the digit-and-place-value sense behind 'biggest / smallest number' questions.",
  },
  khanFactors: {
    title: "Pre-algebra — Factors and Multiples",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/pre-algebra/pre-algebra-factors-multiples",
    why: "Divisibility, primes, GCF/LCM — the core toolkit for number questions.",
  },
  khanRoots: {
    title: "Pre-algebra — Roots, Exponents & Scientific Notation",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/pre-algebra/pre-algebra-exponents-radicals",
    why: "Exponent rules and square roots, practised until they are automatic.",
  },
  khanExpRad: {
    title: "Algebra 1 — Exponents & Radicals",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals",
    why: "Comparing and simplifying powers and roots — exactly what the harder number items test.",
  },
  khanArithPatterns: {
    title: "3rd Grade — Arithmetic Patterns & Problem Solving",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/cc-third-grade-math/arithmetic-patterns-and-problem-solving",
    why: "Finding the rule in a number pattern and turning word problems into steps.",
  },
  khanThirdGrade: {
    title: "3rd Grade Math (full course)",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/cc-third-grade-math",
    why: "Structured course with mastery checks — a solid spine for Grades 1–4 practice.",
  },
  khanSequences: {
    title: "Algebra 1 — Sequences",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:sequences",
    why: "Arithmetic and geometric sequences, and writing the rule as a formula.",
  },
  khanLinear: {
    title: "Algebra 1 — Linear Equations & Graphs",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs",
    why: "Reading, extending and matching straight-line graphs; building equations from words.",
  },
  khanAlgebraBasics: {
    title: "Algebra Basics",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/algebra-basics",
    why: "Variables, expressions and one-/two-step equations from first principles.",
  },
  khanBasicGeo: {
    title: "Basic Geometry and Measurement",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/basic-geo",
    why: "Shapes, area, perimeter, angles and volume with step-by-step practice.",
  },
  khanSimilarity: {
    title: "High School Geometry — Similarity",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/geometry/hs-geo-similarity",
    why: "Similar triangles and proportional reasoning — the key to 'shadow' and ratio-of-lengths items.",
  },
  khanCounting: {
    title: "Counting, Permutations & Combinations",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/statistics-probability/counting-permutations-and-combinations",
    why: "Systematic counting so no case is missed or counted twice.",
  },
  khanProbability: {
    title: "Statistics — Probability",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/statistics-probability/probability-library",
    why: "Probability built on careful counting of outcomes.",
  },
  khanRatios: {
    title: "Pre-algebra — Ratios and Rates",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates",
    why: "Unit rates, ratio tables and speed–distance–time in one place.",
  },
  khanProportional: {
    title: "7th Grade — Proportional Relationships",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/cc-seventh-grade-math/cc-7th-ratio-proportion",
    why: "Spotting and using proportional relationships in tables, graphs and equations.",
  },
  khanData6: {
    title: "6th Grade — Data and Statistics",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-data-statistics",
    why: "Reading bar charts, dot plots and summaries accurately.",
  },
  khanStats: {
    title: "Statistics and Probability",
    provider: "Khan Academy",
    url: "https://www.khanacademy.org/math/statistics-probability",
    why: "Full course on displaying, interpreting and comparing data.",
  },
  mifSequences: {
    title: "Sequences",
    provider: "Math is Fun",
    url: "https://www.mathsisfun.com/algebra/sequences-series.html",
    why: "Friendly, illustrated explanation of how to find the rule of a sequence.",
  },
  mifCombos: {
    title: "Combinations and Permutations",
    provider: "Math is Fun",
    url: "https://www.mathsisfun.com/combinatorics/combinations-permutations.html",
    why: "Plain-language intro to when order matters and when it doesn't.",
  },
  mifData: {
    title: "Data and Graphs",
    provider: "Math is Fun",
    url: "https://www.mathsisfun.com/data/index.html",
    why: "Every common chart type explained with interactive examples.",
  },
  mifNumbers: {
    title: "Numbers",
    provider: "Math is Fun",
    url: "https://www.mathsisfun.com/numbers/index.html",
    why: "Clear reference for place value, digits, odd/even and number properties.",
  },
  mifGeometry: {
    title: "Geometry",
    provider: "Math is Fun",
    url: "https://www.mathsisfun.com/geometry/index.html",
    why: "Visual reference for shapes, angles and transformations.",
  },
  mifPuzzles: {
    title: "Puzzles",
    provider: "Math is Fun",
    url: "https://www.mathsisfun.com/puzzles/index.html",
    why: "Logic and number puzzles graded by difficulty, with solutions.",
  },
  beast: {
    title: "Beast Academy",
    provider: "Art of Problem Solving",
    url: "https://beastacademy.com/",
    why: "The best-known olympiad-style curriculum for ages 6–13 — puzzles first, rules second.",
    paid: true,
  },
  alcumus: {
    title: "Alcumus (free adaptive practice)",
    provider: "Art of Problem Solving",
    url: "https://artofproblemsolving.com/alcumus",
    why: "Free adaptive problem bank built for math-competition students, with full solutions.",
  },
  nrichPrimary: {
    title: "NRICH — Primary Students",
    provider: "University of Cambridge",
    url: "https://nrich.maths.org/students/primary",
    why: "Rich, open-ended problems that build reasoning rather than routine.",
  },
  nrichSecondary: {
    title: "NRICH — Secondary Students",
    provider: "University of Cambridge",
    url: "https://nrich.maths.org/students/secondary",
    why: "Challenge problems with published student solutions to compare against.",
  },
  ukmt: {
    title: "UKMT Competition Papers",
    provider: "UK Mathematics Trust",
    url: "https://ukmt.org.uk/competition-papers",
    why: "Past multiple-choice challenge papers in the same 25-question format as GATE.",
  },
  kangaroo: {
    title: "Math Kangaroo — Sample Problems",
    provider: "Math Kangaroo",
    url: "https://www.mathkangaroo.org/mks/",
    why: "International contest with grade-level papers — ideal timed practice.",
  },
  keen: {
    title: "Keen (KenKen-style arithmetic grid)",
    provider: "Simon Tatham's Puzzle Collection",
    url: "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/keen.html",
    why: "Free, endless versions of the 'cage with an operation' grid logic puzzles.",
  },
  unequal: {
    title: "Unequal (Futoshiki-style grid)",
    provider: "Simon Tatham's Puzzle Collection",
    url: "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/unequal.html",
    why: "Free, endless greater-than / less-than grid puzzles to train step-by-step deduction.",
  },

  // ── English ──
  bcTeensGrammarA: {
    title: "A1–A2 Grammar",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar",
    why: "Video explanations + online exercises for each core grammar point.",
  },
  bcTeensGrammarB: {
    title: "B1–B2 Grammar",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/grammar/b1-b2-grammar",
    why: "Conditionals, passives, reported speech and relative clauses with practice.",
  },
  bcTeensVocabA: {
    title: "A1–A2 Vocabulary",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/vocabulary/a1-a2-vocabulary",
    why: "Topic-based word sets with games and exercises.",
  },
  bcTeensVocabB: {
    title: "B2–C1 Vocabulary",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/vocabulary/b2-c1-vocabulary",
    why: "Collocations, word formation and higher-level topic vocabulary.",
  },
  bcTeensReadA2: {
    title: "A2 Reading",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/skills/reading/a2-reading",
    why: "Short graded texts with comprehension tasks.",
  },
  bcTeensReadB1: {
    title: "B1 Reading",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/skills/reading/b1-reading",
    why: "Graded texts that train main idea, detail and inference.",
  },
  bcTeensReadB2: {
    title: "B2 Reading",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/skills/reading/b2-reading",
    why: "Longer texts with opinion, argument and inference questions.",
  },
  bcTeensReadC1: {
    title: "C1 Reading",
    provider: "British Council · LearnEnglish Teens",
    url: "https://learnenglishteens.britishcouncil.org/skills/reading/c1-reading",
    why: "Advanced texts focused on stance, tone and implied meaning.",
  },
  pegExercises: {
    title: "English Grammar Exercises",
    provider: "Perfect English Grammar",
    url: "https://www.perfect-english-grammar.com/grammar-exercises.html",
    why: "Hundreds of focused exercises with answers — including advanced conditionals, inversion and the subjunctive.",
  },
  cambridgeActivities: {
    title: "Activities for Learners",
    provider: "Cambridge English",
    url: "https://www.cambridgeenglish.org/learning-english/activities-for-learners/",
    why: "Free official practice filtered by CEFR level and skill.",
  },
  bbcLowerInt: {
    title: "Lower Intermediate Course",
    provider: "BBC Learning English",
    url: "https://www.bbc.co.uk/learningenglish/english/course/lower-intermediate",
    why: "Structured weekly units covering grammar, vocabulary and listening.",
  },
  bbcTowardsAdvanced: {
    title: "Towards Advanced Course",
    provider: "BBC Learning English",
    url: "https://www.bbc.co.uk/learningenglish/english/course/towards-advanced",
    why: "Advanced grammar and register in short daily lessons.",
  },
  oxford3000: {
    title: "The Oxford 3000 & 5000",
    provider: "Oxford Learner's Dictionaries",
    url: "https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000",
    why: "The core words every learner should know, tagged by CEFR level.",
  },
  opal: {
    title: "OPAL — Oxford Phrasal Academic Lexicon",
    provider: "Oxford Learner's Dictionaries",
    url: "https://www.oxfordlearnersdictionaries.com/wordlists/opal",
    why: "The academic words and phrases that C1–C2 vocabulary items are built from.",
  },
  newsInLevels: {
    title: "News in Levels",
    provider: "News in Levels",
    url: "https://www.newsinlevels.com/",
    why: "Real news written at three levels — read daily to build speed and inference.",
  },
  commonlit: {
    title: "CommonLit",
    provider: "CommonLit (free nonprofit)",
    url: "https://www.commonlit.org/",
    why: "Free graded passages with text-dependent questions on argument and tone.",
  },
} satisfies Record<string, StudyResource>;

export const MATH_RESOURCES: Record<MathDomain, Record<MathBand, StudyResource[]>> = {
  NUM: {
    junior: [R.khanEarly, R.khanPlaceValue, R.mifNumbers],
    middle: [R.khanFactors, R.khanRoots, R.alcumus],
    senior: [R.khanExpRad, R.khanFactors, R.alcumus],
  },
  ALG: {
    junior: [R.khanArithPatterns, R.khanThirdGrade, R.beast],
    middle: [R.khanAlgebraBasics, R.khanLinear, R.alcumus],
    senior: [R.khanLinear, R.khanExpRad, R.alcumus],
  },
  GEO: {
    junior: [R.khanBasicGeo, R.mifGeometry, R.beast],
    middle: [R.khanBasicGeo, R.khanSimilarity, R.nrichSecondary],
    senior: [R.khanSimilarity, R.alcumus, R.nrichSecondary],
  },
  COM: {
    junior: [R.mifCombos, R.nrichPrimary, R.beast],
    middle: [R.khanCounting, R.mifCombos, R.alcumus],
    senior: [R.khanCounting, R.khanProbability, R.alcumus],
  },
  LOG: {
    junior: [R.mifPuzzles, R.nrichPrimary, R.kangaroo],
    middle: [R.keen, R.unequal, R.ukmt],
    senior: [R.keen, R.unequal, R.ukmt],
  },
  PAT: {
    junior: [R.khanArithPatterns, R.mifSequences, R.nrichPrimary],
    middle: [R.mifSequences, R.khanSequences, R.nrichSecondary],
    senior: [R.khanSequences, R.nrichSecondary, R.ukmt],
  },
  PRO: {
    junior: [R.khanThirdGrade, R.beast, R.kangaroo],
    middle: [R.khanRatios, R.khanProportional, R.alcumus],
    senior: [R.khanRatios, R.khanProportional, R.alcumus],
  },
  DAT: {
    junior: [R.mifData, R.khanThirdGrade, R.kangaroo],
    middle: [R.khanData6, R.mifData, R.ukmt],
    senior: [R.khanStats, R.khanData6, R.ukmt],
  },
};

// Contest-format practice, recommended to every math student regardless of
// weak areas — timed multiple-choice papers are a skill of their own.
export const MATH_CONTEST_PRACTICE: Record<MathBand, StudyResource[]> = {
  junior: [R.kangaroo, R.beast],
  middle: [R.kangaroo, R.ukmt],
  senior: [R.ukmt, R.alcumus],
};

export const ENGLISH_RESOURCES: Record<EnglishSection, Record<EnglishPaper, StudyResource[]>> = {
  A: {
    cat4: [R.bcTeensGrammarA, R.bcTeensGrammarB, R.pegExercises],
    cat5: [R.bcTeensGrammarB, R.pegExercises, R.bbcTowardsAdvanced],
  },
  B: {
    cat4: [R.bcTeensVocabA, R.oxford3000, R.bbcLowerInt],
    cat5: [R.bcTeensVocabB, R.opal, R.oxford3000],
  },
  C: {
    cat4: [R.bcTeensReadA2, R.bcTeensReadB1, R.newsInLevels],
    cat5: [R.bcTeensReadB2, R.bcTeensReadC1, R.commonlit],
  },
};

export const ENGLISH_GENERAL_PRACTICE: Record<EnglishPaper, StudyResource[]> = {
  cat4: [R.cambridgeActivities, R.bbcLowerInt],
  cat5: [R.cambridgeActivities, R.bbcTowardsAdvanced],
};
