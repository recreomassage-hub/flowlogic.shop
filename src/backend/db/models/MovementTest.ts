import { docClient, GetCommand, QueryCommand, ScanCommand } from '../../config/database';

const getTableName = () => {
  const stage = process.env.STAGE || 'dev';
  return `flowlogic-${stage}-movement-tests`;
};

export interface MovementTest {
  test_id: number; // PK, 1-15
  name: string;
  description: string;
  detailed_description?: string;
  body_region: 'lower_body' | 'upper_body' | 'core' | 'full_body';
  test_category: 'local' | 'functional' | 'balance';
  evaluation_criteria: string;
  scoring_rules: {
    pass: string;
    limited: string;
    significant: string;
  };
  mediapipe_requirements?: {
    landmarks: string[];
    quality_gates: string[];
  };
  instructions: string[];
  visual_guides?: string[];
  example_video_url?: string;
  created_at: string;
  version?: number;
}

export class MovementTestModel {
  /**
   * Get movement test by ID
   */
  static async getById(testId: number): Promise<MovementTest | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: getTableName(),
        Key: { test_id: testId },
      }));

      return result.Item as MovementTest | null;
    } catch (error) {
      console.error('Error getting movement test by ID:', error);
      throw error;
    }
  }

  /**
   * Get all movement tests
   */
  static async getAll(): Promise<MovementTest[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: getTableName(),
      }));

      return (result.Items || []) as MovementTest[];
    } catch (error) {
      console.error('Error getting all movement tests:', error);
      throw error;
    }
  }

  /**
   * Get movement tests by body region
   */
  static async getByBodyRegion(bodyRegion: string): Promise<MovementTest[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: getTableName(),
        IndexName: 'body-region-index',
        KeyConditionExpression: 'body_region = :region',
        ExpressionAttributeValues: {
          ':region': bodyRegion,
        },
      }));

      return (result.Items || []) as MovementTest[];
    } catch (error) {
      console.error('Error getting movement tests by body region:', error);
      throw error;
    }
  }

  /**
   * Get movement tests by category
   */
  static async getByCategory(category: string): Promise<MovementTest[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: getTableName(),
        IndexName: 'category-index',
        KeyConditionExpression: 'test_category = :category',
        ExpressionAttributeValues: {
          ':category': category,
        },
      }));

      return (result.Items || []) as MovementTest[];
    } catch (error) {
      console.error('Error getting movement tests by category:', error);
      throw error;
    }
  }
}
