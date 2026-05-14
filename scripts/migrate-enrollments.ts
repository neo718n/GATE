/**
 * One-time script: backfill enrollments from participants.roundId
 * Run: tsx scripts/migrate-enrollments.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load env BEFORE any other imports touch process.env
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  // Dynamic imports so dotenv runs first
  const { db } = await import("../lib/db");
  const { participants, enrollments, participantSubjects } = await import("../lib/db/schema");
  const { eq, and, isNotNull } = await import("drizzle-orm");

  console.log("Starting enrollment migration...");

  // Find all participants with non-null roundId
  const participantsToMigrate = await db
    .select()
    .from(participants)
    .where(isNotNull(participants.roundId));

  console.log(`Found ${participantsToMigrate.length} participants to migrate`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const participant of participantsToMigrate) {
    try {
      // Check if enrollment already exists
      const existing = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.participantId, participant.id),
            eq(enrollments.roundId, participant.roundId!)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(
          `Skipping participant ${participant.id} (enrollment already exists)`
        );
        skippedCount++;
        continue;
      }

      // Map payment status from participants to enrollments
      // "unpaid" → "unpaid", "paid" → "paid", "waived" → "paid"
      const enrollmentPaymentStatus =
        participant.paymentStatus === "waived" ? "paid" : participant.paymentStatus;

      // Create enrollment record
      // If they have a roundId, we assume it's a confirmed enrollment
      // Payment status is based on the participant's payment status
      const [enrollment] = await db
        .insert(enrollments)
        .values({
          participantId: participant.id,
          roundId: participant.roundId!,
          subjectId: null,
          enrollmentStatus: "confirmed",
          paymentStatus: enrollmentPaymentStatus as "unpaid" | "paid" | "refunded",
        })
        .returning();

      console.log(
        `Created enrollment ${enrollment.id} for participant ${participant.id} (round ${participant.roundId}, status: ${enrollment.enrollmentStatus}, payment: ${enrollment.paymentStatus})`
      );

      // Update participantSubjects to link to the new enrollment
      const subjects = await db
        .select()
        .from(participantSubjects)
        .where(eq(participantSubjects.participantId, participant.id));

      if (subjects.length > 0) {
        for (const subject of subjects) {
          await db
            .update(participantSubjects)
            .set({ enrollmentId: enrollment.id })
            .where(
              and(
                eq(participantSubjects.participantId, participant.id),
                eq(participantSubjects.subjectId, subject.subjectId)
              )
            );
        }
        console.log(`  Updated ${subjects.length} subject(s) for enrollment ${enrollment.id}`);
      }

      successCount++;
    } catch (error) {
      console.error(`Error migrating participant ${participant.id}:`, error);
      errorCount++;
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Total participants to migrate: ${participantsToMigrate.length}`);
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Skipped (already exists): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log("\n✓ Migration completed successfully");

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
