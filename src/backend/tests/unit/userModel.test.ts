import { UserModel, User } from '../../db/models/User';

// Mock DynamoDB client
jest.mock('../../config/database', () => ({
  docClient: {
    put: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  TABLES: {
    USERS: 'flowlogic-dev-users',
  },
  GSIS: {
    USERS_EMAIL: 'email-index',
  },
}));

describe('UserModel', () => {
  const mockUser: User = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    tier: 'free',
    wellness_disclaimer_accepted: true,
    wellness_disclaimer_accepted_at: '2025-12-22T10:00:00Z',
    created_at: '2025-12-22T10:00:00Z',
    updated_at: '2025-12-22T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const { docClient } = require('../../config/database');
      docClient.put.mockResolvedValue({});

      const user = await UserModel.create({
        ...mockUser,
        created_at: undefined as any,
        updated_at: undefined as any,
      });

      expect(user).toHaveProperty('user_id');
      expect(user).toHaveProperty('created_at');
      expect(user).toHaveProperty('updated_at');
      expect(docClient.put).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should get user by ID', async () => {
      const { docClient } = require('../../config/database');
      docClient.get.mockResolvedValue({ Item: mockUser });

      const user = await UserModel.getById(mockUser.user_id);

      expect(user).toEqual(mockUser);
      expect(docClient.get).toHaveBeenCalledWith({
        TableName: 'flowlogic-dev-users',
        Key: { user_id: mockUser.user_id },
      });
    });

    it('should return null if user not found', async () => {
      const { docClient } = require('../../config/database');
      docClient.get.mockResolvedValue({});

      const user = await UserModel.getById('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('getByEmail', () => {
    it('should get user by email', async () => {
      const { docClient } = require('../../config/database');
      docClient.query.mockResolvedValue({ Items: [mockUser] });

      const user = await UserModel.getByEmail(mockUser.email);

      expect(user).toEqual(mockUser);
      expect(docClient.query).toHaveBeenCalled();
    });
  });
});









