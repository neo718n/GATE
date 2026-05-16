import { createHmac, timingSafeEqual } from "node:crypto";

const HASH_LENGTH = 16;

function getSecret(): string {
  const s = process.env.CERT_HMAC_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "CERT_HMAC_SECRET is not set or is too short (>=32 chars required)",
    );
  }
  return s;
}

export function hashCode(code: string): string {
  return createHmac("sha256", getSecret())
    .update(code)
    .digest("hex")
    .slice(0, HASH_LENGTH);
}

export function verifyCodeHash(code: string, storedHash: string): boolean {
  const expected = hashCode(code);
  if (expected.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(storedHash));
}
