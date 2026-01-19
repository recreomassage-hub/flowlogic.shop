# 🔐 IAM Policy Update: Add SSM Permissions for Serverless Framework v4

## ❌ Problem

Serverless Framework v4 requires SSM Parameter Store access for deployment bucket management:
```
User: arn:aws:sts::353731341341:assumed-role/flowlogic-ci-cd-dev/github-21124106909-dev 
is not authorized to perform: ssm:GetParameter on resource: 
arn:aws:ssm:us-east-1:353731341341:parameter/serverless-framework/deployment/s3-bucket
```

## ✅ Solution

Added SSM permissions for `/serverless-framework/*` path to all IAM policies.

### Files Updated

1. **infra/iam/cicd-policy.json** - Dev/Staging policy
2. **infra/iam/cicd-policy-with-diagnostics.json** - Dev/Staging with diagnostics
3. **infra/iam/cicd-policy-production.json** - Production policy

### Added Statement

```json
{
  "Sid": "SSMServerlessFramework",
  "Effect": "Allow",
  "Action": [
    "ssm:GetParameter",
    "ssm:GetParameters",
    "ssm:PutParameter",
    "ssm:DescribeParameters"
  ],
  "Resource": [
    "arn:aws:ssm:us-east-1:*:parameter/serverless-framework/*"
  ]
}
```

## 📋 Apply Policy Update

### Option 1: Using AWS CLI (Manual)

```bash
# For dev/staging role
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-dev \
  --policy-name cicd-policy \
  --policy-document file://infra/iam/cicd-policy.json

# For production role
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-production \
  --policy-name cicd-policy-production \
  --policy-document file://infra/iam/cicd-policy-production.json
```

### Option 2: Using Terraform (If available)

If IAM roles are managed via Terraform, update the policy in Terraform configuration and apply.

### Option 3: AWS Console

1. Go to IAM → Roles
2. Select `flowlogic-ci-cd-dev` (and `flowlogic-ci-cd-staging`, `flowlogic-ci-cd-production`)
3. Go to "Permissions" tab
4. Find the inline policy or managed policy
5. Edit policy → Add JSON
6. Add the new statement for `SSMServerlessFramework`
7. Save changes

## 🔍 Verification

After applying the policy, verify:

```bash
# Test SSM access
aws ssm get-parameter \
  --name "/serverless-framework/deployment/s3-bucket" \
  --region us-east-1

# Or test with the role
aws sts assume-role \
  --role-arn arn:aws:iam::353731341341:role/flowlogic-ci-cd-dev \
  --role-session-name test-session
```

## ⚠️ Important

- Policy changes take effect immediately
- No need to restart services
- Test deployment after policy update

## 📊 Next Steps

1. Apply updated IAM policies to all environments (dev, staging, production)
2. Test deployment to verify SSM access works
3. Monitor CloudWatch logs for any permission errors
