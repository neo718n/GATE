import { randomInt } from "node:crypto";

export const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const CODE_PREFIX = "GATE";
export const CODE_TAIL_LENGTH = 6;
export const CODE_SHAPE = /^GATE-\d{4}-[A-Z0-9]{2,12}-[0-9A-HJKMNP-TV-Z]{6}$/;

export function subjectSlugToCode(slug: string): string {
  return slug
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 12);
}

export function generateCodeTail(length = CODE_TAIL_LENGTH): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CROCKFORD_ALPHABET[randomInt(0, CROCKFORD_ALPHABET.length)];
  }
  return out;
}

export function generateCode(year: number, subjectCode: string): string {
  const sub = subjectSlugToCode(subjectCode);
  if (!sub) throw new Error("subjectCode produced empty code");
  return `${CODE_PREFIX}-${year}-${sub}-${generateCodeTail()}`;
}

const CROCKFORD_FOLDS: Record<string, string> = {
  I: "1",
  L: "1",
  O: "0",
  U: "V",
};

export function formatCode(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .toUpperCase()
    .split("")
    .map((ch) => (CROCKFORD_FOLDS[ch] ?? ch))
    .filter((ch) => /[A-Z0-9]/.test(ch))
    .join("");

  if (!cleaned.startsWith("GATE")) return cleaned;
  const rest = cleaned.slice(4);
  if (rest.length < 4) return `GATE-${rest}`;
  const year = rest.slice(0, 4);
  const remain = rest.slice(4);
  if (remain.length <= CODE_TAIL_LENGTH) return `GATE-${year}-${remain}`;
  const tail = remain.slice(-CODE_TAIL_LENGTH);
  const sub = remain.slice(0, -CODE_TAIL_LENGTH);
  return `GATE-${year}-${sub}-${tail}`;
}

export function isValidCodeShape(s: string): boolean {
  return CODE_SHAPE.test(s);
}
