import { docClient, GetCommand, QueryCommand, ScanCommand } from '../../config/database';
import { retryAWS } from '../../utils/retry';
import { circuitBreakers } from '../../utils/circuitBreaker';

const getTableName = () => {
  const stage = process.env.STAGE || 'dev';
  return `flowlogic-${stage}-training-plan-templates`;
};

export interface ExerciseSequenceItem {
  day_of_week: number; // 0-6 for Sun-Sat
  exercises: Array<{
    exercise_id: string;
    sets: number;
    reps: string; // e.g., "8-12", "30s"
    notes?: string;
  }>;
}

export interface TrainingPlanTemplate {
  template_id: string; // PK, UUID
  phase: 'local_improvement' | 'integration' | 'function'; // SK
  name: string;
  tier: 'casual' | 'committed' | 'dedicated';
  complexity: 'low' | 'medium' | 'high';
  duration_weeks: number;
  exercise_sequence: ExerciseSequenceItem[];
  progression_rules: string[];
  created_at: string;
}

export class TrainingPlanTemplateModel {
  /**
   * Get template by ID and phase
   */
  static async getById(templateId: string, phase: string): Promise<TrainingPlanTemplate | null> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new GetCommand({
            TableName: getTableName(),
            Key: {
              template_id: templateId,
              phase: phase,
            },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'TrainingPlanTemplate.getById', templateId, phase },
          }
        );
      });

      return result.Item as TrainingPlanTemplate | null;
    } catch (error) {
      console.error('Error getting training plan template by ID:', error);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  static async getAll(): Promise<TrainingPlanTemplate[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new ScanCommand({
            TableName: getTableName(),
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'TrainingPlanTemplate.getAll' },
          }
        );
      });

      return (result.Items as TrainingPlanTemplate[]) || [];
    } catch (error) {
      console.error('Error getting all training plan templates:', error);
      throw error;
    }
  }

  /**
   * Get templates by tier
   */
  static async getByTier(tier: string): Promise<TrainingPlanTemplate[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new QueryCommand({
            TableName: getTableName(),
            IndexName: 'tier-index',
            KeyConditionExpression: '#tier = :tier',
            ExpressionAttributeNames: {
              '#tier': 'tier',
            },
            ExpressionAttributeValues: {
              ':tier': tier,
            },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'TrainingPlanTemplate.getByTier', tier },
          }
        );
      });

      return (result.Items as TrainingPlanTemplate[]) || [];
    } catch (error) {
      console.error('Error getting training plan templates by tier:', error);
      throw error;
    }
  }

  /**
   * Get templates by complexity
   */
  static async getByComplexity(complexity: string): Promise<TrainingPlanTemplate[]> {
    try {
      // Note: This requires a scan since complexity is not indexed
      // For better performance, consider adding a GSI if this query is frequent
      const allTemplates = await this.getAll();
      return allTemplates.filter(t => t.complexity === complexity);
    } catch (error) {
      console.error('Error getting training plan templates by complexity:', error);
      throw error;
    }
  }
}
