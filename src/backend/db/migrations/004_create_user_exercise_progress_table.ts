import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import type { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

const stage = process.env.STAGE || 'dev';

export const up = async (client: DynamoDBClient) => {
  console.log('Running migration: 004_create_user_exercise_progress_table');

  const params: CreateTableCommandInput = {
    TableName: `flowlogic-${stage}-user-exercise-progress`,
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' },
      { AttributeName: 'progress_id', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
      { AttributeName: 'progress_id', AttributeType: 'S' },
      { AttributeName: 'exercise_id', AttributeType: 'S' },
      { AttributeName: 'completed_at', AttributeType: 'S' },
      { AttributeName: 'date_key', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'exercise-index',
        KeySchema: [
          { AttributeName: 'exercise_id', KeyType: 'HASH' },
          { AttributeName: 'completed_at', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'date-index',
        KeySchema: [
          { AttributeName: 'date_key', KeyType: 'HASH' },
          { AttributeName: 'user_id', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    SSESpecification: {
      Enabled: true,
      SSEType: 'KMS',
      KMSMasterKeyId: process.env.KMS_KEY_ID
    }
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log('✅ Table created successfully');
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️ Table already exists, skipping');
    } else {
      throw error;
    }
  }
};

export const down = async (client: DynamoDBClient) => {
  console.log('Rolling back migration: 004_create_user_exercise_progress_table');

  try {
    await client.send(new DeleteTableCommand({
      TableName: `flowlogic-${stage}-user-exercise-progress`
    }));
    console.log('✅ Table deleted successfully');
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log('⚠️ Table does not exist, skipping');
    } else {
      throw error;
    }
  }
};

export const metadata = {
  version: '004',
  description: 'Create user-exercise-progress table with exercise and date GSI',
  author: 'team@flowlogic.app',
  createdAt: '2026-01-11'
};