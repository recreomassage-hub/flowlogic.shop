## ADDED Requirements

### Requirement: Infrastructure Compliance Specification

The system SHALL maintain an OpenSpec-compliant infrastructure specification file that defines rules for all AWS resources.

**Rationale:** Provides single source of truth for infrastructure compliance rules, enabling automated checking and preventing drift.

#### Scenario: Infrastructure spec file exists

- **GIVEN** infrastructure-spec.yaml exists in infrastructure/
- **WHEN** any infrastructure compliance check runs
- **THEN** spec file is read and parsed
- **AND** rules are applied to all AWS resources

#### Scenario: Infrastructure spec validation

- **GIVEN** infrastructure-spec.yaml contains invalid YAML or missing required fields
- **WHEN** compliance check runs
- **THEN** system returns validation error
- **AND** error message indicates which field is invalid

---

### Requirement: Required Tags for AWS Resources

All AWS resources SHALL have required tags as specified in infrastructure-spec.yaml.

**Rationale:** Enables resource tracking, cost allocation, and automated lifecycle management.

#### Scenario: Resource has all required tags

- **GIVEN** AWS resource (DynamoDB table, S3 bucket, Lambda function)
- **WHEN** resource is created
- **THEN** resource has tags: Project, Env, Owner
- **AND** dev/sandbox resources also have ExpiresAt tag

#### Scenario: Resource missing required tag

- **GIVEN** AWS resource exists without required tags
- **WHEN** compliance check runs
- **THEN** violation is detected
- **AND** Beads issue is created with severity HIGH
- **AND** fix suggestion includes tag command

#### Scenario: Dev resource without ExpiresAt tag older than 30 days

- **GIVEN** dev resource exists without ExpiresAt tag
- **WHEN** resource age > 30 days
- **THEN** violation is detected with severity MEDIUM
- **AND** auto-cleanup is triggered if enabled

---

### Requirement: Naming Convention for AWS Resources

All AWS resources SHALL follow naming convention: `flowlogic-{env}-{service}`

**Rationale:** Ensures consistent naming across environments, simplifies resource identification and management.

#### Scenario: Resource name matches convention

- **GIVEN** AWS resource is created with name "flowlogic-prod-backend"
- **WHEN** compliance check validates naming
- **THEN** name passes validation

#### Scenario: Resource name violates convention

- **GIVEN** AWS resource exists with name "my-backend-resource"
- **WHEN** compliance check runs
- **THEN** violation is detected with severity MEDIUM
- **AND** fix suggestion includes rename command

---

### Requirement: AWS Resource Inventory and Classification

The system SHALL automatically inventory and classify all AWS resources by environment, usage status, and compliance.

**Rationale:** Provides visibility into resource usage and enables targeted cleanup actions.

#### Scenario: Inventory scan classifies resources

- **GIVEN** AWS account contains multiple resources
- **WHEN** inventory scan runs
- **THEN** resources are classified as: prod, staging, dev, untagged, expired, cost_zombies
- **AND** classification is output in JSON format

#### Scenario: Expired dev resource detection

- **GIVEN** dev resource has ExpiresAt tag with date in past
- **WHEN** inventory scan runs
- **THEN** resource is classified as "expired"
- **AND** resource is added to cleanup plan with action DELETE

#### Scenario: Cost zombie detection

- **GIVEN** resource has not been accessed for > 60 days
- **WHEN** inventory scan runs
- **THEN** resource is classified as "cost_zombie"
- **AND** resource is flagged for investigation before deletion

---

### Requirement: Infrastructure Compliance Checking

The system SHALL automatically check AWS resources for compliance violations against infrastructure-spec.yaml.

**Rationale:** Prevents accumulation of technical debt and ensures adherence to infrastructure standards.

#### Scenario: Compliance check on infrastructure changes

- **GIVEN** infrastructure changes are pushed to repository
- **WHEN** GitHub Actions workflow runs
- **THEN** compliance check validates changes against spec
- **AND** PR is blocked if violations are found

#### Scenario: Scheduled compliance check

- **GIVEN** scheduled workflow runs daily
- **WHEN** compliance check scans all AWS resources
- **THEN** violations are detected and reported
- **AND** Beads issues are created for new violations

#### Scenario: Compliance violation remediation

- **GIVEN** compliance violation is detected
- **WHEN** violation is fixed (tags added, naming corrected)
- **THEN** compliance check passes
- **AND** Beads issue is automatically closed

---

### Requirement: Safe Resource Cleanup

The system SHALL provide safe cleanup mechanisms with backup and dry-run capabilities for AWS resources.

**Rationale:** Prevents accidental deletion of critical resources and enables rollback if needed.

#### Scenario: Dry-run cleanup

- **GIVEN** cleanup plan contains resources to delete
- **WHEN** cleanup script runs in dry-run mode
- **THEN** script outputs what would be deleted without actual deletion
- **AND** backup plan is shown for each resource

#### Scenario: Safe deletion with backup

- **GIVEN** cleanup plan is approved for execution
- **WHEN** resource deletion is triggered
- **THEN** backup is created before deletion (DynamoDB snapshot, S3 objects)
- **AND** deletion is verified
- **AND** Beads records the action with backup ID

#### Scenario: Rollback from backup

- **GIVEN** resource was deleted with backup
- **WHEN** rollback is requested
- **THEN** resource is restored from backup
- **AND** resource state matches pre-deletion state

---

### Requirement: Beads Integration for Infrastructure Actions

All infrastructure actions SHALL be recorded in Beads for audit trail and root cause analysis.

**Rationale:** Enables full visibility into infrastructure changes and simplifies debugging deployment failures.

#### Scenario: Infrastructure change recording

- **GIVEN** CloudFormation stack is created or updated
- **WHEN** change completes
- **THEN** Beads record is created with:
  - **AND** resource ARN
  - **AND** action type (CREATE, UPDATE, DELETE)
  - **AND** timestamp
  - **AND** stack events

#### Scenario: Deployment failure recording

- **GIVEN** CloudFormation stack deployment fails
- **WHEN** failure is detected
- **THEN** Beads record captures:
  - **AND** CloudWatch logs from 10 minutes before failure
  - **AND** AWS API calls during deployment
  - **AND** Git context (last 5 commits, changed files)
  - **AND** environment state diff (before/after)

#### Scenario: Cleanup action recording

- **GIVEN** resource cleanup is executed
- **WHEN** cleanup completes
- **THEN** Beads record contains:
  - **AND** resource ARN
  - **AND** backup ID (if backup created)
  - **AND** cleanup reason
  - **AND** verification status

---

### Requirement: Continuous Compliance Enforcement

The system SHALL enforce infrastructure compliance continuously through automated checks in CI/CD pipeline.

**Rationale:** Prevents introduction of non-compliant resources and maintains infrastructure hygiene over time.

#### Scenario: Pre-merge compliance check

- **GIVEN** PR contains infrastructure changes
- **WHEN** PR is opened or updated
- **THEN** compliance check validates changes
- **AND** PR status shows pass/fail
- **AND** PR is blocked if violations found

#### Scenario: Scheduled compliance scan

- **GIVEN** scheduled workflow runs daily at 9 AM
- **WHEN** scan completes
- **THEN** violations are reported
- **AND** Beads issues are created for new violations
- **AND** weekly report is generated

#### Scenario: Auto-cleanup expired dev resources

- **GIVEN** scheduled workflow runs
- **WHEN** expired dev resources are detected (ExpiresAt in past)
- **THEN** resources are automatically deleted if auto_cleanup enabled
- **AND** deletion is recorded in Beads
