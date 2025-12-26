"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../../config/database");
class UserModel {
    /**
     * Create a new user
     */
    static async create(user) {
        const now = new Date().toISOString();
        const newUser = {
            ...user,
            created_at: now,
            updated_at: now,
        };
        await database_1.docClient.put({
            TableName: database_1.TABLES.USERS,
            Item: newUser,
            ConditionExpression: 'attribute_not_exists(user_id)',
        });
        return newUser;
    }
    /**
     * Get user by ID
     */
    static async getById(userId) {
        const result = await database_1.docClient.get({
            TableName: database_1.TABLES.USERS,
            Key: { user_id: userId },
        });
        return result.Item || null;
    }
    /**
     * Get user by email (using GSI)
     */
    static async getByEmail(email) {
        const result = await database_1.docClient.query({
            TableName: database_1.TABLES.USERS,
            IndexName: database_1.GSIS.USERS_EMAIL,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email,
            },
            Limit: 1,
        });
        return result.Items?.[0] || null;
    }
    /**
     * Update user
     */
    static async update(userId, updates) {
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
            TableName: database_1.TABLES.USERS,
            Key: { user_id: userId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
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
    static async delete(userId) {
        await database_1.docClient.delete({
            TableName: database_1.TABLES.USERS,
            Key: { user_id: userId },
        });
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map