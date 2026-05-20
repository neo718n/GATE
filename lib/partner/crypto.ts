/**
 * Crypto helpers for partner integrations (ArcMC).
 *
 * - `encryptSecret`/`decryptSecret`: AES-256-GCM at-rest encryption for the
 *   HS256 shared secret and the webhook secret (must be recoverable: we verify
 *   incoming JWTs and sign outbound webhooks, and the partner views the secret
 *   in their portal). Key from env `INTEGRATION_SECRET_ENC_KEY`.
 * - `generateSecret`/`generateApiKey`: high-entropy random tokens.
 * - `hashApiKey`: sha256 (API keys are stored compare-only, never recoverable).
 *
 * SERVER-ONLY (uses node:crypto). Do not import in client components.
 */
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function getKey(): Buffer {
  const raw = process.env.INTEGRATION_SECRET_ENC_KEY;
  if (!raw) throw new Error("INTEGRATION_SECRET_ENC_KEY is not set");
  const b64 = Buffer.from(raw, "base64");
  if (b64.length === 32) return b64;
  const hex = Buffer.from(raw, "hex");
  if (hex.length === 32) return hex;
  throw new Error(
    "INTEGRATION_SECRET_ENC_KEY must decode to 32 bytes (base64 or hex)",
  );
}

/** Encrypt a UTF-8 secret. Returns `iv:ciphertext:tag` (each base64). */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

/** Decrypt a value produced by {@link encryptSecret}. */
export function decryptSecret(payload: string): string {
  const [ivB64, dataB64, tagB64] = payload.split(":");
  if (!ivB64 || !dataB64 || !tagB64) {
    throw new Error("Malformed encrypted secret");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/** Random URL-safe secret (default 32 bytes of entropy). */
export function generateSecret(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Random API key with an identifiable prefix. Shown once, stored hashed. */
export function generateApiKey(): string {
  return `gate_pk_${randomBytes(24).toString("base64url")}`;
}

/** Public, non-secret client identifier (= JWT `iss`). */
export function generateClientId(): string {
  return `arcmc_${randomBytes(9).toString("base64url")}`;
}

/** sha256 hex of an API key, for compare-only storage. */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
