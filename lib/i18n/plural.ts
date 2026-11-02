import type { Locale } from "./config";

/** Russian plural form: one (1, 21), few (2–4, 22–24), many (5–20, 25…). */
export function ruPlural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function plural(n: number, locale: Locale, en: [string, string], ru: [string, string, string]) {
  return locale === "ru" ? ruPlural(n, ...ru) : n === 1 ? en[0] : en[1];
}
