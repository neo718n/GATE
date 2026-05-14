import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock modules BEFORE importing the functions
vi.mock('@/lib/authz', () => ({
  requireRole: vi.fn(() => Promise.resolve({ user: { id: 'test-user-1' } }))
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

// Create mock db inline to avoid hoisting issues
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      participants: {
        findFirst: vi.fn()
      },
      rounds: {
        findFirst: vi.fn()
      },
      enrollments: {
        findFirst: vi.fn(),
        findMany: vi.fn()
      }
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn()
      }))
    }))
  }
}));

// Import AFTER mocks
import { createEnrollment, getParticipantEnrollments, updateEnrollmentStatus } from '@/lib/actions/enrollments';
import { db } from '@/lib/db';

describe('Enrollment Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createEnrollment()', () => {
    it('should create enrollment successfully with valid data', async () => {
      // Setup mocks
      const mockParticipant = { id: 1, userId: 'test-user-1' };
      const mockRound = { id: 1, name: 'Online Assessment', registrationStatus: 'open' };
      const mockEnrollment = { id: 1, participantId: 1, roundId: 1, subjectId: 1, enrollmentStatus: 'draft', paymentStatus: 'unpaid' };

      db.query.participants.findFirst.mockResolvedValue(mockParticipant);
      db.query.rounds.findFirst.mockResolvedValue(mockRound);
      db.query.enrollments.findFirst.mockResolvedValue(null); // No existing enrollment

      // Mock the insert chain
      const returningMock = vi.fn().mockResolvedValue([mockEnrollment]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      db.insert.mockReturnValue({ values: valuesMock });

      // Test implementation
      const formData = new FormData();
      formData.append('participantId', '1');
      formData.append('roundId', '1');
      formData.append('subjectId', '1');

      const result = await createEnrollment(formData);

      expect(result).toBeDefined();
      expect(result.participantId).toBe(1);
      expect(result.roundId).toBe(1);
      expect(result.enrollmentStatus).toBe('draft');
      expect(result.paymentStatus).toBe('unpaid');

      // Verify database calls
      expect(db.query.participants.findFirst).toHaveBeenCalled();
      expect(db.query.rounds.findFirst).toHaveBeenCalled();
      expect(db.query.enrollments.findFirst).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });

    it('should reject duplicate enrollment with error message', async () => {
      // Setup mocks
      const mockParticipant = { id: 1, userId: 'test-user-1' };
      const mockRound = { id: 1, name: 'Online Assessment', registrationStatus: 'open' };
      const mockExistingEnrollment = { id: 1, participantId: 1, roundId: 1, subjectId: 1 };

      db.query.participants.findFirst.mockResolvedValue(mockParticipant);
      db.query.rounds.findFirst.mockResolvedValue(mockRound);
      db.query.enrollments.findFirst.mockResolvedValue(mockExistingEnrollment); // Existing enrollment found

      // Test implementation
      const formData = new FormData();
      formData.append('participantId', '1');
      formData.append('roundId', '1');
      formData.append('subjectId', '1');

      await expect(createEnrollment(formData)).rejects.toThrow('You are already enrolled in this program');

      // Verify insert was NOT called
      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe('getParticipantEnrollments()', () => {
    it('should return all enrollments for participant ordered by enrolledAt DESC', async () => {
      // Setup mocks
      const mockParticipant = { id: 1, userId: 'test-user-1' };
      const mockEnrollments = [
        {
          id: 2,
          participantId: 1,
          roundId: 2,
          enrolledAt: new Date('2024-02-01'),
          round: { name: 'Summer Camp' },
          subject: { name: 'Physics' },
          payment: null
        },
        {
          id: 1,
          participantId: 1,
          roundId: 1,
          enrolledAt: new Date('2024-01-01'),
          round: { name: 'Online Assessment' },
          subject: { name: 'Maths' },
          payment: null
        }
      ];

      db.query.participants.findFirst.mockResolvedValue(mockParticipant);
      db.query.enrollments.findMany.mockResolvedValue(mockEnrollments);

      // Test implementation
      const result = await getParticipantEnrollments(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      // Verify first enrollment is the most recent (enrolledAt DESC)
      expect(result[0].id).toBe(2);
      expect(result[0].enrolledAt.getTime()).toBeGreaterThan(result[1].enrolledAt.getTime());

      // Verify related data is included
      expect(result[0].round).toBeDefined();
      expect(result[0].subject).toBeDefined();
      expect(result[0].round.name).toBe('Summer Camp');

      // Verify database calls
      expect(db.query.participants.findFirst).toHaveBeenCalled();
      expect(db.query.enrollments.findMany).toHaveBeenCalled();
    });
  });

  describe('updateEnrollmentStatus()', () => {
    it('should transition status from draft → pending_payment → confirmed', async () => {
      // Setup mocks
      const mockEnrollment = {
        id: 1,
        participantId: 1,
        enrollmentStatus: 'draft',
        participant: { id: 1, userId: 'test-user-1' }
      };

      db.query.enrollments.findFirst.mockResolvedValue(mockEnrollment);

      // Mock the update chain
      const whereMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      db.update.mockReturnValue({ set: setMock });

      // Test implementation - transition to pending_payment
      const formData = new FormData();
      formData.append('enrollmentId', '1');
      formData.append('enrollmentStatus', 'pending_payment');

      await updateEnrollmentStatus(formData);

      // Verify database calls
      expect(db.query.enrollments.findFirst).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({
        enrollmentStatus: 'pending_payment',
        updatedAt: expect.any(Date)
      }));

      // Test transition to confirmed
      mockEnrollment.enrollmentStatus = 'pending_payment';
      db.query.enrollments.findFirst.mockResolvedValue(mockEnrollment);

      const formData2 = new FormData();
      formData2.append('enrollmentId', '1');
      formData2.append('enrollmentStatus', 'confirmed');

      await updateEnrollmentStatus(formData2);

      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({
        enrollmentStatus: 'confirmed',
        updatedAt: expect.any(Date)
      }));
    });

    it('should prevent updating cancelled enrollments', async () => {
      // Setup mock for cancelled enrollment
      const mockCancelledEnrollment = {
        id: 1,
        participantId: 1,
        enrollmentStatus: 'cancelled',
        participant: { id: 1, userId: 'test-user-1' }
      };

      db.query.enrollments.findFirst.mockResolvedValue(mockCancelledEnrollment);

      // Test implementation
      const formData = new FormData();
      formData.append('enrollmentId', '1');
      formData.append('enrollmentStatus', 'confirmed');

      await expect(updateEnrollmentStatus(formData)).rejects.toThrow('Cannot update a cancelled enrollment');

      // Verify update was NOT called
      expect(db.update).not.toHaveBeenCalled();
    });
  });
});
