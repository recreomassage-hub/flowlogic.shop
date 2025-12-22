import request from 'supertest';
import { app } from '../../../src/backend/index';

describe('Authentication API Integration Tests', () => {
  const baseUrl = '/api/v1/auth';

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
          wellness_disclaimer_accepted: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('tier', 'free');
      expect(response.body).toHaveProperty('wellness_disclaimer_accepted', true);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          wellness_disclaimer_accepted: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'test@example.com',
          password: '123',
          wellness_disclaimer_accepted: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration without wellness disclaimer', async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          wellness_disclaimer_accepted: false,
        });

      expect(response.status).toBe(400);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'duplicate@example.com',
          password: 'SecurePass123!',
          wellness_disclaimer_accepted: true,
        });

      // Second registration with same email
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'duplicate@example.com',
          password: 'SecurePass123!',
          wellness_disclaimer_accepted: true,
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a test user
      await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!',
          name: 'Login User',
          wellness_disclaimer_accepted: true,
        });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('expires_in');
      expect(response.body).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'logout@example.com',
          password: 'SecurePass123!',
          name: 'Logout User',
          wellness_disclaimer_accepted: true,
        });

      const loginResponse = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'logout@example.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post(`${baseUrl}/logout`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post(`${baseUrl}/logout`);

      expect(response.status).toBe(401);
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post(`${baseUrl}/logout`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'refresh@example.com',
          password: 'SecurePass123!',
          name: 'Refresh User',
          wellness_disclaimer_accepted: true,
        });

      const loginResponse = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'refresh@example.com',
          password: 'SecurePass123!',
        });

      // Extract refresh token from cookie
      const cookies = loginResponse.headers['set-cookie'];
      refreshToken = cookies?.[0]?.split('=')[1]?.split(';')[0] || '';
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post(`${baseUrl}/refresh`)
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('expires_in');
    });

    it('should reject refresh without refresh token', async () => {
      const response = await request(app)
        .post(`${baseUrl}/refresh`);

      expect(response.status).toBe(401);
    });

    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post(`${baseUrl}/refresh`)
        .set('Cookie', 'refreshToken=invalid-token');

      expect(response.status).toBe(401);
    });
  });
});

