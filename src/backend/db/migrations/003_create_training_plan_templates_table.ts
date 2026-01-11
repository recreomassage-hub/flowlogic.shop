import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import type { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';

const stage = process.env.STAGE || 'dev';

export const up = async (client: DynamoDBClient) => {
  console.log('Running migration: 003_create_training_plan_templates_table');

  const params: CreateTableCommandInput = {
    TableName: `flowlogic-${stage}-training-plan-templates`,
    KeySchema: [
      { AttributeName: 'template_id', KeyType: 'HASH' },
      { AttributeName: 'phase', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'template_id', AttributeType: 'S' },
      { AttributeName: 'phase', AttributeType: 'S' },
      { AttributeName: 'tier', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'tier-index',
        KeySchema: [
          { AttributeName: 'tier', KeyType: 'HASH' },
          { AttributeName: 'phase', KeyType: 'RANGE' }
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
  console.log('Rolling back migration: 003_create_training_plan_templates_table');

  try {
    await client.send(new DeleteTableCommand({
      TableName: `flowlogic-${stage}-training-plan-templates`
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
  version: '003',
  description: 'Create training-plan-templates table with tier GSI',
  author: 'team@flowlogic.app',
  createdAt: '2026-01-11'
};