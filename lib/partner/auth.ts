/**
 * Partner launch-token verification + API-key auth (server-only).
 *
 * Launch tokens are HS256 JWTs signed with the partner's shared secret. We look
 * up the partner by the (untrusted) `iss` claim, decrypt their shared secret,
 * then cryptographically verify. Replay is prevented with a single-use `jti`.
 */
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  integrationPartners,
  partnerLaunchNonces,
  type IntegrationPartner,
} from "@/lib/db/schema";
import { decryptSecret, hashApiKey } from "./crypto";

export const LAUNCH_AUDIENCE = "gate";
const LEEWAY = Number(process.env.PARTNER_JWT_LEEWAY_SECONDS ?? "30");
const MAX_AGE_SECONDS = 300; // launch tokens must be short-lived (≤5 min)

export type LaunchClaims = {
  iss: string;
  sub: string;
  exam_ref: string | number;
  name?: string;
  email?: string;
  grade?: string;
  assignment_id?: string;
  return_url?: string;
  jti: string;
  exp: number;
  iat: number;
};

async function getPartnerByClientId(
  clientId: string,
): Promise<IntegrationPartner | null> {
  const [p] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.clientId, clientId))
    .limit(1);
  return p ?? null;
}

/** Verify a launch token. Throws on any failure. */
export async function verifyLaunchToken(
  rawJwt: string,
): Promise<{ partner: IntegrationPartner; claims: LaunchClaims }> {
  const parts = rawJwt.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");

  let unverified: { iss?: unknown };
  try {
    unverified = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );
  } catch {
    throw new Error("Malformed token payload");
  }
  const clientId = unverified.iss;
  if (typeof clientId !== "string" || !clientId) {
    throw new Error("Missing issuer (iss)");
  }

  const partner = await getPartnerByClientId(clientId);
  if (!partner) throw new Error("Unknown partner");
  if (partner.status === "disabled") throw new Error("Partner disabled");
  if (partner.signingAlg !== "HS256") {
    throw new Error("Unsupported signing algorithm");
  }
  if (!partner.sharedSecretEnc) throw new Error("Partner has no shared secret");

  const secret = new TextEncoder().encode(
    decryptSecret(partner.sharedSecretEnc),
  );

  let payload;
  try {
    ({ payload } = await jwtVerify(rawJwt, secret, {
      algorithms: ["HS256"],
      issuer: clientId,
      audience: LAUNCH_AUDIENCE,
      clockTolerance: LEEWAY,
      maxTokenAge: MAX_AGE_SECONDS,
    }));
  } catch {
    throw new Error("Invalid or expired token");
  }

  if (!payload.jti) throw new Error("Missing jti");
  if (!payload.sub) throw new Error("Missing subject (sub)");
  if (payload.exam_ref == null) {
    throw new Error("Missing exam_ref");
  }

  return { partner, claims: payload as unknown as LaunchClaims };
}

/**
 * Atomically consume a launch-token jti. Returns true on first use, false if it
 * was already used (replay) — backed by a unique PK + onConflictDoNothing.
 */
export async function consumeNonce(
  jti: string,
  partnerId: number,
  expSeconds: number,
): Promise<boolean> {
  const inserted = await db
    .insert(partnerLaunchNonces)
    .values({ jti, partnerId, expiresAt: new Date(expSeconds * 1000) })
    .onConflictDoNothing({ target: partnerLaunchNonces.jti })
    .returning({ jti: partnerLaunchNonces.jti });
  return inserted.length > 0;
}

/** Resolve a partner from the `X-API-Key` header (hash compare). */
export async function verifyPartnerApiKey(
  req: Request,
): Promise<IntegrationPartner | null> {
  const key = req.headers.get("x-api-key");
  if (!key) return null;
  const [p] = await db
    .select()
    .from(integrationPartners)
    .where(eq(integrationPartners.apiKeyHash, hashApiKey(key)))
    .limit(1);
  if (!p || p.status === "disabled") return null;
  return p;
}
