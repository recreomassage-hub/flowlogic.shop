import { Assessment } from '../../db/models/Assessment';

export const mockCompletedAssessment: Assessment = {
  user_id: 'test-user-123',
  assessment_id: 'test-assessment-456',
  test_id: 1,
  test_name: 'Overhead Squat',
  video_url: 's3://bucket/video.mp4',
  status: 'completed',
  attempt_number: 1,
  quality_score: 0.85,
  confidence_avg: 0.92,
  motion_variance: 0.15,
  result: {
    score: 'limited',
    confidence: 0.88,
    problem_areas: ['Shoulder mobility', 'Hip flexibility'],
  },
  created_at: '2025-01-03T10:00:00Z',
  completed_at: '2025-01-03T10:05:00Z',
  month_key: '2025-01',
};

export const mockProcessingAssessment: Assessment = {
  ...mockCompletedAssessment,
  assessment_id: 'test-assessment-789',
  status: 'processing',
  result: undefined,
  completed_at: undefined,
};

export const mockFailedAssessment: Assessment = {
  ...mockCompletedAssessment,
  assessment_id: 'test-assessment-101',
  status: 'failed',
  result: undefined,
  completed_at: undefined,
};

export const mockInvalidAssessment: Assessment = {
  ...mockCompletedAssessment,
  assessment_id: 'test-assessment-202',
  status: 'invalid',
  feedback: 'Video quality too low',
  result: undefined,
  completed_at: undefined,
};

export const mockPassAssessment: Assessment = {
  ...mockCompletedAssessment,
  assessment_id: 'test-assessment-pass',
  result: {
    score: 'pass',
    confidence: 0.95,
    problem_areas: undefined,
  },
};

export const mockAssessmentWithoutProblemAreas: Assessment = {
  ...mockCompletedAssessment,
  assessment_id: 'test-assessment-no-problems',
  result: {
    score: 'limited',
    confidence: 0.88,
    problem_areas: undefined,
  },
};



