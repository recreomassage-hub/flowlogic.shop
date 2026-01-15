import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

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
export { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

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
  MOVEMENT_TESTS: `flowlogic-${stage}-movement-tests`,
  EXERCISES: `flowlogic-${stage}-exercises`,
  TRAINING_PLAN_TEMPLATES: `flowlogic-${stage}-training-plan-templates`,
  USER_EXERCISE_PROGRESS: `flowlogic-${stage}-user-exercise-progress`,
  EXERCISE_ASSESSMENTS_MAPPING: `flowlogic-${stage}-exercise-assessments-mapping`,
} as const;

// GSI names
export const GSIS = {
  USERS_EMAIL: 'email-index',
  SUBSCRIPTIONS_STRIPE_CUSTOMER: 'stripe-customer-index',
  ASSESSMENTS_TEST_TYPE: 'test-type-index',
  ASSESSMENTS_MONTH: 'month-index',
  PLANS_ACTIVE: 'active-index',
  CALENDAR_TASKS_DATE: 'date-index',
  MOVEMENT_TESTS_BODY_REGION: 'body-region-index',
  MOVEMENT_TESTS_CATEGORY: 'category-index',
  EXERCISES_TARGET_AREA: 'target-area-index',
  EXERCISES_BODY_REGION: 'body-region-index',
  TRAINING_PLAN_TEMPLATES_TIER: 'tier-index',
  USER_EXERCISE_PROGRESS_EXERCISE: 'exercise-index',
  USER_EXERCISE_PROGRESS_DATE: 'date-index',
  EXERCISE_ASSESSMENTS_MAPPING_EXERCISE: 'exercise-index',
  EXERCISE_ASSESSMENTS_MAPPING_TEST: 'test-index',
  EXERCISE_ASSESSMENTS_MAPPING_PROBLEM_AREA: 'problem-area-index',
} as const;


