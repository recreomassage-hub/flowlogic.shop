# Deployment Files Inventory

**Date:** 2026-01-10  
**Source:** `.archive/legacy-system/`  
**Purpose:** Catalog of all deployment-related files from archived legacy system

## 📋 Deployment Documentation Files

### Main Deployment Guides

1. **`docs/deployment_guide.md`**
   - Main deployment guide
   - Overall deployment process overview

2. **`docs/deployment/deployment_process.md`**
   - Detailed deployment process
   - Step-by-step instructions

3. **`docs/deployment/staging_production.md`**
   - Staging vs Production differences
   - Environment-specific configurations

4. **`docs/deployment/pre_deployment_checklist.md`**
   - Pre-deployment verification checklist
   - Required checks before deployment

5. **`docs/deployment/post_deployment_checklist.md`**
   - Post-deployment verification checklist
   - Smoke tests and validation steps

---

## 🔐 Secrets & Security Configuration

### GitHub Actions Secrets

6. **`docs/deployment/github_actions_secrets.md`**
   - List of all GitHub Secrets required
   - OIDC setup for AWS
   - Environment-specific secrets

### AWS Credentials & IAM

7. **`docs/deployment/aws_credentials_setup.md`**
   - AWS credentials configuration
   - Access keys setup
   - Local development setup

8. **`docs/deployment/aws_iam_setup.md`**
   - IAM roles and policies setup
   - Required permissions

9. **`docs/deployment/aws_iam_policy_fixed.json`**
   - IAM policy JSON for deployment
   - Required permissions document

10. **`docs/deployment/aws_iam_permissions.md`**
    - Detailed IAM permissions explanation
    - Permission breakdown

11. **`docs/deployment/aws_oidc_setup.md`**
    - OIDC setup for GitHub Actions
    - AWS authentication via OIDC

12. **`docs/deployment/iam_roles_explained.md`**
    - IAM roles explanation
    - Role structure and purpose

### Vercel Configuration

13. **`docs/deployment/vercel_environment_variables.md`**
    - Vercel environment variables list
    - Frontend deployment configuration
    - Environment-specific variables

---

## ☁️ AWS Services Setup

### Cognito (Authentication)

14. **`docs/deployment/cognito_setup.md`**
    - AWS Cognito user pool setup
    - Authentication configuration

15. **`docs/deployment/cognito_mfa_setup.md`**
    - MFA (Multi-Factor Authentication) setup
    - Security configuration

---

## 🚀 Deployment Scripts

### Main Deployment Scripts

16. **`scripts/post_deploy.sh`**
    - Post-deployment tasks
    - Health checks
    - Verification steps

17. **`scripts/smoke_tests.sh`**
    - Smoke tests after deployment
    - Critical path validation
    - Rollback triggers

18. **`scripts/rollback_stage.sh`**
    - Rollback procedure
    - Version management
    - Recovery process

### Infrastructure Scripts

19. **`scripts/check_ssm_params.sh`**
    - AWS SSM Parameter Store validation
    - Secrets verification
    - Parameter existence check

20. **`scripts/setup_monitoring.sh`**
    - CloudWatch setup
    - Alarms configuration
    - Monitoring initialization

---

## 📁 Configuration Files (Expected Locations)

### Serverless Framework

**Expected:** `serverless.yml` or `serverless.yaml`
- Backend infrastructure as code
- AWS Lambda configuration
- API Gateway setup
- DynamoDB tables
- Environment variables mapping

**Not found in archive** - needs to be created or restored from active project

### Vercel Configuration

**Expected:** `vercel.json`
- Frontend deployment configuration
- Build settings
- Environment variables
- Routing rules
- Headers configuration

**Not found in archive** - needs to be created or restored from active project

### GitHub Actions Workflows

**Expected:** `.github/workflows/*.yml`
- CI/CD pipeline definitions
- Deployment automation
- Testing workflows
- Security scans

**Not found in archive** - needs to be created or restored from active project

### Environment Files Template

**Expected:** `.env.example` or `.env.template`
- Environment variables template
- Required variables list
- Example values

**Not found in archive** - needs to be created

### Git Configuration

**Expected:** `.gitignore`
- Ignored files and directories
- Secret files
- Build artifacts
- Environment files

**Not found in archive** - needs to be created or restored from active project

---

## 🏗️ Infrastructure Documentation

### Infrastructure Setup

21. **`docs/infrastructure/iam_setup.md`**
    - IAM roles and policies
    - Service accounts
    - Permissions management

22. **`docs/infrastructure/stripe_setup.md`**
    - Stripe payment integration
    - API keys configuration
    - Webhook setup

---

## 📊 Architecture Files

### API & Database

23. **`docs/architecture/api_spec.yaml`**
    - OpenAPI/Swagger specification
    - API endpoints documentation
    - Request/response schemas

24. **`docs/architecture/db_schema.md`**
    - Database schema documentation
    - Table structures
    - Relationships

---

## 🔍 Troubleshooting

### Deployment Troubleshooting

25. **`docs/deployment/troubleshooting/aws_credentials.md`**
    - AWS credentials issues
    - Common problems and solutions

26. **`docs/deployment/troubleshooting/README.md`**
    - Troubleshooting guide index
    - Common issues

---

## 📝 Required Files Summary

### Must Create/Restore

1. **`serverless.yml`** - Backend infrastructure (AWS Lambda, API Gateway, DynamoDB)
2. **`vercel.json`** - Frontend deployment (Vercel configuration)
3. **`.github/workflows/deploy.yml`** - CI/CD pipeline
4. **`.env.example`** - Environment variables template
5. **`.gitignore`** - Git ignore rules
6. **`.github/workflows/ci.yml`** - Continuous Integration pipeline

### Must Configure

1. **GitHub Secrets** - See `docs/deployment/github_actions_secrets.md`
2. **Vercel Environment Variables** - See `docs/deployment/vercel_environment_variables.md`
3. **AWS SSM Parameters** - See `scripts/check_ssm_params.sh`
4. **AWS IAM Roles** - See `docs/deployment/aws_iam_setup.md`
5. **AWS Cognito** - See `docs/deployment/cognito_setup.md`

---

## 🔄 Deployment Workflow Files

### Scenario Configuration

27. **`workflow/scenarios/DEPLOYMENT.yml`**
    - Deployment scenario configuration
    - LLM-OS workflow state

---

## 📚 Additional References

### Developer Guides

28. **`docs/developer_guide.md`**
    - Development setup
    - Local environment
    - Common tasks

29. **`docs/development/local_development.md`**
    - Local development setup
    - Docker compose
    - Testing locally

---

## 🎯 Quick Start Checklist

### For First Deployment:

1. ✅ Read `docs/deployment/deployment_process.md`
2. ✅ Setup AWS IAM: `docs/deployment/aws_iam_setup.md`
3. ✅ Setup AWS Cognito: `docs/deployment/cognito_setup.md`
4. ✅ Configure GitHub Secrets: `docs/deployment/github_actions_secrets.md`
5. ✅ Create `serverless.yml` for backend
6. ✅ Create `vercel.json` for frontend
7. ✅ Create `.github/workflows/deploy.yml`
8. ✅ Configure Vercel env vars: `docs/deployment/vercel_environment_variables.md`
9. ✅ Run pre-deployment checklist: `docs/deployment/pre_deployment_checklist.md`
10. ✅ Deploy staging first
11. ✅ Run post-deployment checklist: `docs/deployment/post_deployment_checklist.md`

---

## ⚠️ Notes

- All files listed above are from `.archive/legacy-system/` directory
- Configuration files (serverless.yml, vercel.json, .github/workflows) are NOT in archive
- These configuration files need to be created or restored from active project/git history
- Secret files (.env) should NEVER be committed - use environment variables or secrets managers
- Use `.env.example` as template for required environment variables

---

**Next Steps:**
1. Check active project for existing configuration files
2. Compare with documentation in archive
3. Restore or create missing configuration files
4. Update documentation based on current setup



