# Serverless Framework Configuration Rules

## Purpose

This document defines OpenSpec rules for `serverless.yml` configuration to ensure consistency, security, and best practices across all environments.

## Rules

### 1. Service Name

**Requirement:** Service name MUST be `flowlogic-backend` (no environment-specific suffixes).

**Rationale:** Consistent service naming prevents stack conflicts and simplifies resource management.

**Validation:**
- Service name must match: `service: flowlogic-backend`
- No `-staging`, `-dev`, `-prod` suffixes in service name
- Stage is specified via `--stage` flag, not in service name

### 2. Stage Configuration

**Requirement:** Stages MUST be explicitly defined and validated.

**Allowed stages:**
- `dev` - Development environment
- `staging` - Staging environment
- `production` or `prod` - Production environment

**Validation:**
- Stage must be one of: dev, staging, production, prod
- Default stage: `dev`
- Stage passed via `--stage` flag: `serverless deploy --stage staging`

### 3. Resource Naming

**Requirement:** All resources MUST use `${self:provider.stage}` for environment isolation.

**Pattern:** `flowlogic-${self:provider.stage}-{resource-name}`

**Examples:**
- Tables: `flowlogic-${self:provider.stage}-users`
- Buckets: `flowlogic-${self:provider.stage}-videos`
- Queues: `flowlogic-${self:provider.stage}-processing-dlq`

**Validation:**
- No hardcoded environment names (e.g., `flowlogic-staging-v2-`)
- All resources use `${self:provider.stage}` variable
- Consistent naming pattern across all resources

### 4. Plugins

**Requirement:** Required plugins MUST be declared.

**Required plugins:**
- `serverless-prune-plugin` - Automatic cleanup of old Lambda versions
- `serverless-offline` - Local development support

**Configuration:**
```yaml
plugins:
  - serverless-prune-plugin
  - serverless-offline

custom:
  prune:
    automatic: true
    number: 5  # Keep last 5 versions
```

### 5. Security

**Requirement:** Security best practices MUST be enforced.

**Rules:**
- Deployment bucket: `blockPublicAccess: true`, `versioning: true`
- DynamoDB tables: KMS encryption enabled (`SSESpecification`)
- S3 buckets: Public access blocked, encryption enabled
- IAM roles: Least privilege principle (no wildcard `*` except for logs)

**Validation:**
- All DynamoDB tables have `SSESpecification` with `SSEEnabled: true`
- All S3 buckets have `PublicAccessBlockConfiguration`
- IAM policies use specific resource ARNs, not wildcards (except logs)

### 6. Environment Variables

**Requirement:** Environment variables MUST be stage-aware.

**Pattern:** Use `${self:custom.{config}.${self:provider.stage}}` with fallback.

**Examples:**
```yaml
environment:
  STAGE: ${self:provider.stage}
  NODE_ENV: ${self:custom.nodeEnv.${self:provider.stage}, self:custom.nodeEnv.prod}
  FRONTEND_URL: ${self:custom.frontendUrl.${self:provider.stage}, self:custom.frontendUrl.prod}
```

**Validation:**
- No hardcoded environment-specific values
- All environment variables use stage-aware configuration
- Fallback to production values when stage-specific not defined

### 7. Lambda Configuration

**Requirement:** Lambda functions MUST have consistent configuration.

**Standard settings:**
- Runtime: `nodejs20.x`
- Architecture: `arm64` (cost optimization)
- Memory: `512MB` (default, adjust per function if needed)
- Timeout: `30s` (default, adjust per function if needed)
- Log retention: `7 days`

**Validation:**
- All functions use `nodejs20.x` runtime
- Architecture is `arm64` (unless specific reason for x86_64)
- Memory and timeout are explicitly set

### 8. Resource Cleanup

**Requirement:** Old Lambda versions MUST be automatically pruned.

**Configuration:**
```yaml
custom:
  prune:
    automatic: true
    number: 5  # Keep last 5 versions
```

**Validation:**
- `serverless-prune-plugin` is installed and configured
- Automatic pruning is enabled
- Number of versions to keep is set (recommended: 5)

## Validation Script

Run validation before deployment:

```bash
# Check service name
grep -E "^service:" infra/serverless/serverless.yml | grep -v "flowlogic-backend" && echo "ERROR: Invalid service name"

# Check stage usage
grep -E "flowlogic-staging-v2|flowlogic-dev-v2|flowlogic-prod-v2" infra/serverless/serverless.yml && echo "ERROR: Hardcoded environment in resource names"

# Check plugins
grep -A 2 "^plugins:" infra/serverless/serverless.yml | grep -E "serverless-prune-plugin|serverless-offline" || echo "WARNING: Required plugins missing"
```

## Compliance Checklist

Before deploying, verify:

- [ ] Service name is `flowlogic-backend`
- [ ] All resources use `${self:provider.stage}` variable
- [ ] Required plugins are installed and configured
- [ ] Security settings are enabled (encryption, public access blocked)
- [ ] Environment variables are stage-aware
- [ ] Lambda configuration follows standards
- [ ] Prune plugin is configured for automatic cleanup

## References

- Serverless Framework v4 Documentation: https://www.serverless.com/framework/docs
- AWS Best Practices: https://docs.aws.amazon.com/wellarchitected/
- OpenSpec Project Context: `openspec/project.md`
