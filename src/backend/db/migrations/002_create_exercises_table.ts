import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import type { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

const stage = process.env.STAGE || 'dev';

export const up = async (client: DynamoDBClient) => {
  console.log('Running migration: 002_create_exercises_table');

  const params: CreateTableCommandInput = {
    TableName: `flowlogic-${stage}-exercises`,
    KeySchema: [
      { AttributeName: 'exercise_id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'exercise_id', AttributeType: 'S' },
      { AttributeName: 'target_area', AttributeType: 'S' },
      { AttributeName: 'body_region', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'target-area-index',
        KeySchema: [
          { AttributeName: 'target_area', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'body-region-index',
        KeySchema: [
          { AttributeName: 'body_region', KeyType: 'HASH' }
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
  console.log('Rolling back migration: 002_create_exercises_table');

  try {
    await client.send(new DeleteTableCommand({
      TableName: `flowlogic-${stage}-exercises`
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
  version: '002',
  description: 'Create exercises table with target area and body region GSI',
  author: 'team@flowlogic.app',
  createdAt: '2026-01-11'
};