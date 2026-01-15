import { docClient, GetCommand, QueryCommand, ScanCommand } from '../../config/database';
import { retryAWS } from '../../utils/retry';
import { circuitBreakers } from '../../utils/circuitBreaker';

const getTableName = () => {
  const stage = process.env.STAGE || 'dev';
  return `flowlogic-${stage}-exercise-assessments-mapping`;
};

export type ConditionType = 'restriction' | 'weakness' | 'compensation';
export type Priority = 'P1' | 'P2';

export interface ExerciseAssessmentMapping {
  mapping_id: string; // PK, UUID
  exercise_id: string;
  test_id: number; // 1-15
  problem_area: string; // e.g., 'ankle_mobility_limitation', 'glute_inactivation'
  priority: Priority; // P1 = root cause, P2 = consequence
  condition_type: ConditionType;
  created_at: string;
}

export class ExerciseAssessmentMappingModel {
  /**
   * Get mapping by ID
   */
  static async getById(mappingId: string): Promise<ExerciseAssessmentMapping | null> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new GetCommand({
            TableName: getTableName(),
            Key: { mapping_id: mappingId },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'ExerciseAssessmentMapping.getById', mappingId },
          }
        );
      });

      return result.Item as ExerciseAssessmentMapping | null;
    } catch (error) {
      console.error('Error getting exercise-assessment mapping by ID:', error);
      throw error;
    }
  }

  /**
   * Get all mappings
   */
  static async getAll(): Promise<ExerciseAssessmentMapping[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new ScanCommand({
            TableName: getTableName(),
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'ExerciseAssessmentMapping.getAll' },
          }
        );
      });

      return (result.Items as ExerciseAssessmentMapping[]) || [];
    } catch (error) {
      console.error('Error getting all exercise-assessment mappings:', error);
      throw error;
    }
  }

  /**
   * Get mappings by exercise ID
   */
  static async getByExerciseId(exerciseId: string): Promise<ExerciseAssessmentMapping[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new QueryCommand({
            TableName: getTableName(),
            IndexName: 'exercise-index',
            KeyConditionExpression: 'exercise_id = :exerciseId',
            ExpressionAttributeValues: {
              ':exerciseId': exerciseId,
            },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'ExerciseAssessmentMapping.getByExerciseId', exerciseId },
          }
        );
      });

      return (result.Items as ExerciseAssessmentMapping[]) || [];
    } catch (error) {
      console.error('Error getting exercise-assessment mappings by exercise ID:', error);
      throw error;
    }
  }

  /**
   * Get mappings by test ID
   */
  static async getByTestId(testId: number): Promise<ExerciseAssessmentMapping[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new QueryCommand({
            TableName: getTableName(),
            IndexName: 'test-index',
            KeyConditionExpression: 'test_id = :testId',
            ExpressionAttributeValues: {
              ':testId': testId,
            },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'ExerciseAssessmentMapping.getByTestId', testId },
          }
        );
      });

      return (result.Items as ExerciseAssessmentMapping[]) || [];
    } catch (error) {
      console.error('Error getting exercise-assessment mappings by test ID:', error);
      throw error;
    }
  }

  /**
   * Get mappings by problem area
   */
  static async getByProblemArea(problemArea: string, priority?: Priority): Promise<ExerciseAssessmentMapping[]> {
    try {
      const keyCondition = priority
        ? 'problem_area = :area AND priority = :priority'
        : 'problem_area = :area';
      
      const expressionValues: Record<string, any> = {
        ':area': problemArea,
      };

      if (priority) {
        expressionValues[':priority'] = priority;
      }

      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new QueryCommand({
            TableName: getTableName(),
            IndexName: 'problem-area-index',
            KeyConditionExpression: keyCondition,
            ExpressionAttributeValues: expressionValues,
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'ExerciseAssessmentMapping.getByProblemArea', problemArea, priority },
          }
        );
      });

      return (result.Items as ExerciseAssessmentMapping[]) || [];
    } catch (error) {
      console.error('Error getting exercise-assessment mappings by problem area:', error);
      throw error;
    }
  }

  /**
   * Get recommended exercises for a test failure
   * Returns exercises mapped to the test, ordered by priority (P1 first)
   */
  static async getRecommendedExercises(testId: number): Promise<ExerciseAssessmentMapping[]> {
    try {
      const mappings = await this.getByTestId(testId);
      
      // Sort by priority: P1 first, then P2
      return mappings.sort((a, b) => {
        if (a.priority === 'P1' && b.priority === 'P2') return -1;
        if (a.priority === 'P2' && b.priority === 'P1') return 1;
        return 0;
      });
    } catch (error) {
      console.error('Error getting recommended exercises:', error);
      throw error;
    }
  }
}
