import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import type { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

const stage = process.env.STAGE || 'dev';

export const up = async (client: DynamoDBClient) => {
  console.log('Running migration: 005_create_exercise_assessments_mapping_table');

  const params: CreateTableCommandInput = {
    TableName: `flowlogic-${stage}-exercise-assessments-mapping`,
    KeySchema: [
      { AttributeName: 'mapping_id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'mapping_id', AttributeType: 'S' },
      { AttributeName: 'exercise_id', AttributeType: 'S' },
      { AttributeName: 'test_id', AttributeType: 'N' },
      { AttributeName: 'problem_area', AttributeType: 'S' },
      { AttributeName: 'priority', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'exercise-index',
        KeySchema: [
          { AttributeName: 'exercise_id', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'test-index',
        KeySchema: [
          { AttributeName: 'test_id', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'problem-area-index',
        KeySchema: [
          { AttributeName: 'problem_area', KeyType: 'HASH' },
          { AttributeName: 'priority', KeyType: 'RANGE' }
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
  console.log('Rolling back migration: 005_create_exercise_assessments_mapping_table');

  try {
    await client.send(new DeleteTableCommand({
      TableName: `flowlogic-${stage}-exercise-assessments-mapping`
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
  version: '005',
  description: 'Create exercise-assessments-mapping table with exercise, test, and problem area GSI',
  author: 'team@flowlogic.app',
  createdAt: '2026-01-11'
};