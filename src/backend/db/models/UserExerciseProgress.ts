import { docClient, PutCommand, GetCommand, QueryCommand } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { retryAWS } from '../../utils/retry';
import { circuitBreakers } from '../../utils/circuitBreaker';

const getTableName = () => {
  const stage = process.env.STAGE || 'dev';
  return `flowlogic-${stage}-user-exercise-progress`;
};

export type ProgressStatus = 'completed' | 'in_progress' | 'skipped';

export interface UserExerciseProgress {
  user_id: string; // PK
  progress_id: string; // SK, UUID
  exercise_id: string;
  completed_at: string; // ISO timestamp
  status: ProgressStatus;
  reps?: number;
  sets?: number;
  duration_seconds?: number;
  difficulty_level?: number; // 1-3
  notes?: string;
  date_key: string; // YYYY-MM-DD
  created_at: string;
}

export class UserExerciseProgressModel {
  /**
   * Create new progress entry
   */
  static async create(progress: Omit<UserExerciseProgress, 'progress_id' | 'created_at'>): Promise<UserExerciseProgress> {
    const now = new Date().toISOString();
    const newProgress: UserExerciseProgress = {
      ...progress,
      progress_id: uuidv4(),
      created_at: now,
    };

    await circuitBreakers.dynamoDB.execute(async () => {
      return await retryAWS(
        () => docClient.send(new PutCommand({
          TableName: getTableName(),
          Item: newProgress,
        })),
        {
          maxAttempts: 3,
          initialDelay: 100,
          context: { operation: 'UserExerciseProgress.create', userId: progress.user_id },
        }
      );
    });

    return newProgress;
  }

  /**
   * Get progress by ID
   */
  static async getById(userId: string, progressId: string): Promise<UserExerciseProgress | null> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new GetCommand({
            TableName: getTableName(),
            Key: {
              user_id: userId,
              progress_id: progressId,
            },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'UserExerciseProgress.getById', userId, progressId },
          }
        );
      });

      return result.Item as UserExerciseProgress | null;
    } catch (error) {
      console.error('Error getting user exercise progress by ID:', error);
      throw error;
    }
  }

  /**
   * Get all progress entries for a user
   */
  static async getByUserId(userId: string, limit: number = 50): Promise<UserExerciseProgress[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new QueryCommand({
            TableName: getTableName(),
            KeyConditionExpression: 'user_id = :userId',
            ExpressionAttributeValues: {
              ':userId': userId,
            },
            ScanIndexForward: false, // Most recent first
            Limit: limit,
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'UserExerciseProgress.getByUserId', userId, limit },
          }
        );
      });

      return (result.Items as UserExerciseProgress[]) || [];
    } catch (error) {
      console.error('Error getting user exercise progress by user ID:', error);
      throw error;
    }
  }

  /**
   * Get progress entries by exercise ID
   */
  static async getByExerciseId(exerciseId: string, limit: number = 50): Promise<UserExerciseProgress[]> {
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
            ScanIndexForward: false,
            Limit: limit,
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'UserExerciseProgress.getByExerciseId', exerciseId, limit },
          }
        );
      });

      return (result.Items as UserExerciseProgress[]) || [];
    } catch (error) {
      console.error('Error getting user exercise progress by exercise ID:', error);
      throw error;
    }
  }

  /**
   * Get progress entries by date
   */
  static async getByDate(userId: string, dateKey: string): Promise<UserExerciseProgress[]> {
    try {
      const result = await circuitBreakers.dynamoDB.execute(async () => {
        return await retryAWS(
          () => docClient.send(new QueryCommand({
            TableName: getTableName(),
            IndexName: 'date-index',
            KeyConditionExpression: 'date_key = :dateKey AND user_id = :userId',
            ExpressionAttributeValues: {
              ':dateKey': dateKey,
              ':userId': userId,
            },
          })),
          {
            maxAttempts: 3,
            initialDelay: 100,
            context: { operation: 'UserExerciseProgress.getByDate', userId, dateKey },
          }
        );
      });

      return (result.Items as UserExerciseProgress[]) || [];
    } catch (error) {
      console.error('Error getting user exercise progress by date:', error);
      throw error;
    }
  }

  /**
   * Calculate exercise streak for a user
   */
  static async getStreak(userId: string, exerciseId: string): Promise<number> {
    try {
      const progressEntries = await this.getByExerciseId(exerciseId, 100);
      const userEntries = progressEntries.filter(p => p.user_id === userId && p.status === 'completed');
      
      if (userEntries.length === 0) return 0;

      // Sort by date (most recent first)
      userEntries.sort((a, b) => new Date(b.date_key).getTime() - new Date(a.date_key).getTime());

      let streak = 0;
      let expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);

      for (const entry of userEntries) {
        const entryDate = new Date(entry.date_key);
        entryDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((expectedDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          streak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (daysDiff === 1) {
          streak++;
          expectedDate.setDate(expectedDate.getDate() - 2);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating exercise streak:', error);
      throw error;
    }
  }
}
