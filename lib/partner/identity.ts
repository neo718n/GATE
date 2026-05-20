/**
 * Partner student identity (server-only). Maps an ArcMC external user to a GATE
 * participant (idempotent) and mints a real Better Auth session cookie so the
 * existing exam-taking flow works unchanged.
 *
 * Session minting: partner students never use a password. At each launch we set
 * a fresh random password and immediately sign in — the `nextCookies()` plugin
 * copies the Set-Cookie from `auth.api.signInEmail` into the response.
 */
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  participants,
  partnerParticipants,
  type IntegrationPartner,
} from "@/lib/db/schema";
import { generateSecret } from "./crypto";
import type { LaunchClaims } from "./auth";

const SYNTH_DOMAIN =
  process.env.PARTNER_SYNTHETIC_EMAIL_DOMAIN ?? "students.partner.gate";

function emailSlug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "user"
  );
}

export type ResolvedParticipant = {
  participantId: number;
  userId: string;
  email: string;
};

async function findMapping(
  partnerId: number,
  externalUserId: string,
): Promise<ResolvedParticipant | null> {
  const [m] = await db
    .select({
      participantId: partnerParticipants.participantId,
      userId: partnerParticipants.userId,
    })
    .from(partnerParticipants)
    .where(
      and(
        eq(partnerParticipants.partnerId, partnerId),
        eq(partnerParticipants.externalUserId, externalUserId),
      ),
    )
    .limit(1);
  if (!m) return null;
  // email lives on the user row
  const ctx = await auth.$context;
  const userRow = await ctx.internalAdapter.findUserById(m.userId);
  return {
    participantId: m.participantId,
    userId: m.userId,
    email: userRow?.email ?? "",
  };
}

/** Idempotently resolve (or create) the GATE participant for a partner student. */
export async function resolvePartnerParticipant(
  partner: IntegrationPartner,
  claims: LaunchClaims,
): Promise<ResolvedParticipant> {
  const externalUserId = claims.sub;

  const existing = await findMapping(partner.id, externalUserId);
  if (existing) {
    // keep grade fresh if provided
    if (claims.grade) {
      await db
        .update(participants)
        .set({ grade: claims.grade })
        .where(eq(participants.id, existing.participantId));
    }
    return existing;
  }

  const ctx = await auth.$context;
  const email =
    claims.email?.trim().toLowerCase() ||
    `${emailSlug(externalUserId)}.${partner.id}@${SYNTH_DOMAIN}`;
  const name = claims.name?.trim() || externalUserId;

  let userId: string;
  try {
    const user = await ctx.internalAdapter.createUser({
      email,
      name,
      emailVerified: true,
      role: "participant",
      firstName: name,
    });
    userId = user.id;
    // credential account with a random (unused) password so we can mint sessions
    const hash = await ctx.password.hash(generateSecret(24));
    await ctx.internalAdapter.linkAccount({
      userId,
      accountId: userId,
      providerId: "credential",
      password: hash,
    });
  } catch (e) {
    // Concurrent launch may have created the mapping — re-check.
    const again = await findMapping(partner.id, externalUserId);
    if (again) return again;
    throw e instanceof Error ? e : new Error("Failed to provision student account");
  }

  // The user.create.after hook auto-created the participant row.
  const [participant] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(eq(participants.userId, userId))
    .limit(1);
  if (!participant) throw new Error("Participant row was not created");

  if (claims.grade) {
    await db
      .update(participants)
      .set({ grade: claims.grade })
      .where(eq(participants.id, participant.id));
  }

  await db
    .insert(partnerParticipants)
    .values({
      partnerId: partner.id,
      externalUserId,
      participantId: participant.id,
      userId,
      partnerManaged: true,
    })
    .onConflictDoNothing({
      target: [partnerParticipants.partnerId, partnerParticipants.externalUserId],
    });

  return { participantId: participant.id, userId, email };
}

/** Mint a Better Auth session cookie for the given partner student. */
export async function mintPartnerSession(
  userId: string,
  email: string,
): Promise<void> {
  const ctx = await auth.$context;
  const password = generateSecret(24);
  try {
    await ctx.internalAdapter.updatePassword(userId, password);
  } catch {
    const hash = await ctx.password.hash(password);
    await ctx.internalAdapter.linkAccount({
      userId,
      accountId: userId,
      providerId: "credential",
      password: hash,
    });
  }
  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });
}
