"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentModel = void 0;
const database_1 = require("../../config/database");
class AssessmentModel {
    /**
     * Create a new assessment
     */
    static async create(assessment) {
        const now = new Date().toISOString();
        const newAssessment = {
            ...assessment,
            created_at: now,
        };
        await database_1.docClient.put({
            TableName: database_1.TABLES.ASSESSMENTS,
            Item: newAssessment,
        });
        return newAssessment;
    }
    /**
     * Get assessment by ID
     */
    static async getById(userId, assessmentId) {
        const result = await database_1.docClient.get({
            TableName: database_1.TABLES.ASSESSMENTS,
            Key: {
                user_id: userId,
                assessment_id: assessmentId,
            },
        });
        return result.Item || null;
    }
    /**
     * Get assessments by user ID
     */
    static async getByUserId(userId, limit = 20) {
        const result = await database_1.docClient.query({
            TableName: database_1.TABLES.ASSESSMENTS,
            KeyConditionExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            ScanIndexForward: false, // Most recent first
            Limit: limit,
        });
        return result.Items || [];
    }
    /**
     * Get assessments by test type (using GSI)
     */
    static async getByTestType(testId, limit = 20) {
        const result = await database_1.docClient.query({
            TableName: database_1.TABLES.ASSESSMENTS,
            IndexName: database_1.GSIS.ASSESSMENTS_TEST_TYPE,
            KeyConditionExpression: 'test_id = :testId',
            ExpressionAttributeValues: {
                ':testId': testId,
            },
            ScanIndexForward: false,
            Limit: limit,
        });
        return result.Items || [];
    }
    /**
     * Get assessments by month (using GSI)
     */
    static async getByMonth(monthKey, limit = 20) {
        const result = await database_1.docClient.query({
            TableName: database_1.TABLES.ASSESSMENTS,
            IndexName: database_1.GSIS.ASSESSMENTS_MONTH,
            KeyConditionExpression: 'month_key = :monthKey',
            ExpressionAttributeValues: {
                ':monthKey': monthKey,
            },
            ScanIndexForward: false,
            Limit: limit,
        });
        return result.Items || [];
    }
    /**
     * Update assessment
     */
    static async update(userId, assessmentId, updates) {
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
        if (updates.status === 'completed' && !updates.completed_at) {
            updateExpression.push('#completed_at = :completed_at');
            expressionAttributeNames['#completed_at'] = 'completed_at';
            expressionAttributeValues[':completed_at'] = new Date().toISOString();
        }
        await database_1.docClient.update({
            TableName: database_1.TABLES.ASSESSMENTS,
            Key: {
                user_id: userId,
                assessment_id: assessmentId,
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        });
        const updated = await this.getById(userId, assessmentId);
        if (!updated) {
            throw new Error('Assessment not found after update');
        }
        return updated;
    }
    /**
     * Delete assessment
     */
    static async delete(userId, assessmentId) {
        await database_1.docClient.delete({
            TableName: database_1.TABLES.ASSESSMENTS,
            Key: {
                user_id: userId,
                assessment_id: assessmentId,
            },
        });
    }
}
exports.AssessmentModel = AssessmentModel;
//# sourceMappingURL=Assessment.js.map