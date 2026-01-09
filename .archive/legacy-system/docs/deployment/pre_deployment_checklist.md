# ✅ Pre-Deployment Checklist для Flow Logic

**Версия:** 2.0  
**Дата:** 2025-12-26  
**Для:** DevOps Engineers, Developers

## 🎯 Цель
Убедиться, что все готово для успешного деплоя backend на AWS Lambda.

---

## 📋 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

### 1. AWS Infrastructure

#### ✅ AWS CLI установлен и настроен
- [ ] AWS CLI установлен
  ```bash
  aws --version
  ```
- [ ] AWS credentials настроены
  ```bash
  aws sts get-caller-identity
  ```

#### ✅ IAM Role/User настроен
- [ ] IAM Role создана с OIDC (рекомендуется) ИЛИ IAM User создан с Access Keys
- [ ] Role/User имеет все необходимые permissions (см. `docs/deployment/aws_iam_permissions.md`)
- [ ] Trust Policy настроен для OIDC (если используется OIDC)

**Проверка:**
```bash
# Для IAM User
aws iam get-user --user-name flowlogic-cicd-user
aws iam list-attached-user-policies --user-name flowlogic-cicd-user

# Для IAM Role
aws iam get-role --role-name flowlogic-github-actions-role
aws iam list-attached-role-policies --role-name flowlogic-github-actions-role
```

#### ✅ GitHub Secrets настроены
- [ ] `AWS_ROLE_ARN` добавлен (если используется OIDC)
  - ИЛИ `AWS_ACCESS_KEY_ID_PROD` + `AWS_SECRET_ACCESS_KEY_PROD` добавлены (если используется Access Keys)
- [ ] Проверьте: https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions

**Для разных environments:**
- [ ] `AWS_ACCESS_KEY_ID_DEV` / `AWS_SECRET_ACCESS_KEY_DEV` (для dev)
- [ ] `AWS_ACCESS_KEY_ID_STAGING` / `AWS_SECRET_ACCESS_KEY_STAGING` (для staging)
- [ ] `AWS_ACCESS_KEY_ID_PROD` / `AWS_SECRET_ACCESS_KEY_PROD` (для production)

#### ✅ SSM Parameters созданы
- [ ] `/flowlogic/production/cognito/user-pool-id`
- [ ] `/flowlogic/production/cognito/client-id`
- [ ] `/flowlogic/production/stripe/secret-key` (SecureString)

**Проверка:**
```bash
aws ssm get-parameter --name /flowlogic/production/cognito/user-pool-id --region us-east-1
aws ssm get-parameter --name /flowlogic/production/cognito/client-id --region us-east-1
aws ssm get-parameter --name /flowlogic/production/stripe/secret-key --region us-east-1 --with-decryption
```

**Для dev/staging:**
```bash
aws ssm get-parameter --name /flowlogic/dev/cognito/user-pool-id
aws ssm get-parameter --name /flowlogic/dev/cognito/client-id
aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key
```

#### ✅ Cognito User Pool создан
- [ ] User Pool `flowlogic-prod` создан в AWS Console
- [ ] App Client создан
- [ ] MFA настроен (опционально, рекомендуется TOTP)

**Проверка:**
```bash
aws cognito-idp list-user-pools --max-results 10 --region us-east-1
```

---

### 2. Code & Configuration

#### ✅ Backend код готов
- [ ] TypeScript компилируется без ошибок
- [ ] Все зависимости установлены
- [ ] `src/backend/dist/` содержит скомпилированный код

**Проверка:**
```bash
cd src/backend
npm run build
ls -la dist/
```

#### ✅ Serverless Framework конфигурация
- [ ] Serverless Framework установлен
  ```bash
  serverless --version
  # или
  npx serverless --version
  ```
- [ ] Зависимости установлены
  ```bash
  cd infra/serverless
  npm install
  ```
- [ ] `infra/serverless/serverless.yml` валиден
- [ ] Все переменные окружения настроены
- [ ] IAM permissions для Lambda функции настроены

**Проверка:**
```bash
cd infra/serverless
npx serverless print --stage production

# Проверка переменных
npx serverless print --stage production | grep -E "STRIPE_SECRET_KEY|COGNITO"
```

#### ✅ Environment Variables
- [ ] `NODE_ENV=production` настроен
- [ ] `FRONTEND_URL=https://flowlogic.shop` настроен
- [ ] Все SSM параметры доступны

---

### 3. CI/CD Pipeline

#### ✅ GitHub Actions Workflow
- [ ] `.github/workflows/ci-cd.yml` валиден
- [ ] `permissions` настроены для OIDC (если используется)
- [ ] Все steps правильно настроены

**Проверка:**
- Workflow должен проходить валидацию в GitHub Actions
- Secret Scanning должен проходить успешно

#### ✅ Build проходит успешно
- [ ] Build and Test job проходит без ошибок
- [ ] TypeScript компилируется
- [ ] Нет ошибок в логах

---

### 4. Testing (опционально, но рекомендуется)

#### ✅ Локальное тестирование
- [ ] Backend запускается локально
- [ ] API endpoints отвечают
- [ ] Подключение к DynamoDB работает (если тестируете локально)

**Проверка:**
```bash
cd src/backend
npm run dev
curl http://localhost:3000/health
```

---

## 🚀 ПРОЦЕСС ДЕПЛОЯ

### Шаг 1: Проверка готовности
```bash
# Проверить все чеклисты выше
# Убедиться, что все готово
```

### Шаг 2: Push в main branch
```bash
git push origin main
```

### Шаг 3: Мониторинг деплоя
1. Перейдите в GitHub Actions: https://github.com/recreomassage-hub/flowlogic.shop/actions
2. Откройте последний workflow run
3. Проверьте job "Deploy to Production"

### Шаг 4: Проверка после деплоя
```bash
# Получить endpoint URL
cd infra/serverless
npx serverless info --stage production

# Проверить health endpoint
curl https://YOUR_API_GATEWAY_URL/production/health

# Проверить root endpoint
curl https://YOUR_API_GATEWAY_URL/production/
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Backend
- [ ] API Gateway endpoint accessible
- [ ] Health check endpoint returns `200 OK`
- [ ] DynamoDB tables created
- [ ] S3 bucket created and accessible
- [ ] Cognito User Pool configured
- [ ] CloudWatch logs working

### Testing
- [ ] API endpoints respond correctly
- [ ] Authentication flow working
- [ ] Database operations working
- [ ] S3 upload/download working

---

## 🔍 TROUBLESHOOTING

### Ошибка: "AWS provider credentials not found"
**Решение:**
- Проверьте, что `AWS_ROLE_ARN` или `AWS_ACCESS_KEY_ID_PROD` + `AWS_SECRET_ACCESS_KEY_PROD` добавлены в GitHub Secrets
- Убедитесь, что IAM Role/User имеет правильные permissions
- См. `docs/deployment/troubleshooting/aws_credentials.md`

### Ошибка: "Cannot resolve variable at provider.environment.NODE_ENV"
**Решение:**
- Проверьте, что в `serverless.yml` есть ключ `production` в `custom.nodeEnv`
- Убедитесь, что используется правильный stage: `--stage production`

### Ошибка: "Parameter not found" (SSM)
**Решение:**
```bash
# Проверьте существование параметра
aws ssm get-parameter --name /flowlogic/production/stripe/secret-key

# Если не существует, создайте:
aws ssm put-parameter \
  --name /flowlogic/production/stripe/secret-key \
  --value "YOUR_STRIPE_SECRET_KEY" \
  --type SecureString
```

### Ошибка: "User Pool not found" (Cognito)
**Решение:**
- Проверьте, что Cognito User Pool создан для production
- Убедитесь, что SSM параметры содержат правильные ID

### Ошибка: "Access Denied"
**Решение:**
1. Проверьте IAM права пользователя/роли
2. Проверьте, что Access Keys правильные
3. Проверьте политики IAM

---

## 📊 После успешного деплоя

### 1. Получить API Gateway URL
```bash
cd infra/serverless
npx serverless info --stage production
```

### 2. Обновить frontend конфигурацию
- Обновите `VITE_API_URL` в frontend `.env` или GitHub Secrets
- Убедитесь, что frontend использует правильный API URL

### 3. Тестирование endpoints
```bash
# Health check
curl https://YOUR_API_GATEWAY_URL/production/health

# Root endpoint
curl https://YOUR_API_GATEWAY_URL/production/

# Registration (пример)
curl -X POST https://YOUR_API_GATEWAY_URL/production/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "wellness_disclaimer_accepted": true
  }'
```

### 4. Мониторинг
- Проверьте CloudWatch Logs для Lambda функций
- Проверьте API Gateway metrics
- Проверьте DynamoDB таблицы

### 5. Обновление Stripe ключа (если нужно)

Когда будет готов реальный Stripe ключ:

```bash
# Обновление SSM параметра
aws ssm put-parameter \
  --name /flowlogic/production/stripe/secret-key \
  --value "YOUR_STRIPE_LIVE_SECRET_KEY" \
  --type SecureString \
  --overwrite

# Передеплой Lambda (чтобы подхватить новый ключ)
cd infra/serverless
npx serverless deploy function -f api --stage production
```

---

## 📚 Дополнительные ресурсы

- **Troubleshooting:** `docs/deployment/troubleshooting/aws_credentials.md` - Диагностика проблем
- **IAM Setup:** `docs/deployment/aws_iam_setup.md` - Настройка IAM
- **Credentials Setup:** `docs/deployment/aws_credentials_setup.md` - Настройка Access Keys
- **OIDC Setup:** `docs/deployment/aws_oidc_setup.md` - Настройка OIDC
- [AWS Serverless Framework Docs](https://www.serverless.com/framework/docs/providers/aws)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## ✅ Готовность к деплою

После прохождения всех чеклистов:
1. ✅ Все настроено
2. ✅ Все проверено
3. ✅ Готово к деплою

**Следующий шаг:** `git push origin main` и мониторинг workflow в GitHub Actions.

---

**Последнее обновление:** 2025-12-26
