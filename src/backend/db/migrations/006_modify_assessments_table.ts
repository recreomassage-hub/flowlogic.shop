import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const stage = process.env.STAGE || 'dev';

/**
 * Migration to add new fields to assessments table.
 * Note: DynamoDB doesn't support adding columns via ALTER.
 * New fields (problem_areas, detailed_results, test_version) are optional
 * and will be handled by application code. This migration verifies table exists
 * and ensures schema is ready for new fields.
 */
export const up = async (client: DynamoDBClient) => {
  console.log('Running migration: 006_modify_assessments_table');

  const tableName = `flowlogic-${stage}-assessments`;

  try {
    // Verify table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log('✅ Assessments table verified');
    console.log('ℹ️  New fields (problem_areas, detailed_results, test_version) will be added by application code');
    console.log('ℹ️  All new fields are optional for backward compatibility');
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      throw new Error('Assessments table does not exist. Please create it first.');
    } else {
      throw error;
    }
  }
};

export const down = async (_client: DynamoDBClient) => {
  console.log('Rolling back migration: 006_modify_assessments_table');
  console.log('ℹ️  No schema changes to rollback. Application code will ignore new fields.');
};

export const metadata = {
  version: '006',
  description: 'Modify assessments table - verify table exists for new optional fields (problem_areas, detailed_results, test_version)',
  author: 'team@flowlogic.app',
  createdAt: '2026-01-11'
};