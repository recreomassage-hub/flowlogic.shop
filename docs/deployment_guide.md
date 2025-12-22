# 🚀 Deployment Guide — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Для:** DevOps Engineers

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Secrets Management](#secrets-management)
7. [CI/CD Configuration](#cicd-configuration)
8. [Monitoring Setup](#monitoring-setup)
9. [Rollback Procedures](#rollback-procedures)

---

## 🔧 Prerequisites

### Required Accounts

- **AWS Account** with appropriate permissions
- **Vercel Account** (for frontend)
- **GitHub Account** (for CI/CD)
- **Stripe Account** (for payments)

### Required Tools

- **Node.js** 20+
- **npm** or **yarn**
- **Serverless Framework** 3.x
- **AWS CLI** configured
- **Git**

### AWS Services Required

- Lambda
- API Gateway
- DynamoDB
- S3
- Cognito
- CloudWatch
- SSM Parameter Store
- IAM

---

## 🌍 Environment Setup

### Environment Variables

Flow Logic uses three environments:

1. **Development (dev)** - Local development and testing
2. **Staging** - Pre-production testing
3. **Production (prod)** - Live production environment

### Backend Environment Variables

Create `.env` file in `src/backend/`:

```env
# Environment
STAGE=dev
AWS_REGION=us-east-1
NODE_ENV=development

# Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx

# DynamoDB
DYNAMODB_USERS_TABLE=flowlogic-dev-users
DYNAMODB_SUBSCRIPTIONS_TABLE=flowlogic-dev-subscriptions
DYNAMODB_ASSESSMENTS_TABLE=flowlogic-dev-assessments
DYNAMODB_PLANS_TABLE=flowlogic-dev-plans
DYNAMODB_CALENDAR_TASKS_TABLE=flowlogic-dev-calendar-tasks
DYNAMODB_PROGRESS_TABLE=flowlogic-dev-progress
DYNAMODB_USER_LIMITS_TABLE=flowlogic-dev-user-limits
DYNAMODB_MIGRATIONS_TABLE=flowlogic-dev-migrations

# S3
S3_BUCKET=flowlogic-dev-videos

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `.env` file in `src/frontend/`:

```env
VITE_API_URL=https://api.flowlogic.shop/v1
```

---

## ⚙️ Backend Deployment

### Using Serverless Framework

1. **Install Serverless Framework**

```bash
npm install -g serverless@3
```

2. **Configure AWS Credentials**

```bash
aws configure
# Enter AWS Access Key ID
# Enter AWS Secret Access Key
# Enter default region (us-east-1)
```

3. **Deploy to Development**

```bash
cd infra/serverless
serverless deploy --stage dev
```

4. **Deploy to Staging**

```bash
serverless deploy --stage staging
```

5. **Deploy to Production**

```bash
serverless deploy --stage prod
```

### Manual Deployment Steps

1. **Build Backend**

```bash
cd src/backend
npm install
npm run build
```

2. **Deploy Infrastructure**

```bash
cd infra/serverless
serverless deploy --stage {stage}
```

3. **Verify Deployment**

```bash
serverless info --stage {stage}
```

### Deployment Output

After deployment, you will receive:

- **API Gateway Endpoint:** `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`
- **Lambda Function ARN:** `arn:aws:lambda:{region}:{account}:function:flowlogic-backend-{stage}-api`
- **DynamoDB Tables:** Created automatically
- **S3 Bucket:** Created automatically

---

## 🎨 Frontend Deployment

### Using Vercel

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Link Project**

```bash
cd src/frontend
vercel link
```

4. **Deploy to Preview**

```bash
vercel
```

5. **Deploy to Production**

```bash
vercel --prod
```

### Environment Variables in Vercel

Set environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   - `VITE_API_URL` - API endpoint URL
   - `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (if needed)

### Automatic Deployment

Frontend automatically deploys on push to `main` branch via GitHub Actions (see `infra/ci-cd/.github/workflows/frontend-deploy.yml`).

---

## 🗄️ Database Setup

### DynamoDB Tables

Tables are created automatically by Serverless Framework. Manual creation:

1. **Create Tables via AWS Console**

   - Navigate to DynamoDB Console
   - Create tables according to schema in `docs/architecture/db_schema.md`

2. **Or via Serverless Framework**

   ```bash
   cd infra/serverless
   serverless deploy --stage {stage}
   ```

### Database Migrations

Run migrations (if implemented):

```bash
cd src/backend
npm run migrate
```

---

## 🔐 Secrets Management

### AWS SSM Parameter Store

Store secrets in AWS SSM Parameter Store:

```bash
# Cognito User Pool ID
aws ssm put-parameter \
  --name /flowlogic/{stage}/cognito/user-pool-id \
  --value "us-east-1_XXXXXXXXX" \
  --type String

# Cognito Client ID
aws ssm put-parameter \
  --name /flowlogic/{stage}/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxx" \
  --type String

# Stripe Secret Key (SecureString)
aws ssm put-parameter \
  --name /flowlogic/{stage}/stripe/secret-key \
  --value "sk_test_..." \
  --type SecureString
```

### GitHub Secrets

For CI/CD, set secrets in GitHub:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `AWS_ACCESS_KEY_ID_DEV`
   - `AWS_SECRET_ACCESS_KEY_DEV`
   - `AWS_ACCESS_KEY_ID_STAGING`
   - `AWS_SECRET_ACCESS_KEY_STAGING`
   - `AWS_ACCESS_KEY_ID_PROD`
   - `AWS_SECRET_ACCESS_KEY_PROD`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

---

## 🔄 CI/CD Configuration

### GitHub Actions Workflows

CI/CD is configured in `infra/ci-cd/.github/workflows/`:

1. **Backend Deployment** (`backend-deploy.yml`)
   - Triggers on push to `main` or `develop`
   - Runs: lint, type check, tests
   - Deploys to dev/staging/prod
   - Runs smoke tests

2. **Frontend Deployment** (`frontend-deploy.yml`)
   - Triggers on push to `main`
   - Runs: lint, type check, tests, build
   - Deploys to Vercel

### Manual CI/CD Trigger

```bash
# Push to develop → auto-deploy to dev
git push origin develop

# Push to main → auto-deploy to staging/prod
git push origin main
```

---

## 📊 Monitoring Setup

### CloudWatch Logs

Logs are automatically created for Lambda functions. View logs:

```bash
aws logs tail /aws/lambda/flowlogic-backend-{stage}-api --follow
```

### CloudWatch Metrics

Monitor:
- API latency (p50, p95, p99)
- Error rates
- Lambda invocations
- DynamoDB read/write capacity

### Sentry (Optional)

1. Create Sentry project
2. Get DSN
3. Add to environment variables:
   ```env
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

---

## 🔙 Rollback Procedures

### Backend Rollback

1. **List Deployments**

```bash
serverless deploy list --stage prod
```

2. **Rollback to Previous Version**

```bash
serverless rollback --stage prod --timestamp {timestamp}
```

3. **Verify Rollback**

```bash
# Check health endpoint
curl https://api.flowlogic.shop/v1/health
```

### Frontend Rollback

1. **Via Vercel Dashboard**
   - Go to Deployments
   - Find previous deployment
   - Click "Promote to Production"

2. **Via Vercel CLI**

```bash
vercel rollback
```

---

## ✅ Post-Deployment Checklist

### Backend

- [ ] API Gateway endpoint accessible
- [ ] Health check endpoint returns `200 OK`
- [ ] DynamoDB tables created
- [ ] S3 bucket created and accessible
- [ ] Cognito User Pool configured
- [ ] CloudWatch logs working
- [ ] Secrets in SSM Parameter Store

### Frontend

- [ ] Frontend accessible at production URL
- [ ] API calls working
- [ ] Authentication flow working
- [ ] All pages load correctly
- [ ] No console errors

### Integration

- [ ] End-to-end user flow tested
- [ ] Payment flow tested (Stripe)
- [ ] Video upload working
- [ ] Assessment processing working

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Deployment fails with IAM permissions error**

**Solution:**
- Check IAM user/role has required permissions
- Verify AWS credentials are correct

**Issue: Lambda function timeout**

**Solution:**
- Increase timeout in `serverless.yml`
- Check CloudWatch logs for errors

**Issue: API Gateway returns 502**

**Solution:**
- Check Lambda function logs
- Verify Lambda function is deployed
- Check API Gateway integration

**Issue: Frontend can't connect to API**

**Solution:**
- Verify `VITE_API_URL` is correct
- Check CORS settings in API Gateway
- Verify API Gateway endpoint is accessible

See [Troubleshooting Guide](docs/troubleshooting.md) for more details.

---

## 📚 Related Documentation

- **Infrastructure:** [infra/README.md](../infra/README.md)
- **Secrets Management:** [infra/SECRETS.md](../infra/SECRETS.md)
- **Architecture:** [docs/architecture/](docs/architecture/)
- **Security:** [docs/security/](docs/security/)

---

**Last Updated:** 2025-12-22  
**Version:** 1.0

