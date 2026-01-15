import { docClient, GetCommand, QueryCommand, ScanCommand } from '../../config/database';

const getTableName = () => {
  const stage = process.env.STAGE || 'dev';
  return `flowlogic-${stage}-exercises`;
};

export interface DifficultyLevel {
  level: number; // 1-3
  name: string;
  instructions: string[];
  cues: string[];
  modifications?: string[];
}

export interface Exercise {
  exercise_id: string; // PK, UUID
  name: string;
  description: string;
  target_area: string; // e.g., 'ankle_mobility', 'glute_activation'
  body_region: 'lower_body' | 'upper_body' | 'core' | 'full_body';
  difficulty_levels: DifficultyLevel[];
  instructions: string[];
  cues: string[];
  modifications?: string[];
  duration_estimate?: number; // seconds per set
  equipment_needed?: string[];
  created_at: string;
}

export class ExerciseModel {
  /**
   * Get exercise by ID
   */
  static async getById(exerciseId: string): Promise<Exercise | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: getTableName(),
        Key: { exercise_id: exerciseId },
      }));

      return result.Item as Exercise | null;
    } catch (error) {
      console.error('Error getting exercise by ID:', error);
      throw error;
    }
  }

  /**
   * Get all exercises
   */
  static async getAll(): Promise<Exercise[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: getTableName(),
      }));

      return (result.Items || []) as Exercise[];
    } catch (error) {
      console.error('Error getting all exercises:', error);
      throw error;
    }
  }

  /**
   * Get exercises by target area
   */
  static async getByTargetArea(targetArea: string): Promise<Exercise[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: getTableName(),
        IndexName: 'target-area-index',
        KeyConditionExpression: 'target_area = :area',
        ExpressionAttributeValues: {
          ':area': targetArea,
        },
      }));

      return (result.Items || []) as Exercise[];
    } catch (error) {
      console.error('Error getting exercises by target area:', error);
      throw error;
    }
  }

  /**
   * Get exercises by body region
   */
  static async getByBodyRegion(bodyRegion: string): Promise<Exercise[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: getTableName(),
        IndexName: 'body-region-index',
        KeyConditionExpression: 'body_region = :region',
        ExpressionAttributeValues: {
          ':region': bodyRegion,
        },
      }));

      return (result.Items || []) as Exercise[];
    } catch (error) {
      console.error('Error getting exercises by body region:', error);
      throw error;
    }
  }

  /**
   * Get exercises by difficulty level
   */
  static async getByDifficulty(level: number): Promise<Exercise[]> {
    try {
      // Note: This requires a scan since difficulty_levels is an array
      // For better performance, consider adding a GSI if this query is frequent
      const allExercises = await this.getAll();
      return allExercises.filter(ex => 
        ex.difficulty_levels.some(dl => dl.level === level)
      );
    } catch (error) {
      console.error('Error getting exercises by difficulty:', error);
      throw error;
    }
  }
}
