import "server-only";
import { headers } from "next/headers";
import { countryFromHeaders } from "@/lib/certificates/log";
import { COUNTRIES } from "@/lib/phone-codes";

/**
 * Visitor's country name from the edge IP headers, used to pre-fill the
 * form. Returns "" when unknown (e.g. localhost) so the field stays empty
 * rather than guessing.
 */
export async function detectCountryName(): Promise<string> {
  const iso = countryFromHeaders(await headers());
  if (!iso) return "";
  return COUNTRIES.find((c) => c.iso2 === iso.toUpperCase())?.name ?? "";
}
