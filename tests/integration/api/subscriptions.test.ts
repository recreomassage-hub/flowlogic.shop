import request from 'supertest';
import { app } from '../../../src/backend/index';

describe('Subscriptions API Integration Tests', () => {
  const baseUrl = '/api/v1';
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login
    const registerResponse = await request(app)
      .post(`${baseUrl}/auth/register`)
      .send({
        email: `subscription-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Subscription User',
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

  describe('GET /subscriptions', () => {
    it('should return 404 for Free tier user (no subscription)', async () => {
      const response = await request(app)
        .get(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`${baseUrl}/subscriptions`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /subscriptions', () => {
    it('should create subscription for Basic tier', async () => {
      const response = await request(app)
        .post(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tier: 'basic',
          stripe_customer_id: 'cus_test_123',
          stripe_subscription_id: 'sub_test_123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('subscription_id');
      expect(response.body).toHaveProperty('tier', 'basic');
      expect(response.body).toHaveProperty('status', 'active');
    });

    it('should create subscription for Pro tier', async () => {
      const response = await request(app)
        .post(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tier: 'pro',
          stripe_customer_id: 'cus_test_456',
          stripe_subscription_id: 'sub_test_456',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tier', 'pro');
    });

    it('should create subscription for Pro+ tier', async () => {
      const response = await request(app)
        .post(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tier: 'pro_plus',
          stripe_customer_id: 'cus_test_789',
          stripe_subscription_id: 'sub_test_789',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tier', 'pro_plus');
    });

    it('should reject subscription with invalid tier', async () => {
      const response = await request(app)
        .post(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tier: 'invalid_tier',
          stripe_customer_id: 'cus_test_123',
          stripe_subscription_id: 'sub_test_123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject subscription without authentication', async () => {
      const response = await request(app)
        .post(`${baseUrl}/subscriptions`)
        .send({
          tier: 'basic',
          stripe_customer_id: 'cus_test_123',
          stripe_subscription_id: 'sub_test_123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /subscriptions', () => {
    beforeEach(async () => {
      // Create a subscription first
      await request(app)
        .post(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tier: 'basic',
          stripe_customer_id: 'cus_test_123',
          stripe_subscription_id: 'sub_test_123',
        });
    });

    it('should cancel subscription successfully', async () => {
      const response = await request(app)
        .delete(`${baseUrl}/subscriptions`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'cancelled');
    });

    it('should reject cancellation without authentication', async () => {
      const response = await request(app)
        .delete(`${baseUrl}/subscriptions`);

      expect(response.status).toBe(401);
    });
  });
});





