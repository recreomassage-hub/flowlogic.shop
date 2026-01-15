# Fix: OIDC Token Expiry Deployment Errors

**Date:** 2026-01-15  
**Bug ID:** llm-os-project flowlogic.shop-a3o  
**Related Issues:** Deployment failures after early secrets loading implementation

## Problem

After implementing the early secrets loading pattern, production deployments started failing with two errors:

### Error 1: CloudFormation Permission Denied
```
User: arn:aws:sts::353731341341:assumed-role/flowlogic-ci-cd-production/github-21019367129-early 
is not authorized to perform: cloudformation:DescribeStacks on resource: 
arn:aws:cloudformation:us-east-1:353731341341:stack/flowlogic-backend-production/...
```

**Root Cause:** IAM policy resource pattern `flowlogic-production-*` didn't match stack name `flowlogic-backend-production`.

### Error 2: OIDC Token Expired
```
Cannot resolve variable at "provider.environment.COGNITO_USER_POOL_ID": 
The security token included in the request is invalid
```

**Root Cause:** OIDC token expired before Serverless Framework attempted to read SSM parameters during `serverless.yml` validation.

## Solution

### Fix 1: IAM Policy Resource Pattern

**File:** `infra/iam/cicd-policy-production.json`

**Change:**
```json
"Resource": [
  "arn:aws:cloudformation:us-east-1:*:stack/flowlogic-production-*/*"
]
```

**To:**
```json
"Resource": [
  "arn:aws:cloudformation:us-east-1:*:stack/flowlogic-*/*",
  "arn:aws:cloudformation:us-east-1:*:stack/flowlogic-backend-*/*"
]
```

**Action Required:**
1. Update IAM role policy in AWS:
   ```bash
   aws iam put-role-policy \
     --role-name flowlogic-ci-cd-production \
     --policy-name cicd-policy-production \
     --policy-document file://infra/iam/cicd-policy-production.json
   ```

### Fix 2: OIDC Token Refresh Before Serverless Framework

**Files:**
- `.github/workflows/ci-cd.yml`
- `.github/workflows/ci-cd-early-secrets.yml`

**Change:** Added OIDC token refresh step before Serverless Framework deployment:

```yaml
# Step 7: Refresh OIDC token before Serverless Framework (if using OIDC)
- name: Refresh OIDC Token for Serverless Framework
  if: steps.aws-config-oidc.outcome == 'success'
  uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
    role-session-name: github-${{ github.run_id }}-serverless
  id: aws-refresh-oidc
```

**Why:** Serverless Framework reads SSM parameters during `serverless.yml` validation. Even though we load secrets early, Serverless Framework still needs a valid OIDC token to read SSM variables via `${ssm:...}` syntax.

## Implementation Steps

1. **Update IAM Policy:**
   ```bash
   cd infra/iam
   aws iam put-role-policy \
     --role-name flowlogic-ci-cd-production \
     --policy-name cicd-policy-production \
     --policy-document file://cicd-policy-production.json \
     --region us-east-1
   ```

2. **Commit Workflow Changes:**
   ```bash
   git add .github/workflows/ci-cd.yml
   git add .github/workflows/ci-cd-early-secrets.yml
   git add infra/iam/cicd-policy-production.json
   git commit -m "fix: add OIDC token refresh and fix CloudFormation IAM policy"
   git push
   ```

3. **Test Deployment:**
   - Trigger workflow manually or wait for next push
   - Monitor workflow execution
   - Verify no errors

## Verification

### Check IAM Policy
```bash
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-production \
  --policy-name cicd-policy-production \
  --region us-east-1 \
  --query 'PolicyDocument' \
  --output json | jq '.Statement[] | select(.Sid == "CloudFormationDeployment") | .Resource'
```

**Expected Output:**
```json
[
  "arn:aws:cloudformation:us-east-1:*:stack/flowlogic-*/*",
  "arn:aws:cloudformation:us-east-1:*:stack/flowlogic-backend-*/*"
]
```

### Check Workflow Execution
1. View workflow logs
2. Verify OIDC token refresh step executes
3. Verify Serverless Framework deployment succeeds
4. Check CloudWatch metrics for no fallback usage

## Related

- [Early Secrets Loading Pattern Proposal](../../openspec/changes/early-secrets-loading-pattern/proposal.md)
- [OIDC Token Expiry Bug Analysis](./oidc-ssm-token-expiry-bug.md)
- [Monitoring Guide](./oidc-token-expiry-monitoring-guide.md)
