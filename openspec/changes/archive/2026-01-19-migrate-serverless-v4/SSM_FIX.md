# 🔧 Fix: SSM Parameter Store Permission Issue

## ❌ Problem Identified

**Error:**
```
✖ Access denied when storing the parameter "/serverless-framework/deployment/s3-bucket"
User: arn:aws:sts::353731341341:assumed-role/flowlogic-ci-cd-dev/github-21123966345-dev 
is not authorized to perform: ssm:GetParameter on resource: 
arn:aws:ssm:us-east-1:353731341341:parameter/serverless-framework/deployment/s3-bucket
```

**Root Cause:**
- Serverless Framework v4 changed behavior: it now tries to use SSM Parameter Store to store deployment bucket information
- IAM role `flowlogic-ci-cd-dev` doesn't have `ssm:GetParameter` permission
- This is a breaking change from v3, which didn't require SSM

## ✅ Fix Applied

**Solution:** Specify explicit `deploymentBucket` in `serverless.yml` to avoid SSM requirement

**File:** `infra/serverless/serverless.yml`
```yaml
provider:
  # ... other config ...
  # Explicit deployment bucket to avoid SSM Parameter Store requirement
  # Serverless Framework v4 tries to use SSM for bucket info, but we don't have SSM permissions
  deploymentBucket:
    name: flowlogic-${self:provider.stage}-serverless-deployment
    blockPublicAccess: true
    versioning: true
```

**Why this works:**
- When `deploymentBucket` is explicitly specified, Serverless Framework v4 doesn't try to use SSM
- It uses the specified bucket directly
- No SSM permissions required

## 📝 Changes Made

**Commit:** `fc4b7e3` - "fix: add explicit deploymentBucket to avoid SSM requirement in Serverless Framework v4"

**What changed:**
- Added `deploymentBucket` configuration to `provider` section
- Bucket name: `flowlogic-{stage}-serverless-deployment`
- Enabled `blockPublicAccess` and `versioning` for security

## 🚀 Status

- ✅ Fix committed
- ✅ Pushed to `develop` branch
- ✅ New workflow triggered
- ⏳ Waiting for deployment to complete

## 📊 Verification

After deployment completes, verify:
- ✅ No SSM permission errors
- ✅ Deployment bucket created/used correctly
- ✅ Deployment succeeds

## 🔗 Monitor

**GitHub Actions:** https://github.com/recreomassage-hub/flowlogic.shop/actions

**Latest Run:** Should show successful deployment after fix
