# 🚀 First Deployment Checklist для Flow Logic

**Дата:** 2026-01-10  
**Для:** DevOps Engineers, Developers  
**Цель:** Успешный первый деплой проекта на AWS + Vercel

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. AWS Infrastructure Setup

#### ✅ AWS CLI установлен и настроен
- [ ] AWS CLI установлен: `aws --version`
- [ ] AWS credentials настроены: `aws sts get-caller-identity`
- [ ] AWS region установлен: `aws configure get region` (должен быть `us-east-1`)

#### ✅ IAM Role/User настроен
- [ ] IAM Role создана с OIDC ИЛИ IAM User создан с Access Keys
- [ ] Role/User имеет все необходимые permissions (см. `docs/deployment/aws_iam_permissions.md`)
- [ ] Trust Policy настроен для OIDC (если используется)

**Рекомендуется:** Создать IAM User с Access Keys для первого деплоя (проще настроить)

**Проверка:**
```bash
# Для IAM User
aws iam get-user --user-name flowlogic-cicd-user
aws iam list-attached-user-policies --user-name flowlogic-cicd-user

# Для IAM Role
aws iam get-role --role-name flowlogic-github-actions-role
```

#### ✅ GitHub Secrets настроены

**Добавьте в GitHub Secrets** (Settings → Secrets and variables → Actions):

**Для Production:**
- [ ] `AWS_ACCESS_KEY_ID_PROD` - AWS Access Key ID
- [ ] `AWS_SECRET_ACCESS_KEY_PROD` - AWS Secret Access Key

**Для Staging (опционально):**
- [ ] `AWS_ACCESS_KEY_ID_STAGING` - AWS Access Key ID
- [ ] `AWS_SECRET_ACCESS_KEY_STAGING` - AWS Secret Access Key

**Для Vercel:**
- [ ] `VERCEL_TOKEN` - Vercel Deploy Token
- [ ] `VERCEL_ORG_ID` - Vercel Organization ID (опционально)
- [ ] `VERCEL_PROJECT_ID` - Vercel Project ID (опционально)

**Инструкции:**
- AWS: `docs/deployment/aws_credentials_setup.md`
- Vercel: `docs/deployment/vercel_environment_variables.md`

#### ✅ SSM Parameters созданы

**Создайте следующие параметры в AWS SSM Parameter Store:**

```bash
# Production Cognito
aws ssm put-parameter \
  --name /flowlogic/production/cognito/user-pool-id \
  --value "us-east-1_xxxxxxxxxx" \
  --type String \
  --region us-east-1

aws ssm put-parameter \
  --name /flowlogic/production/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxxxxxxxxxx" \
  --type String \
  --region us-east-1

# Production Stripe (SecureString)
aws ssm put-parameter \
  --name /flowlogic/production/stripe/secret-key \
  --value "sk_live_<YOUR_SECRET_KEY_HERE>" \
  --type SecureString \
  --region us-east-1
```

**Проверка:**
```bash
aws ssm get-parameter --name /flowlogic/production/cognito/user-pool-id --region us-east-1
aws ssm get-parameter --name /flowlogic/production/cognito/client-id --region us-east-1
aws ssm get-parameter --name /flowlogic/production/stripe/secret-key --region us-east-1 --with-decryption
```

#### ✅ Cognito User Pool создан
- [ ] User Pool создан в AWS Console
- [ ] App Client создан
- [ ] Client ID скопирован в SSM Parameter Store

**Инструкция:** `docs/deployment/cognito_setup.md`

**Проверка:**
```bash
aws cognito-idp list-user-pools --max-results 10 --region us-east-1
```

---

### 2. Code & Configuration

#### ✅ Backend код готов
- [ ] TypeScript компилируется: `cd src/backend && npm run build`
- [ ] Все зависимости установлены: `cd src/backend && npm install`
- [ ] `src/backend/dist/` содержит скомпилированный код: `ls -la src/backend/dist/`

#### ✅ Serverless Framework конфигурация
- [ ] `infra/serverless/serverless.yml` существует и валиден
- [ ] Serverless Framework установлен: `serverless --version`
- [ ] Зависимости установлены: `cd infra/serverless && npm install`

**Проверка конфигурации:**
```bash
cd infra/serverless
npx serverless print --stage production
```

#### ✅ Frontend код готов
- [ ] TypeScript компилируется: `cd src/frontend && npm run build`
- [ ] Все зависимости установлены: `cd src/frontend && npm install`
- [ ] `src/frontend/dist/` содержит скомпилированный код: `ls -la src/frontend/dist/`

#### ✅ Vercel конфигурация
- [ ] `vercel.json` или `src/frontend/vercel.json` существует
- [ ] Vercel CLI установлен (опционально): `vercel --version`

#### ✅ Environment Variables
- [ ] `.env.example` файлы созданы для backend и frontend
- [ ] Backend использует SSM Parameters (не требует локального .env для деплоя)
- [ ] Frontend environment variables настроены в Vercel Dashboard

**Для Vercel:**
1. Перейдите в Vercel Dashboard: https://vercel.com/dashboard
2. Выберите проект
3. Settings → Environment Variables
4. Добавьте для **Production**:
   - `VITE_API_URL` = `https://YOUR_API_GATEWAY_URL/prod`
   - `VITE_COGNITO_CLIENT_ID` = ваш Cognito Client ID

---

### 3. GitHub Workflows

#### ✅ CI/CD Pipeline настроен
- [ ] `.github/workflows/ci-cd.yml` существует
- [ ] `.github/workflows/backend-deploy.yml` существует
- [ ] `.github/workflows/frontend-deploy.yml` существует
- [ ] Все workflows валидны (синтаксис YAML правильный)

**Проверка:**
```bash
# Проверка синтаксиса YAML
yamllint .github/workflows/*.yml || echo "yamllint не установлен, пропускаем"
```

---

## 🚀 DEPLOYMENT PROCESS

### Шаг 1: Проверка готовности

Выполните все проверки из **PRE-DEPLOYMENT CHECKLIST** выше.

### Шаг 2: Деплой Backend (через GitHub Actions)

1. **Push в main branch:**
   ```bash
   git add .
   git commit -m "feat: ready for first deployment"
   git push origin main
   ```

2. **Мониторинг деплоя:**
   - Перейдите в GitHub Actions: https://github.com/recreomassage-hub/flowlogic.shop/actions
   - Откройте последний workflow run
   - Проверьте job "Deploy to Production"

3. **Ожидаемый результат:**
   ```
   ✅ Service deployed to stack flowlogic-backend-production
   ✅ endpoints:
      ANY - https://YOUR_API_GATEWAY_URL/prod/{proxy+}
      ANY - https://YOUR_API_GATEWAY_URL/prod/
   ```

### Шаг 3: Получение API Gateway URL

```bash
cd infra/serverless
npx serverless info --stage production
```

**Сохраните URL** для настройки frontend.

### Шаг 4: Обновление Vercel Environment Variables

1. Обновите `VITE_API_URL` в Vercel Dashboard с новым API Gateway URL
2. Дождитесь автоматического redeploy фронтенда (или запустите вручную)

### Шаг 5: Деплой Frontend (через GitHub Actions)

Frontend автоматически деплоится при push в main, если `.github/workflows/frontend-deploy.yml` настроен правильно.

**Или вручную через Vercel CLI:**
```bash
cd src/frontend
npx vercel deploy --prod --token $VERCEL_TOKEN
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### 1. Backend Verification

- [ ] Health endpoint доступен: `curl https://YOUR_API_GATEWAY_URL/prod/`
- [ ] Health endpoint возвращает 200 OK
- [ ] Lambda функция развернута (проверить в AWS Console)
- [ ] API Gateway endpoint создан
- [ ] DynamoDB таблицы созданы (проверить в AWS Console)
- [ ] S3 bucket создан (проверить в AWS Console)

**Проверка endpoints:**
```bash
# Health check
curl https://YOUR_API_GATEWAY_URL/prod/

# Expected: {"status":"ok"} or similar
```

### 2. Frontend Verification

- [ ] Frontend доступен по URL: `https://flowlogic.shop` (или ваш домен)
- [ ] Environment variables настроены в Vercel
- [ ] Build успешен без ошибок
- [ ] Все страницы загружаются

### 3. Integration Verification

- [ ] Frontend может подключиться к backend API
- [ ] CORS настроен правильно
- [ ] API endpoints отвечают корректно

**Проверка CORS:**
```bash
curl -I -X OPTIONS https://YOUR_API_GATEWAY_URL/prod/ \
  -H "Origin: https://flowlogic.shop" \
  -H "Access-Control-Request-Method: GET"

# Expected: Access-Control-Allow-Origin: https://flowlogic.shop
```

### 4. Smoke Tests

```bash
# Production
./scripts/smoke_tests.sh production

# Expected: Все smoke tests пройдены (0 failures)
```

**Что проверяют smoke tests:**
1. Health endpoint доступен (200 OK)
2. CORS настроен правильно
3. API endpoints требуют авторизацию (401 для неавторизованных)
4. Auth endpoints доступны (register, login)

### 5. CloudWatch Logs

- [ ] Log Group создан: `/aws/lambda/flowlogic-backend-production-api`
- [ ] Logs доступны в CloudWatch Console
- [ ] Нет критических ошибок в логах

**Проверка логов:**
```bash
aws logs tail /aws/lambda/flowlogic-backend-production-api --follow
```

---

## 🚨 TROUBLESHOOTING

### Deployment fails: "AWS credentials not found"
**Решение:**
- Проверьте, что `AWS_ACCESS_KEY_ID_PROD` и `AWS_SECRET_ACCESS_KEY_PROD` добавлены в GitHub Secrets
- Проверьте, что IAM User имеет правильные permissions
- См. `docs/deployment/troubleshooting/aws_credentials.md`

### Deployment fails: "Parameter not found" (SSM)
**Решение:**
```bash
# Проверьте существование параметра
aws ssm get-parameter --name /flowlogic/production/cognito/user-pool-id

# Если не существует, создайте (см. шаг 1 выше)
```

### Frontend can't connect to backend
**Решение:**
- Проверьте `VITE_API_URL` в Vercel Dashboard
- Проверьте CORS настройки в `serverless.yml`
- Проверьте, что API Gateway endpoint доступен

### Smoke tests fail
**Решение:**
- Проверьте API Gateway endpoints
- Проверьте CloudWatch Logs для ошибок
- Проверьте CORS настройки

---

## 📚 Additional Resources

- **Pre-deployment checklist:** `docs/deployment/pre_deployment_checklist.md`
- **Post-deployment checklist:** `docs/deployment/post_deployment_checklist.md`
- **Deployment process:** `docs/deployment/deployment_process.md`
- **Troubleshooting:** `docs/deployment/troubleshooting/`

---

## ✅ Готовность к первому деплою

После прохождения всех чеклистов:
1. ✅ Все настроено
2. ✅ Все проверено
3. ✅ Готово к деплою

**Следующий шаг:** `git push origin main` и мониторинг workflow в GitHub Actions.

---

**Последнее обновление:** 2026-01-10



