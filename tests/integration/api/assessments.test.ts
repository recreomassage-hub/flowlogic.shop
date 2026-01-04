import request from 'supertest';
import { app } from '../../../src/backend/index';

describe('Assessments API Integration Tests', () => {
  const baseUrl = '/api/v1';
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login
    const registerResponse = await request(app)
      .post(`${baseUrl}/auth/register`)
      .send({
        email: `assessment-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Assessment User',
        wellness_disclaimer_accepted: true,
      });

    userId = registerResponse.body.user_id;

    const loginResponse = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send({
        email: registerResponse.body.email,
        password: 'SecurePass123!',
      });

    accessToken = loginResponse.body.access_token;
  });

  describe('GET /assessments', () => {
    it('should return empty list for new user', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assessments');
      expect(Array.isArray(response.body.assessments)).toBe(true);
      expect(response.body.assessments.length).toBe(0);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /assessments', () => {
    it('should create assessment for Free tier user', async () => {
      const response = await request(app)
        .post(`${baseUrl}/assessments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_id: 1,
          video_url: 'https://s3.amazonaws.com/bucket/video.mp4',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('assessment_id');
      expect(response.body).toHaveProperty('test_id', 1);
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('should reject assessment with invalid test_id', async () => {
      const response = await request(app)
        .post(`${baseUrl}/assessments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_id: 999, // Invalid test_id
          video_url: 'https://s3.amazonaws.com/bucket/video.mp4',
        });

      expect(response.status).toBe(400);
    });

    it('should reject assessment without authentication', async () => {
      const response = await request(app)
        .post(`${baseUrl}/assessments`)
        .send({
          test_id: 1,
          video_url: 'https://s3.amazonaws.com/bucket/video.mp4',
        });

      expect(response.status).toBe(401);
    });

    it('should enforce monthly test limit for Free tier (3 tests)', async () => {
      // Create 3 assessments (Free tier limit)
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post(`${baseUrl}/assessments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            test_id: i,
            video_url: `https://s3.amazonaws.com/bucket/video${i}.mp4`,
          });
      }

      // Try to create 4th assessment (should fail)
      const response = await request(app)
        .post(`${baseUrl}/assessments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_id: 4,
          video_url: 'https://s3.amazonaws.com/bucket/video4.mp4',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Monthly test limit exceeded');
    });
  });

  describe('GET /assessments/:id', () => {
    let assessmentId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post(`${baseUrl}/assessments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          test_id: 1,
          video_url: 'https://s3.amazonaws.com/bucket/video.mp4',
        });

      assessmentId = response.body.assessment_id;
    });

    it('should get assessment by ID', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assessment_id', assessmentId);
      expect(response.body).toHaveProperty('test_id', 1);
    });

    it('should reject request for non-existent assessment', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments/non-existent-id`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments/${assessmentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /assessments/:id/presigned-url', () => {
    it('should generate presigned URL for video upload', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments/presigned-url`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          filename: 'test-video.mp4',
          contentType: 'video/mp4',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('upload_url');
      expect(response.body).toHaveProperty('video_url');
      expect(response.body.upload_url).toContain('https://');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`${baseUrl}/assessments/presigned-url`)
        .query({
          filename: 'test-video.mp4',
          contentType: 'video/mp4',
        });

      expect(response.status).toBe(401);
    });
  });
});






