## ADDED Requirements

### Requirement: DynamoDB Point-in-Time Recovery

The system SHALL enable Point-in-Time Recovery (PITR) for all production DynamoDB tables to protect against accidental data deletion and corruption.

**Rationale:** PITR allows restoration to any point in time within the last 35 days, providing critical protection against data loss scenarios.

#### Scenario: Enable PITR for production table

- **GIVEN** production DynamoDB table exists
- **WHEN** PITR is enabled via AWS CLI or CloudFormation
- **THEN** PITR status is `ENABLED`
- **AND** table can be restored to any point in time within 35 days
- **AND** no downtime occurs during enablement

#### Scenario: Restore table from PITR

- **GIVEN** PITR is enabled for production table
- **WHEN** table is accidentally deleted or corrupted
- **THEN** table can be restored to point-in-time before deletion/corruption
- **AND** restore operation creates new table with restored data
- **AND** RPO (Recovery Point Objective) is 5 minutes (PITR granularity)

---

### Requirement: Automated Daily Backups

The system SHALL create automated daily backups of all production DynamoDB tables with 30-day retention.

**Rationale:** Automated backups provide additional protection beyond PITR and allow for long-term data retention.

#### Scenario: Daily backup creation

- **GIVEN** EventBridge rule configured for 2 AM UTC daily
- **WHEN** scheduled time arrives
- **THEN** Lambda function creates backup for each production table
- **AND** backup is stored in AWS Backup or DynamoDB backup system
- **AND** backup retention is 30 days

#### Scenario: Manual backup creation

- **GIVEN** backup script exists (`scripts/backup-dynamodb.sh`)
- **WHEN** script is executed with table name
- **THEN** backup is created immediately
- **AND** backup name includes timestamp
- **AND** backup status is verified

---

### Requirement: Dead Letter Queue for Async Processing

The system SHALL use Dead Letter Queue (DLQ) for all asynchronous Lambda functions, especially MediaPipe video processing.

**Rationale:** DLQ captures failed messages that cannot be processed, allowing for investigation and manual retry without data loss.

#### Scenario: Failed message sent to DLQ

- **GIVEN** MediaPipe Lambda function fails processing video
- **WHEN** Lambda throws error after max retries
- **THEN** message is sent to DLQ
- **AND** original message is preserved in DLQ
- **AND** CloudWatch alarm triggers if DLQ has messages

#### Scenario: DLQ message processing

- **GIVEN** messages exist in DLQ
- **WHEN** operator reviews DLQ messages
- **THEN** messages contain error details and original payload
- **AND** operator can manually retry or investigate root cause

---

### Requirement: CloudWatch Alarms for Critical Metrics

The system SHALL configure CloudWatch alarms for critical system metrics to enable proactive issue detection.

**Rationale:** Alarms notify operators before users experience issues, reducing downtime and improving reliability.

#### Scenario: Lambda error rate alarm

- **GIVEN** Lambda function has error rate > 10 errors per minute
- **WHEN** CloudWatch alarm evaluates metric
- **THEN** alarm state changes to `ALARM`
- **AND** SNS notification is sent to configured email/Slack
- **AND** alarm includes function name and error details

#### Scenario: DynamoDB throttling alarm

- **GIVEN** DynamoDB table experiences throttling (> 5 throttles in 5 minutes)
- **WHEN** CloudWatch alarm evaluates metric
- **THEN** alarm state changes to `ALARM`
- **AND** SNS notification is sent
- **AND** alarm includes table name and throttle count

#### Scenario: API latency alarm

- **GIVEN** API Gateway P95 latency > 1 second
- **WHEN** CloudWatch alarm evaluates metric
- **THEN** alarm state changes to `ALARM`
- **AND** SNS notification is sent
- **AND** alarm includes endpoint details

---

### Requirement: API Gateway Rate Limiting

The system SHALL enforce rate limiting on API Gateway to prevent DDoS attacks and abuse.

**Rationale:** Rate limiting protects infrastructure from overload and ensures fair resource usage.

#### Scenario: Rate limit exceeded

- **GIVEN** API Gateway throttle configured (burst: 200, rate: 100)
- **WHEN** client exceeds rate limit
- **THEN** API Gateway returns HTTP 429 (Too Many Requests)
- **AND** response includes `Retry-After` header
- **AND** request is not processed

#### Scenario: Rate limit within bounds

- **GIVEN** API Gateway throttle configured
- **WHEN** client makes requests within rate limit
- **THEN** requests are processed normally
- **AND** no throttling occurs

---

## MODIFIED Requirements

### Requirement: Lambda Error Handling

The system SHALL handle Lambda errors gracefully with retry logic and structured logging, **and** SHALL send failed messages to DLQ for async processing.

**Changes:** Added DLQ integration and structured logging to existing error handling.

#### Scenario: Lambda error with DLQ (new)

- **GIVEN** async Lambda function fails processing
- **WHEN** error occurs after max retries
- **THEN** error is logged in structured format (JSON)
- **AND** message is sent to DLQ
- **AND** error details include correlation ID

#### Scenario: Lambda error logging (new)

- **GIVEN** Lambda function encounters error
- **WHEN** error is caught
- **THEN** error is logged in structured JSON format
- **AND** log includes: timestamp, error message, stack trace, context (userId, requestId)
- **AND** log is searchable в CloudWatch Logs Insights
