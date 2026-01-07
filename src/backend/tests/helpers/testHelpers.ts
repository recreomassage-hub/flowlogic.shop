import { UserModel, User } from '../../db/models/User';
import { AssessmentModel, Assessment } from '../../db/models/Assessment';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a test user in the database
 */
export async function createTestUser(): Promise<User> {
  const userId = uuidv4();
  const user = await UserModel.create({
    user_id: userId,
    email: `test-${userId}@example.com`,
    tier: 'free',
    wellness_disclaimer_accepted: true,
    wellness_disclaimer_accepted_at: new Date().toISOString(),
  });
  return user;
}

/**
 * Create a test assessment in the database
 */
export async function createTestAssessment(userId: string, status: 'completed' | 'processing' | 'failed' | 'invalid' = 'completed'): Promise<Assessment> {
  const assessmentId = uuidv4();
  const assessment = await AssessmentModel.create({
    user_id: userId,
    assessment_id: assessmentId,
    test_id: 1,
    test_name: 'Overhead Squat',
    video_url: 's3://bucket/video.mp4',
    status: status,
    attempt_number: 1,
    result: status === 'completed' ? {
      score: 'limited',
      confidence: 0.88,
      problem_areas: ['Shoulder mobility'],
    } : undefined,
    completed_at: status === 'completed' ? new Date().toISOString() : undefined,
    month_key: '2025-01',
  });
  return assessment;
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(userId: string, assessmentId?: string): Promise<void> {
  try {
    if (assessmentId) {
      await AssessmentModel.delete(userId, assessmentId);
    }
    await UserModel.delete(userId);
  } catch (error) {
    console.warn('Cleanup error:', error);
    // Don't throw - cleanup is best effort
  }
}

