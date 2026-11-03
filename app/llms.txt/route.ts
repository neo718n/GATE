import { getCurrentEdition, getEditions, isPast } from "@/lib/editions";
import { BRAND, BRAND_ALIASES, NAME_MEANING, NOT_TO_CONFUSE, OLYMPIAD_FAQ, SITE_URL } from "@/lib/site";

// llms.txt: a plain-text brief for AI assistants and answer engines.
// Generated from the same config as the site so it never drifts.
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const current = getCurrentEdition();
  const years = getEditions()
    .map((e) => {
      const subjects = e.subjects
        .map((s) => `${s.name} (Grades ${s.grades[0]}–${s.grades[1]})`)
        .join(", ");
      return `- [${e.name}](${SITE_URL}/${e.slug}): ${e.dateLabel}, ${e.host}, ${e.city}, ${e.country}. ${isPast(e) ? "Completed." : "Upcoming."} Subjects: ${subjects}.`;
    })
    .join("\n");

  const body = `# ${BRAND.name} (GATE)

> ${BRAND.shortDescription}

${NAME_MEANING}

Official website: ${SITE_URL}
Full name: ${BRAND.legalName}
Also written as: ${BRAND_ALIASES.join(", ")}
Operated by: ${BRAND.operator}
Contact: ${BRAND.email}

## ${OLYMPIAD_FAQ.q}
${OLYMPIAD_FAQ.a}

## Not to be confused with
${NOT_TO_CONFUSE.map((n) => `- ${n}`).join("\n")}

## Current program
${current.name}: ${current.dateLabel} at ${current.host}, ${current.city}, ${current.country}. Grades ${current.grades[0]}–${current.grades[1]}.${current.price ? ` Program fee: ${current.price.label} per participant.` : ""}
${current.summary}

## All program years
${years}

## Key pages
- [About GATE](${SITE_URL}/about)
- [Prepare: past papers and sample problems](${SITE_URL}/prepare)
- [Subjects](${SITE_URL}/subjects)
- [Awards & certificates](${SITE_URL}/awards)
- [Verify a certificate](${SITE_URL}/verify)
- [Contact](${SITE_URL}/contact)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
