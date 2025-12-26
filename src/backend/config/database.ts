import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const stage = process.env.STAGE || 'dev';
const region = process.env.AWS_REGION || 'us-east-1';

// DynamoDB Client
const dynamoClient = new DynamoDBClient({
  region,
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Export commands for convenience
export { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand };

// Table names
export const TABLES = {
  USERS: `flowlogic-${stage}-users`,
  SUBSCRIPTIONS: `flowlogic-${stage}-subscriptions`,
  ASSESSMENTS: `flowlogic-${stage}-assessments`,
  PLANS: `flowlogic-${stage}-plans`,
  CALENDAR_TASKS: `flowlogic-${stage}-calendar-tasks`,
  PROGRESS: `flowlogic-${stage}-progress`,
  USER_LIMITS: `flowlogic-${stage}-user-limits`,
  MIGRATIONS: `flowlogic-${stage}-migrations`,
} as const;

// GSI names
export const GSIS = {
  USERS_EMAIL: 'email-index',
  SUBSCRIPTIONS_STRIPE_CUSTOMER: 'stripe-customer-index',
  ASSESSMENTS_TEST_TYPE: 'test-type-index',
  ASSESSMENTS_MONTH: 'month-index',
  PLANS_ACTIVE: 'active-index',
  CALENDAR_TASKS_DATE: 'date-index',
} as const;


