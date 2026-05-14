import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function verifyMigration() {
  console.log('=== Migration Data Integrity Verification ===\n');

  try {
    // Dynamic import after env is loaded
    const { db } = await import('../lib/db/index.js');
    const { enrollments, participants, participantSubjects } = await import('../lib/db/schema.js');
    const { sql, eq, isNotNull } = await import('drizzle-orm');

    // 1. Verify enrollments table exists and has records
    console.log('1. Checking enrollments table...');
    const allEnrollments = await db.select().from(enrollments);
    console.log(`   ✓ Enrollments table exists`);
    console.log(`   ✓ Found ${allEnrollments.length} enrollment records\n`);

    // 2. Count participants with roundId
    console.log('2. Checking participants with roundId...');
    const participantsWithRound = await db
      .select()
      .from(participants)
      .where(isNotNull(participants.roundId));
    console.log(`   ✓ Found ${participantsWithRound.length} participants with roundId`);

    // Compare counts
    if (allEnrollments.length >= participantsWithRound.length) {
      console.log(`   ✓ Enrollment count (${allEnrollments.length}) matches or exceeds participants with roundId (${participantsWithRound.length})\n`);
    } else {
      console.log(`   ⚠ WARNING: Enrollment count (${allEnrollments.length}) is less than participants with roundId (${participantsWithRound.length})\n`);
    }

    // 3. Verify participantSubjects have enrollmentId populated
    console.log('3. Checking participantSubjects enrollmentId...');
    const allParticipantSubjects = await db.select().from(participantSubjects);
    const subjectsWithEnrollmentId = allParticipantSubjects.filter(ps => ps.enrollmentId !== null);
    const subjectsWithoutEnrollmentId = allParticipantSubjects.filter(ps => ps.enrollmentId === null);

    console.log(`   ✓ Total participantSubjects: ${allParticipantSubjects.length}`);
    console.log(`   ✓ With enrollmentId: ${subjectsWithEnrollmentId.length}`);
    console.log(`   ${subjectsWithoutEnrollmentId.length === 0 ? '✓' : '⚠'} Without enrollmentId: ${subjectsWithoutEnrollmentId.length}\n`);

    // 4. Check for orphaned records
    console.log('4. Checking for orphaned records...');

    // Check for enrollments with invalid participantId
    const orphanedEnrollments = await db.execute(sql`
      SELECT e.id, e.participant_id
      FROM enrollments e
      LEFT JOIN participants p ON e.participant_id = p.id
      WHERE p.id IS NULL
    `);
    console.log(`   ${orphanedEnrollments.rows.length === 0 ? '✓' : '⚠'} Orphaned enrollments (invalid participantId): ${orphanedEnrollments.rows.length}`);

    // Check for enrollments with invalid roundId
    const orphanedRounds = await db.execute(sql`
      SELECT e.id, e.round_id
      FROM enrollments e
      LEFT JOIN rounds r ON e.round_id = r.id
      WHERE r.id IS NULL
    `);
    console.log(`   ${orphanedRounds.rows.length === 0 ? '✓' : '⚠'} Orphaned enrollments (invalid roundId): ${orphanedRounds.rows.length}`);

    // Check for participantSubjects with invalid enrollmentId
    const orphanedSubjects = await db.execute(sql`
      SELECT ps.id, ps.enrollment_id
      FROM participant_subjects ps
      LEFT JOIN enrollments e ON ps.enrollment_id = e.id
      WHERE ps.enrollment_id IS NOT NULL AND e.id IS NULL
    `);
    console.log(`   ${orphanedSubjects.rows.length === 0 ? '✓' : '⚠'} Orphaned participantSubjects (invalid enrollmentId): ${orphanedSubjects.rows.length}\n`);

    // 5. Summary of enrollment statuses
    console.log('5. Enrollment Status Summary:');
    const confirmed = allEnrollments.filter(e => e.enrollmentStatus === 'confirmed').length;
    const draft = allEnrollments.filter(e => e.enrollmentStatus === 'draft').length;
    const pending = allEnrollments.filter(e => e.enrollmentStatus === 'pending_payment').length;
    const cancelled = allEnrollments.filter(e => e.enrollmentStatus === 'cancelled').length;

    console.log(`   - Confirmed: ${confirmed}`);
    console.log(`   - Draft: ${draft}`);
    console.log(`   - Pending Payment: ${pending}`);
    console.log(`   - Cancelled: ${cancelled}\n`);

    // 6. Summary of payment statuses
    console.log('6. Payment Status Summary:');
    const paid = allEnrollments.filter(e => e.paymentStatus === 'paid').length;
    const unpaid = allEnrollments.filter(e => e.paymentStatus === 'unpaid').length;
    const refunded = allEnrollments.filter(e => e.paymentStatus === 'refunded').length;

    console.log(`   - Paid: ${paid}`);
    console.log(`   - Unpaid: ${unpaid}`);
    console.log(`   - Refunded: ${refunded}\n`);

    // Final verdict
    const hasIssues =
      allEnrollments.length < participantsWithRound.length ||
      subjectsWithoutEnrollmentId.length > 0 ||
      orphanedEnrollments.rows.length > 0 ||
      orphanedRounds.rows.length > 0 ||
      orphanedSubjects.rows.length > 0;

    if (!hasIssues) {
      console.log('=== ✅ VERIFICATION PASSED ===');
      console.log('All integrity checks passed. Migration completed successfully.');
    } else {
      console.log('=== ⚠ VERIFICATION WARNING ===');
      console.log('Some issues detected. Please review the warnings above.');
    }

    process.exit(hasIssues ? 1 : 0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyMigration();
