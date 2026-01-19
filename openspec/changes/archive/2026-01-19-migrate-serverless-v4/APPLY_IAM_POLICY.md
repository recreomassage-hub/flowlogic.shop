# 🔐 Apply IAM Policy Update

## ✅ Changes Committed

IAM policies have been updated with SSM permissions for Serverless Framework v4:
- `infra/iam/cicd-policy.json`
- `infra/iam/cicd-policy-with-diagnostics.json`
- `infra/iam/cicd-policy-production.json`

## 📋 Apply Policy to AWS

### Option 1: Using Existing Script

```bash
# Update dev/staging policy
./scripts/update-cicd-policy.sh dev

# Update production policy (if script supports it)
./scripts/update-cicd-policy.sh production
```

### Option 2: Manual AWS CLI

```bash
# For dev role
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-dev \
  --policy-name cicd-policy \
  --policy-document file://infra/iam/cicd-policy.json

# For staging role (if separate)
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name cicd-policy \
  --policy-document file://infra/iam/cicd-policy.json

# For production role
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-production \
  --policy-name cicd-policy-production \
  --policy-document file://infra/iam/cicd-policy-production.json
```

### Option 3: AWS Console

1. Go to IAM → Roles
2. Select role (e.g., `flowlogic-ci-cd-dev`)
3. Permissions tab → Find inline policy
4. Edit → Replace JSON with content from updated policy file
5. Save

## ⚠️ Important

- Policy changes take effect immediately
- Apply to all environments: dev, staging, production
- Test deployment after applying

## 🔍 Verify

After applying, test deployment should succeed without SSM permission errors.
