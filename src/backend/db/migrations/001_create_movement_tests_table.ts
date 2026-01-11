import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import type { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

const stage = process.env.STAGE || 'dev';

export const up = async (client: DynamoDBClient) => {
  console.log('Running migration: 001_create_movement_tests_table');

  const params: CreateTableCommandInput = {
    TableName: `flowlogic-${stage}-movement-tests`,
    KeySchema: [
      { AttributeName: 'test_id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'test_id', AttributeType: 'N' },
      { AttributeName: 'body_region', AttributeType: 'S' },
      { AttributeName: 'test_category', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'body-region-index',
        KeySchema: [
          { AttributeName: 'body_region', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'category-index',
        KeySchema: [
          { AttributeName: 'test_category', KeyType: 'HASH' }
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
  console.log('Rolling back migration: 001_create_movement_tests_table');

  try {
    await client.send(new DeleteTableCommand({
      TableName: `flowlogic-${stage}-movement-tests`
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
  version: '001',
  description: 'Create movement-tests table with body region and category GSI',
  author: 'team@flowlogic.app',
  createdAt: '2026-01-11'
};