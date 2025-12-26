import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
export declare const docClient: DynamoDBDocumentClient;
export declare const TABLES: {
    readonly USERS: `flowlogic-${string}-users`;
    readonly SUBSCRIPTIONS: `flowlogic-${string}-subscriptions`;
    readonly ASSESSMENTS: `flowlogic-${string}-assessments`;
    readonly PLANS: `flowlogic-${string}-plans`;
    readonly CALENDAR_TASKS: `flowlogic-${string}-calendar-tasks`;
    readonly PROGRESS: `flowlogic-${string}-progress`;
    readonly USER_LIMITS: `flowlogic-${string}-user-limits`;
    readonly MIGRATIONS: `flowlogic-${string}-migrations`;
};
export declare const GSIS: {
    readonly USERS_EMAIL: "email-index";
    readonly SUBSCRIPTIONS_STRIPE_CUSTOMER: "stripe-customer-index";
    readonly ASSESSMENTS_TEST_TYPE: "test-type-index";
    readonly ASSESSMENTS_MONTH: "month-index";
    readonly PLANS_ACTIVE: "active-index";
    readonly CALENDAR_TASKS_DATE: "date-index";
};
//# sourceMappingURL=database.d.ts.map