import { docClient, TABLES, GSIS } from '../../config/database';

export type SubscriptionTier = 'basic' | 'pro' | 'proplus';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired';

export interface Subscription {
  user_id: string; // PK, UUID
  subscription_id: string; // SK, Stripe subscription ID
  stripe_customer_id: string; // GSI
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string; // ISO timestamp
  current_period_end: string; // ISO timestamp
  cancel_at_period_end: boolean;
  canceled_at?: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export class SubscriptionModel {
  /**
   * Create a new subscription
   */
  static async create(
    subscription: Omit<Subscription, 'created_at' | 'updated_at'>
  ): Promise<Subscription> {
    const now = new Date().toISOString();
    const newSubscription: Subscription = {
      ...subscription,
      created_at: now,
      updated_at: now,
    };

    await docClient.put({
      TableName: TABLES.SUBSCRIPTIONS,
      Item: newSubscription,
    });

    return newSubscription;
  }

  /**
   * Get subscription by user ID (most recent active)
   */
  static async getByUserId(userId: string): Promise<Subscription | null> {
    const result = await docClient.query({
      TableName: TABLES.SUBSCRIPTIONS,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Most recent first
      Limit: 1,
    });

    return (result.Items?.[0] as Subscription) || null;
  }

  /**
   * Get subscription by Stripe customer ID (using GSI)
   */
  static async getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    const result = await docClient.query({
      TableName: TABLES.SUBSCRIPTIONS,
      IndexName: GSIS.SUBSCRIPTIONS_STRIPE_CUSTOMER,
      KeyConditionExpression: 'stripe_customer_id = :stripeCustomerId',
      ExpressionAttributeValues: {
        ':stripeCustomerId': stripeCustomerId,
      },
      ScanIndexForward: false,
      Limit: 1,
    });

    return (result.Items?.[0] as Subscription) || null;
  }

  /**
   * Get subscription by subscription ID
   */
  static async getBySubscriptionId(userId: string, subscriptionId: string): Promise<Subscription | null> {
    const result = await docClient.get({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: {
        user_id: userId,
        subscription_id: subscriptionId,
      },
    });

    return (result.Item as Subscription) || null;
  }

  /**
   * Update subscription
   */
  static async update(
    userId: string,
    subscriptionId: string,
    updates: Partial<Omit<Subscription, 'user_id' | 'subscription_id' | 'created_at'>>
  ): Promise<Subscription> {
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

    await docClient.update({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: {
        user_id: userId,
        subscription_id: subscriptionId,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const updated = await this.getBySubscriptionId(userId, subscriptionId);
    if (!updated) {
      throw new Error('Subscription not found after update');
    }

    return updated;
  }

  /**
   * Delete subscription
   */
  static async delete(userId: string, subscriptionId: string): Promise<void> {
    await docClient.delete({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: {
        user_id: userId,
        subscription_id: subscriptionId,
      },
    });
  }
}

