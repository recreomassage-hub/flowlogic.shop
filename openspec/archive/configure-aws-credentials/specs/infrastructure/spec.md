## ADDED Requirements

### Requirement: AWS Credentials Configuration for CI/CD

The system SHALL have properly configured AWS credentials for all deployment environments (dev, staging, production) using a combined approach: GitHub Environments for dev/staging and AWS Secrets Manager for production, with mandatory OIDC authentication for all environments.

**Rationale:** Automated deployments require secure AWS credentials. OIDC provides better security than Access Keys. GitHub Environments provide environment-specific secret management for dev/staging. AWS Secrets Manager provides secure storage for sensitive production secrets.

#### Scenario: Deploy to dev environment with OIDC

- **GIVEN** code is pushed to `develop` branch
- **WHEN** GitHub Actions workflow runs
- **THEN** system validates presence of `AWS_ROLE_ARN` in GitHub Environment `dev`
- **AND** system configures AWS credentials using OIDC (`aws-actions/configure-aws-credentials@v4` with `role-to-assume`)
- **AND** system reads `DATABASE_URL` and `API_KEY_PREFIX` from GitHub Environment `dev`
- **AND** deployment to dev environment proceeds successfully

#### Scenario: Deploy to staging environment with OIDC

- **GIVEN** code is pushed to `main` branch or workflow is manually triggered for staging
- **WHEN** GitHub Actions workflow runs
- **THEN** system validates presence of `AWS_ROLE_ARN` in GitHub Environment `staging`
- **AND** system configures AWS credentials using OIDC (`aws-actions/configure-aws-credentials@v4` with `role-to-assume`)
- **AND** system reads `DATABASE_URL` and `API_KEY_PREFIX` from GitHub Environment `staging`
- **AND** deployment to staging environment proceeds successfully

#### Scenario: Deploy to production environment with OIDC and Secrets Manager

- **GIVEN** code is pushed to `main` branch and manual approval is granted
- **WHEN** GitHub Actions workflow runs
- **THEN** system validates presence of `AWS_ROLE_ARN` in GitHub Environment `production`
- **AND** system configures AWS credentials using OIDC (`aws-actions/configure-aws-credentials@v4` with `role-to-assume`)
- **AND** system reads sensitive secrets from AWS Secrets Manager:
  - `/flowlogic/production/database/credentials`
  - `/flowlogic/production/payment/gateway`
  - `/flowlogic/production/encryption/keys`
- **AND** deployment to production environment proceeds successfully

#### Scenario: Missing OIDC role ARN validation

- **GIVEN** `AWS_ROLE_ARN` is not configured in GitHub Environment
- **WHEN** deployment workflow runs
- **THEN** system detects missing `AWS_ROLE_ARN` during validation step
- **AND** workflow fails with clear error message indicating missing role ARN
- **AND** deployment does not proceed

#### Scenario: Invalid OIDC authentication

- **GIVEN** `AWS_ROLE_ARN` is configured but OIDC trust policy is incorrect or role doesn't exist
- **WHEN** deployment workflow attempts to authenticate with AWS using OIDC
- **THEN** system detects OIDC authentication failure
- **AND** workflow fails with clear error message about OIDC authentication failure
- **AND** deployment does not proceed

#### Scenario: Missing secrets in AWS Secrets Manager (production)

- **GIVEN** production deployment requires secrets from AWS Secrets Manager
- **WHEN** workflow attempts to read secrets from `/flowlogic/production/*`
- **THEN** system validates secrets exist in Secrets Manager
- **AND** if secrets are missing, workflow fails with clear error message
- **AND** deployment does not proceed

#### Scenario: Secrets classification (TIER 1/2/3)

- **GIVEN** production deployment requires secrets
- **WHEN** system determines where to store secrets
- **THEN** TIER 1 (CRITICAL) secrets are stored in AWS Secrets Manager:
  - Payment data (Stripe, PayPal, bank API keys)
  - Database credentials (RDS, Redis, connection strings)
  - Encryption keys (KMS, data encryption, SSL/TLS)
  - Authentication secrets (JWT, OAuth2, SAML)
- **AND** TIER 2 (SENSITIVE) secrets are recommended in AWS Secrets Manager:
  - External API keys (SendGrid, Twilio, Cloudinary)
  - Service accounts (GitHub tokens, CI/CD tokens)
  - Business-critical keys (Analytics, Monitoring)
- **AND** TIER 3 (CONFIGURATION) secrets can be in GitHub Environments:
  - Feature flags
  - Service URLs
  - Rate limits and settings

#### Scenario: Unified OIDC configuration across workflows

- **GIVEN** multiple GitHub Actions workflows exist (backend-deploy, ci-cd, frontend-deploy)
- **WHEN** all workflows need AWS credentials
- **THEN** all workflows use OIDC authentication (`aws-actions/configure-aws-credentials@v4` with `role-to-assume`)
- **AND** all workflows read `AWS_ROLE_ARN` from GitHub Environment (not from repository secrets)
- **AND** all workflows validate OIDC credentials before deployment
- **AND** production workflows read sensitive secrets from AWS Secrets Manager

#### Scenario: Fallback on Access Keys (temporary, with restrictions)

- **GIVEN** OIDC authentication fails during deployment
- **AND** first successful OIDC deployment was less than 14 days ago
- **WHEN** deployment workflow runs
- **THEN** system attempts fallback on Access Keys from GitHub Environment
- **AND** system sends CloudWatch metric `CICD/FallbackAccessKeysUsed` (count = 1)
- **AND** system sends alert via SNS (Slack/Email) about fallback usage
- **AND** system logs fallback usage to CloudWatch Logs with timestamp, environment, workflow name
- **AND** deployment proceeds with Access Keys

#### Scenario: Fallback expired (automatic disable)

- **GIVEN** first successful OIDC deployment was more than 14 days ago
- **WHEN** OIDC authentication fails and workflow attempts fallback
- **THEN** system checks fallback expiry date
- **AND** system detects fallback has expired (>14 days)
- **AND** workflow fails with clear error message: "OIDC authentication required. Fallback expired after 14 days."
- **AND** deployment does not proceed (forcing OIDC fix)

---

### Requirement: AWS Credentials Documentation

The system SHALL have comprehensive documentation for setting up AWS credentials for CI/CD deployments using OIDC, GitHub Environments, and AWS Secrets Manager.

**Rationale:** Developers and DevOps engineers need clear instructions to configure OIDC, GitHub Environments, and AWS Secrets Manager correctly for automated deployments.

#### Scenario: New developer setting up OIDC

- **GIVEN** new developer needs to set up AWS credentials for CI/CD
- **WHEN** developer reads documentation
- **THEN** documentation provides step-by-step instructions for creating OIDC Identity Provider in AWS
- **AND** documentation provides instructions for creating IAM roles with trust policies
- **AND** documentation lists all required secrets for each environment (GitHub Environments vs AWS Secrets Manager)
- **AND** documentation provides GitHub Settings URL for configuring Environments
- **AND** developer can successfully configure OIDC following documentation

#### Scenario: Setting up GitHub Environments

- **GIVEN** developer needs to configure GitHub Environments for dev/staging
- **WHEN** developer reads documentation
- **THEN** documentation provides step-by-step instructions for creating Environments
- **AND** documentation lists required secrets for each Environment (`AWS_ROLE_ARN`, `DATABASE_URL`, `API_KEY_PREFIX`)
- **AND** documentation explains how to add secrets to Environments
- **AND** developer can successfully configure Environments following documentation

#### Scenario: Setting up AWS Secrets Manager for production

- **GIVEN** developer needs to configure AWS Secrets Manager for production
- **WHEN** developer reads documentation
- **THEN** documentation provides step-by-step instructions for creating secrets in Secrets Manager
- **AND** documentation lists required secret paths (`/flowlogic/production/database/credentials`, etc.)
- **AND** documentation explains IAM permissions needed for production role to access Secrets Manager
- **AND** developer can successfully configure Secrets Manager following documentation

#### Scenario: Troubleshooting credential issues

- **GIVEN** deployment fails due to credential or OIDC issues
- **WHEN** developer checks documentation
- **THEN** documentation provides troubleshooting section with common OIDC issues
- **AND** documentation explains how to verify OIDC trust policy is correct
- **AND** documentation explains how to verify GitHub Environment secrets are configured
- **AND** documentation explains how to verify AWS Secrets Manager access for production
- **AND** documentation provides commands to test OIDC authentication locally

---

### Requirement: Credentials Validation Script

The system SHALL have a validation script that checks AWS credentials configuration (OIDC, GitHub Environments, AWS Secrets Manager) before deployment.

**Rationale:** Early detection of credential issues prevents failed deployments and saves time.

#### Scenario: Pre-deploy OIDC validation

- **GIVEN** deployment workflow is triggered
- **WHEN** validation script runs
- **THEN** script checks for presence of `AWS_ROLE_ARN` in GitHub Environment
- **AND** script validates ARN format (must match `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`)
- **AND** script attempts OIDC authentication to verify role can be assumed
- **AND** script reports validation results (success or specific failure reason)

#### Scenario: Pre-deploy Secrets Manager validation (production)

- **GIVEN** production deployment workflow is triggered
- **WHEN** validation script runs
- **THEN** script checks for presence of required secrets in AWS Secrets Manager:
  - `/flowlogic/production/database/credentials`
  - `/flowlogic/production/payment/gateway`
  - `/flowlogic/production/encryption/keys`
- **AND** script validates production role has permissions to read from Secrets Manager
- **AND** script reports validation results (success or specific failure reason)

#### Scenario: Validation failure handling

- **GIVEN** validation script detects missing or invalid credentials (OIDC role, Secrets Manager access)
- **WHEN** script completes validation
- **THEN** script exits with non-zero code
- **AND** script outputs clear error message indicating which credentials are missing or invalid
- **AND** script provides actionable steps to fix the issue
- **AND** workflow stops before attempting deployment

---

### Requirement: Fallback on Access Keys with Monitoring

The system SHALL support temporary fallback on Access Keys when OIDC authentication fails, with strict time limits, monitoring, and automatic disable.

**Rationale:** During migration period, fallback provides continuity while OIDC is being set up. However, fallback must be automatically disabled after 14 days to enforce security best practices.

#### Scenario: Fallback monitoring and alerting

- **GIVEN** fallback on Access Keys is used during deployment
- **WHEN** deployment workflow runs with fallback
- **THEN** system sends CloudWatch metric `CICD/FallbackAccessKeysUsed` with value 1
- **AND** CloudWatch alarm triggers if metric > 0
- **AND** SNS notification is sent to Slack/Email with details:
  - Environment (dev/staging/production)
  - Workflow name
  - Timestamp
  - Reason for fallback (OIDC failure)
- **AND** fallback usage is logged to CloudWatch Logs for audit

#### Scenario: Weekly fallback usage report

- **GIVEN** fallback was used during the week
- **WHEN** weekly report is generated
- **THEN** system aggregates fallback usage from CloudWatch Logs
- **AND** report includes:
  - Number of fallback uses per environment
  - Workflows that used fallback
  - Dates and timestamps
  - Days remaining until fallback expiry
- **AND** report is sent to DevOps team via email

---

### Requirement: Secrets Classification and Storage

The system SHALL classify secrets by criticality level (TIER 1/2/3) and store them in appropriate locations (AWS Secrets Manager for TIER 1/2, GitHub Environments for TIER 3).

**Rationale:** Different secrets have different security requirements. Critical secrets (payment, database, encryption) must be stored in AWS Secrets Manager. Configuration secrets can be stored in GitHub Environments.

#### Scenario: Secrets classification (TIER 1/2/3)

- **GIVEN** production deployment requires secrets
- **WHEN** system determines where to store secrets
- **THEN** TIER 1 (CRITICAL) secrets are stored in AWS Secrets Manager:
  - Payment data (Stripe, PayPal, bank API keys)
  - Database credentials (RDS, Redis, connection strings)
  - Encryption keys (KMS, data encryption, SSL/TLS)
  - Authentication secrets (JWT, OAuth2, SAML)
- **AND** TIER 2 (SENSITIVE) secrets are recommended in AWS Secrets Manager:
  - External API keys (SendGrid, Twilio, Cloudinary)
  - Service accounts (GitHub tokens, CI/CD tokens)
  - Business-critical keys (Analytics, Monitoring)
- **AND** TIER 3 (CONFIGURATION) secrets can be in GitHub Environments:
  - Feature flags
  - Service URLs
  - Rate limits and settings

#### Scenario: Adding new secret with classification

- **GIVEN** developer needs to add a new secret
- **WHEN** developer follows documentation
- **THEN** documentation provides classification guide (TIER 1/2/3)
- **AND** developer determines appropriate TIER for the secret
- **AND** developer stores secret in appropriate location:
  - TIER 1/2 → AWS Secrets Manager
  - TIER 3 → GitHub Environment
- **AND** secret is properly documented with its TIER classification
