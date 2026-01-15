import { docClient, TABLES, GSIS, QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '../../config/database';
import { retryAWS } from '../../utils/retry';
import { circuitBreakers } from '../../utils/circuitBreaker';

export type Tier = 'free' | 'basic' | 'pro' | 'proplus';

export interface User {
  user_id: string; // PK, UUID
  email: string; // GSI, unique
  name?: string;
  tier: Tier;
  wellness_disclaimer_accepted: boolean;
  wellness_disclaimer_accepted_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_login_at?: string; // ISO timestamp
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      created_at: now,
      updated_at: now,
    };

    await circuitBreakers.dynamoDB.execute(async () => {
      return await retryAWS(
        () => docClient.send(new PutCommand({
          TableName: TABLES.USERS,
          Item: newUser,
          ConditionExpression: 'attribute_not_exists(user_id)',
        })),
        {
          maxAttempts: 3,
          initialDelay: 100,
          context: { operation: 'UserModel.create', userId: newUser.user_id },
        }
      );
    });

    return newUser;
  }

  /**
   * Get user by ID
   */
  static async getById(userId: string): Promise<User | null> {
    const result = await circuitBreakers.dynamoDB.execute(async () => {
      return await retryAWS(
        () => docClient.send(new GetCommand({
          TableName: TABLES.USERS,
          Key: { user_id: userId },
        })),
        {
          maxAttempts: 3,
          initialDelay: 100,
          context: { operation: 'UserModel.getById', userId },
        }
      );
    });

    return (result.Item as User) || null;
  }

  /**
   * Get user by email (using GSI)
   */
  static async getByEmail(email: string): Promise<User | null> {
    const result = await circuitBreakers.dynamoDB.execute(async () => {
      return await retryAWS(
        () => docClient.send(new QueryCommand({
          TableName: TABLES.USERS,
          IndexName: GSIS.USERS_EMAIL,
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': email,
          },
          Limit: 1,
        })),
        {
          maxAttempts: 3,
          initialDelay: 100,
          context: { operation: 'UserModel.getByEmail', email },
        }
      );
    });

    return (result.Items?.[0] as User) || null;
  }

  /**
   * Update user
   */
  static async update(userId: string, updates: Partial<Omit<User, 'user_id' | 'created_at'>>): Promise<User> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpression.push('#updated_at = :updated_at');
    expressionAttributeNames['#updated_at'] = 'updated_at';
    expressionAttributeValues[':updated_at'] = new Date().toISOString();

    await circuitBreakers.dynamoDB.execute(async () => {
      return await retryAWS(
        () => docClient.send(new UpdateCommand({
          TableName: TABLES.USERS,
          Key: { user_id: userId },
          UpdateExpression: `SET ${updateExpression.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        })),
        {
          maxAttempts: 3,
          initialDelay: 100,
          context: { operation: 'UserModel.update', userId },
        }
      );
    });

    const updated = await this.getById(userId);
    if (!updated) {
      throw new Error('User not found after update');
    }

    return updated;
  }

  /**
   * Delete user
   */
  static async delete(userId: string): Promise<void> {
    await circuitBreakers.dynamoDB.execute(async () => {
      return await retryAWS(
        () => docClient.send(new DeleteCommand({
          TableName: TABLES.USERS,
          Key: { user_id: userId },
        })),
        {
          maxAttempts: 3,
          initialDelay: 100,
          context: { operation: 'UserModel.delete', userId },
        }
      );
    });
  }
}


