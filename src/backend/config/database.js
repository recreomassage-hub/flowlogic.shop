"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSIS = exports.TABLES = exports.docClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const stage = process.env.STAGE || 'dev';
const region = process.env.AWS_REGION || 'us-east-1';
// DynamoDB Client
const dynamoClient = new client_dynamodb_1.DynamoDBClient({
    region,
});
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});
// Table names
exports.TABLES = {
    USERS: `flowlogic-${stage}-users`,
    SUBSCRIPTIONS: `flowlogic-${stage}-subscriptions`,
    ASSESSMENTS: `flowlogic-${stage}-assessments`,
    PLANS: `flowlogic-${stage}-plans`,
    CALENDAR_TASKS: `flowlogic-${stage}-calendar-tasks`,
    PROGRESS: `flowlogic-${stage}-progress`,
    USER_LIMITS: `flowlogic-${stage}-user-limits`,
    MIGRATIONS: `flowlogic-${stage}-migrations`,
};
// GSI names
exports.GSIS = {
    USERS_EMAIL: 'email-index',
    SUBSCRIPTIONS_STRIPE_CUSTOMER: 'stripe-customer-index',
    ASSESSMENTS_TEST_TYPE: 'test-type-index',
    ASSESSMENTS_MONTH: 'month-index',
    PLANS_ACTIVE: 'active-index',
    CALENDAR_TASKS_DATE: 'date-index',
};
//# sourceMappingURL=database.js.map