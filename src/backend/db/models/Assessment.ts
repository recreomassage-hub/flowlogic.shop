import { docClient, TABLES, GSIS } from '../../config/database';

export type AssessmentStatus = 'processing' | 'completed' | 'failed' | 'invalid';
export type ScoreResult = 'pass' | 'limited' | 'significant';

export interface AssessmentResult {
  score: ScoreResult;
  confidence: number; // 0.0-1.0
  problem_areas?: string[];
  normalized_output?: Record<string, any>;
}

export interface Assessment {
  user_id: string; // PK
  assessment_id: string; // SK, UUID
  test_id: number; // 1-15 (Elite catalog)
  test_name: string; // "Overhead Squat", "Y-Balance", etc.
  video_url: string; // S3 URL
  status: AssessmentStatus;
  attempt_number: number; // 1-3 per day
  quality_score?: number; // 0.0-1.0
  confidence_avg?: number; // 0.0-1.0
  motion_variance?: number; // 0.0-1.0
  result?: AssessmentResult;
  feedback?: string; // Причина ошибки (если status = invalid)
  created_at: string; // ISO timestamp
  completed_at?: string; // ISO timestamp
  month_key: string; // "YYYY-MM" для monthly cap
}

export class AssessmentModel {
  /**
   * Create a new assessment
   */
  static async create(assessment: Omit<Assessment, 'created_at'>): Promise<Assessment> {
    const now = new Date().toISOString();
    const newAssessment: Assessment = {
      ...assessment,
      created_at: now,
    };

    await docClient.put({
      TableName: TABLES.ASSESSMENTS,
      Item: newAssessment,
    });

    return newAssessment;
  }

  /**
   * Get assessment by ID
   */
  static async getById(userId: string, assessmentId: string): Promise<Assessment | null> {
    const result = await docClient.get({
      TableName: TABLES.ASSESSMENTS,
      Key: {
        user_id: userId,
        assessment_id: assessmentId,
      },
    });

    return (result.Item as Assessment) || null;
  }

  /**
   * Get assessments by user ID
   */
  static async getByUserId(userId: string, limit: number = 20): Promise<Assessment[]> {
    const result = await docClient.query({
      TableName: TABLES.ASSESSMENTS,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit,
    });

    return (result.Items as Assessment[]) || [];
  }

  /**
   * Get assessments by test type (using GSI)
   */
  static async getByTestType(testId: number, limit: number = 20): Promise<Assessment[]> {
    const result = await docClient.query({
      TableName: TABLES.ASSESSMENTS,
      IndexName: GSIS.ASSESSMENTS_TEST_TYPE,
      KeyConditionExpression: 'test_id = :testId',
      ExpressionAttributeValues: {
        ':testId': testId,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    return (result.Items as Assessment[]) || [];
  }

  /**
   * Get assessments by month (using GSI)
   */
  static async getByMonth(monthKey: string, limit: number = 20): Promise<Assessment[]> {
    const result = await docClient.query({
      TableName: TABLES.ASSESSMENTS,
      IndexName: GSIS.ASSESSMENTS_MONTH,
      KeyConditionExpression: 'month_key = :monthKey',
      ExpressionAttributeValues: {
        ':monthKey': monthKey,
      },
      ScanIndexForward: false,
      Limit: limit,
    });

    return (result.Items as Assessment[]) || [];
  }

  /**
   * Update assessment
   */
  static async update(
    userId: string,
    assessmentId: string,
    updates: Partial<Omit<Assessment, 'user_id' | 'assessment_id' | 'created_at'>>
  ): Promise<Assessment> {
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

    if (updates.status === 'completed' && !updates.completed_at) {
      updateExpression.push('#completed_at = :completed_at');
      expressionAttributeNames['#completed_at'] = 'completed_at';
      expressionAttributeValues[':completed_at'] = new Date().toISOString();
    }

    await docClient.update({
      TableName: TABLES.ASSESSMENTS,
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
  static async delete(userId: string, assessmentId: string): Promise<void> {
    await docClient.delete({
      TableName: TABLES.ASSESSMENTS,
      Key: {
        user_id: userId,
        assessment_id: assessmentId,
      },
    });
  }
}


