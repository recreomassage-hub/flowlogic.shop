import { SubscriptionModel, Subscription } from '../../../src/backend/db/models/Subscription';

// Mock DynamoDB client
jest.mock('../../../src/backend/config/database', () => ({
  docClient: {
    put: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  TABLES: {
    SUBSCRIPTIONS: 'flowlogic-dev-subscriptions',
  },
  GSIS: {
    SUBSCRIPTIONS_STRIPE_CUSTOMER: 'stripe-customer-index',
  },
}));

describe('SubscriptionModel', () => {
  const mockSubscription: Subscription = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    subscription_id: 'sub_123',
    tier: 'basic',
    status: 'active',
    stripe_customer_id: 'cus_test_123',
    stripe_subscription_id: 'sub_test_123',
    current_period_start: '2025-12-22T10:00:00Z',
    current_period_end: '2026-01-22T10:00:00Z',
    created_at: '2025-12-22T10:00:00Z',
    updated_at: '2025-12-22T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new subscription', async () => {
      const { docClient } = require('../../../src/backend/config/database');
      docClient.put.mockResolvedValue({});

      const subscription = await SubscriptionModel.create({
        user_id: mockSubscription.user_id,
        tier: 'basic',
        stripe_customer_id: 'cus_test_123',
        stripe_subscription_id: 'sub_test_123',
      });

      expect(subscription).toHaveProperty('subscription_id');
      expect(subscription).toHaveProperty('tier', 'basic');
      expect(subscription).toHaveProperty('status', 'active');
      expect(docClient.put).toHaveBeenCalled();
    });

    it('should reject invalid tier', async () => {
      await expect(
        SubscriptionModel.create({
          user_id: mockSubscription.user_id,
          tier: 'invalid_tier' as any,
          stripe_customer_id: 'cus_test_123',
          stripe_subscription_id: 'sub_test_123',
        })
      ).rejects.toThrow();
    });
  });

  describe('getByUserId', () => {
    it('should get subscription by user ID', async () => {
      const { docClient } = require('../../../src/backend/config/database');
      docClient.query.mockResolvedValue({ Items: [mockSubscription] });

      const subscription = await SubscriptionModel.getByUserId(mockSubscription.user_id);

      expect(subscription).toEqual(mockSubscription);
      expect(docClient.query).toHaveBeenCalled();
    });

    it('should return null if subscription not found', async () => {
      const { docClient } = require('../../../src/backend/config/database');
      docClient.query.mockResolvedValue({ Items: [] });

      const subscription = await SubscriptionModel.getByUserId('non-existent-id');

      expect(subscription).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should cancel subscription', async () => {
      const { docClient } = require('../../../src/backend/config/database');
      docClient.update.mockResolvedValue({ Attributes: { ...mockSubscription, status: 'cancelled' } });

      const subscription = await SubscriptionModel.cancel(
        mockSubscription.user_id,
        mockSubscription.subscription_id
      );

      expect(subscription).toHaveProperty('status', 'cancelled');
      expect(docClient.update).toHaveBeenCalled();
    });
  });
});







