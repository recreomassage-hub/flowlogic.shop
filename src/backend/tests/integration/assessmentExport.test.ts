import request from 'supertest';

// Mock DynamoDB client for integration tests
jest.mock('../../config/database', () => {
  const mockSend = jest.fn();
  return {
    docClient: {
      send: mockSend,
    },
    TABLES: {
      ASSESSMENTS: 'flowlogic-dev-assessments',
      USERS: 'flowlogic-dev-users',
    },
    GSIS: {
      USERS_EMAIL: 'email-index',
    },
    PutCommand: jest.fn((params) => ({ input: params })),
    GetCommand: jest.fn((params) => ({ input: params })),
    QueryCommand: jest.fn((params) => ({ input: params })),
    UpdateCommand: jest.fn((params) => ({ input: params })),
    DeleteCommand: jest.fn((params) => ({ input: params })),
  };
});

// Mock authentication middleware for testing
jest.mock('../../api/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    const testUserId = req.headers['x-test-user-id'];
    if (testUserId) {
      req.user = {
        sub: testUserId,
        email: `test-${testUserId}@example.com`,
        'cognito:username': testUserId,
      };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },
}));

// Import after mocks
import app from '../../index';
import { docClient } from '../../config/database';

describe('Assessment Export Integration', () => {
  let testUserId: string;
  let testAssessmentId: string;
  let testUser: any;
  let testAssessment: any;

  beforeAll(async () => {
    // Create test user (mocked - just data, not in DB)
    testUser = {
      user_id: 'test-user-123',
      email: 'test-user-123@example.com',
      tier: 'free',
      wellness_disclaimer_accepted: true,
      wellness_disclaimer_accepted_at: new Date().toISOString(),
    };
    testUserId = testUser.user_id;

    // Create test assessment (mocked - just data, not in DB)
    testAssessment = {
      user_id: testUserId,
      assessment_id: 'test-assessment-456',
      test_id: 1,
      test_name: 'Overhead Squat',
      video_url: 's3://bucket/video.mp4',
      status: 'completed',
      attempt_number: 1,
      result: {
        score: 'limited',
        confidence: 0.88,
        problem_areas: ['Shoulder mobility'],
      },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      month_key: '2025-01',
    };
    testAssessmentId = testAssessment.assessment_id;

    // Setup mock responses
    (docClient.send as jest.Mock).mockImplementation((command: any) => {
      // Mock get assessment by ID
      if (command.input?.Key?.assessment_id === testAssessmentId && 
          command.input?.Key?.user_id === testUserId) {
        return Promise.resolve({
          Item: testAssessment,
        });
      }
      // Mock get user by ID
      if (command.input?.Key?.user_id === testUserId && 
          !command.input?.Key?.assessment_id) {
        return Promise.resolve({
          Item: testUser,
        });
      }
      // Default: not found
      return Promise.resolve({});
    });
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  describe('Successful export', () => {
    it('should export assessment as PDF successfully', async () => {
      const response = await request(app)
        .get(`/v1/assessments/${testAssessmentId}/export`)
        .set('x-test-user-id', testUserId)
        .expect(200)
        .expect('Content-Type', /application\/pdf/);

      // Check headers
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.pdf');
      expect(response.headers['content-length']).toBeDefined();

      // Check body
      expect(response.body).toBeDefined();
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check PDF header
      const pdfHeader = response.body.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
    });
  });

  describe('Error cases', () => {
    it('should return 404 for invalid assessment ID', async () => {
      const invalidId = 'non-existent-id-12345';

      // Mock: assessment not found
      (docClient.send as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .get(`/v1/assessments/${invalidId}/export`)
        .set('x-test-user-id', testUserId)
        .expect(404);

      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toContain('Assessment not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/v1/assessments/${testAssessmentId}/export`)
        .expect(401);
      
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for other user\'s assessment', async () => {
      const otherAssessmentId = 'other-assessment-999';

      // Mock: assessment not found for this user
      (docClient.send as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .get(`/v1/assessments/${otherAssessmentId}/export`)
        .set('x-test-user-id', testUserId)
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('Different statuses', () => {
    it('should export assessments with different statuses', async () => {
      // Test processing
      const processingAssessment = {
        ...testAssessment,
        assessment_id: 'test-processing-123',
        status: 'processing',
        result: undefined,
        completed_at: undefined,
      };

      (docClient.send as jest.Mock).mockImplementation((command: any) => {
        if (command.input?.Key?.assessment_id === processingAssessment.assessment_id) {
          return Promise.resolve({ Item: processingAssessment });
        }
        if (command.input?.Key?.user_id === testUserId && !command.input?.Key?.assessment_id) {
          return Promise.resolve({ Item: testUser });
        }
        return Promise.resolve({});
      });

      const processingResponse = await request(app)
        .get(`/v1/assessments/${processingAssessment.assessment_id}/export`)
        .set('x-test-user-id', testUserId)
        .expect(200);

      expect(processingResponse.body).toBeInstanceOf(Buffer);
      expect(processingResponse.body.length).toBeGreaterThan(0);
      const processingPdfHeader = processingResponse.body.toString('utf-8', 0, 10);
      expect(processingPdfHeader).toContain('%PDF');

      // Test failed
      const failedAssessment = {
        ...testAssessment,
        assessment_id: 'test-failed-456',
        status: 'failed',
        result: undefined,
        completed_at: undefined,
      };

      (docClient.send as jest.Mock).mockImplementation((command: any) => {
        if (command.input?.Key?.assessment_id === failedAssessment.assessment_id) {
          return Promise.resolve({ Item: failedAssessment });
        }
        if (command.input?.Key?.user_id === testUserId && !command.input?.Key?.assessment_id) {
          return Promise.resolve({ Item: testUser });
        }
        return Promise.resolve({});
      });

      const failedResponse = await request(app)
        .get(`/v1/assessments/${failedAssessment.assessment_id}/export`)
        .set('x-test-user-id', testUserId)
        .expect(200);

      expect(failedResponse.body).toBeInstanceOf(Buffer);
      expect(failedResponse.body.length).toBeGreaterThan(0);
      const failedPdfHeader = failedResponse.body.toString('utf-8', 0, 10);
      expect(failedPdfHeader).toContain('%PDF');
    });
  });
});
