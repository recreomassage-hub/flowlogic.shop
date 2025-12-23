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

### ⚠️ КРИТИЧЕСКИ ВАЖНО: Защита от утечек секретов

**После инцидента с утечкой SSH ключа (2025-12-23), следующие правила обязательны:**

1. **НИКОГДА не добавляйте файлы `.env` в Git**
   - Убедитесь, что `.env` прописан в `.gitignore` (уже настроено)
   - Используйте только `.env.example` как шаблон
   - Все реальные секреты должны храниться в AWS SSM Parameter Store или GitHub Secrets

2. **Secret Scanning обязателен**
   - Все коммиты должны проходить через проверку GitGuardian (или аналоги) перед слиянием в ветку `main`
   - GitHub Secret Scanning должен быть включен с push protection
   - Это предотвращает повторную утечку SSH-ключей, AWS Access Keys и других секретов

3. **Проверка перед каждым PR**
   - GFC (Git Flow Controller) проверяет входящий код на соответствие требованиям
   - Проверка наличия всех переменных окружения в `.env.example`
   - Проверка отсутствия hardcoded секретов в коде

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

### Secret Scanning (GitGuardian / GitHub Secret Scanning)

**КРИТИЧЕСКИ ВАЖНО:** После инцидента с утечкой SSH ключа (2025-12-23), все коммиты должны проходить через проверку Secret Scanning перед слиянием в ветку `main`.

#### Настройка GitHub Secret Scanning

1. **Включите Secret Scanning:**
   - Repository Settings → Security → Code security and analysis
   - Enable "Secret scanning" (GitHub Advanced Security)
   - Enable "Push protection" (блокирует push с секретами)

2. **Настройка GitGuardian (рекомендуется):**
   - Интеграция с GitHub через GitGuardian App
   - Автоматическое сканирование всех коммитов
   - Уведомления в реальном времени

3. **Проверка перед каждым PR:**
   - GFC (Git Flow Controller) автоматически проверяет входящий код
   - Проверка на наличие hardcoded секретов
   - Проверка структуры AWS (нет изменений, нарушающих архитектуру)
   - Проверка наличия всех переменных окружения в `.env.example`

#### Что проверяется:

- SSH Private Keys (id_rsa, id_ed25519, *.pem)
- AWS Access Keys (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- API Keys (Stripe, Sentry, etc.)
- Database credentials
- JWT secrets
- OAuth tokens

#### Процесс проверки:

1. **Pre-commit hook (опционально):**
   ```bash
   # Установите git-secrets
   git secrets --install
   git secrets --register-aws
   ```

2. **GitHub Actions workflow:**
   - Автоматическое сканирование при каждом PR
   - Блокировка merge при обнаружении секретов

3. **GFC проверка:**
   - Проверка структуры кода
   - Проверка наличия всех переменных в `.env.example`
   - Проверка отсутствия секретов в коде

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

> **Для Deploy Supervisor (DS):** Разделы Monitoring Setup и Post-Deployment Checklist являются основой для автоматических проверок после деплоя. DS использует эти метрики для подтверждения успешности операции.

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

### DS Monitoring Integration

DS автоматически проверяет следующие метрики после деплоя:

1. **Error Rate Check:**
   ```bash
   # DS проверяет, что error rate не превышает 1%
   ERROR_RATE=$(aws cloudwatch get-metric-statistics ...)
   if [ "$ERROR_RATE" -gt 1 ]; then
     echo "⚠️  High error rate detected"
   fi
   ```

2. **Latency Check:**
   ```bash
   # DS проверяет, что p95 latency < 500ms
   P95_LATENCY=$(aws cloudwatch get-metric-statistics ...)
   if [ "$P95_LATENCY" -gt 500 ]; then
     echo "⚠️  High latency detected"
   fi
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

> **Для Deploy Supervisor (DS):** Этот чеклист является основой для автоматических проверок после деплоя. DS должен проходить по каждому пункту и подтверждать успешность операции.

### Backend

- [ ] API Gateway endpoint accessible
- [ ] Health check endpoint returns `200 OK`
  ```bash
  curl https://api.flowlogic.shop/v1/health
  # Ожидаемый ответ: {"status": "healthy", ...}
  ```
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

### DS (Deploy Supervisor) Automated Checks

DS использует этот чеклист для автоматической проверки после деплоя:

1. **Health Check:**
   ```bash
   # DS проверяет health endpoint
   HEALTH_STATUS=$(curl -s https://api.flowlogic.shop/v1/health | jq -r '.status')
   if [ "$HEALTH_STATUS" != "healthy" ]; then
     echo "❌ Health check failed"
     exit 1
   fi
   ```

2. **API Accessibility:**
   ```bash
   # DS проверяет доступность API
   API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.flowlogic.shop/v1/health)
   if [ "$API_RESPONSE" != "200" ]; then
     echo "❌ API not accessible"
     exit 1
   fi
   ```

3. **Frontend Accessibility:**
   ```bash
   # DS проверяет доступность frontend
   FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://flowlogic.shop)
   if [ "$FRONTEND_RESPONSE" != "200" ]; then
     echo "❌ Frontend not accessible"
     exit 1
   fi
   ```

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

