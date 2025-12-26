"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModel = void 0;
const database_1 = require("../../config/database");
class SubscriptionModel {
    /**
     * Create a new subscription
     */
    static async create(subscription) {
        const now = new Date().toISOString();
        const newSubscription = {
            ...subscription,
            created_at: now,
            updated_at: now,
        };
        await database_1.docClient.put({
            TableName: database_1.TABLES.SUBSCRIPTIONS,
            Item: newSubscription,
        });
        return newSubscription;
    }
    /**
     * Get subscription by user ID (most recent active)
     */
    static async getByUserId(userId) {
        const result = await database_1.docClient.query({
            TableName: database_1.TABLES.SUBSCRIPTIONS,
            KeyConditionExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            ScanIndexForward: false, // Most recent first
            Limit: 1,
        });
        return result.Items?.[0] || null;
    }
    /**
     * Get subscription by Stripe customer ID (using GSI)
     */
    static async getByStripeCustomerId(stripeCustomerId) {
        const result = await database_1.docClient.query({
            TableName: database_1.TABLES.SUBSCRIPTIONS,
            IndexName: database_1.GSIS.SUBSCRIPTIONS_STRIPE_CUSTOMER,
            KeyConditionExpression: 'stripe_customer_id = :stripeCustomerId',
            ExpressionAttributeValues: {
                ':stripeCustomerId': stripeCustomerId,
            },
            ScanIndexForward: false,
            Limit: 1,
        });
        return result.Items?.[0] || null;
    }
    /**
     * Get subscription by subscription ID
     */
    static async getBySubscriptionId(userId, subscriptionId) {
        const result = await database_1.docClient.get({
            TableName: database_1.TABLES.SUBSCRIPTIONS,
            Key: {
                user_id: userId,
                subscription_id: subscriptionId,
            },
        });
        return result.Item || null;
    }
    /**
     * Update subscription
     */
    static async update(userId, subscriptionId, updates) {
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
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
        await database_1.docClient.update({
            TableName: database_1.TABLES.SUBSCRIPTIONS,
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
    static async delete(userId, subscriptionId) {
        await database_1.docClient.delete({
            TableName: database_1.TABLES.SUBSCRIPTIONS,
            Key: {
                user_id: userId,
                subscription_id: subscriptionId,
            },
        });
    }
}
exports.SubscriptionModel = SubscriptionModel;
//# sourceMappingURL=Subscription.js.map