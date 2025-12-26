# ✅ Deployment Checklist — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-23  
**Для:** DevOps Engineers

---

## 📋 Pre-Deployment Checklist

### 1. AWS Configuration

- [ ] AWS CLI установлен и настроен
  ```bash
  aws --version
  aws sts get-caller-identity
  ```

- [ ] IAM пользователь создан (`flowlogic-cicd-user`)
  ```bash
  aws iam get-user --user-name flowlogic-cicd-user
  ```

- [ ] IAM политика прикреплена
  ```bash
  aws iam list-attached-user-policies --user-name flowlogic-cicd-user
  ```

- [ ] Access Keys созданы и добавлены в GitHub Secrets
  - `AWS_ACCESS_KEY_ID_DEV`
  - `AWS_SECRET_ACCESS_KEY_DEV`

---

### 2. SSM Parameters

- [ ] Cognito User Pool ID
  ```bash
  aws ssm get-parameter --name /flowlogic/dev/cognito/user-pool-id
  ```

- [ ] Cognito Client ID
  ```bash
  aws ssm get-parameter --name /flowlogic/dev/cognito/client-id
  ```

- [ ] Stripe Secret Key
  ```bash
  aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key
  ```
  ⚠️ **Текущее значение:** `sk_test_placeholder` (заглушка для теста)

---

### 3. Serverless Framework

- [ ] Serverless Framework установлен
  ```bash
  serverless --version
  ```

- [ ] Зависимости установлены
  ```bash
  cd infra/serverless
  npm install
  ```

---

### 4. Configuration Files

- [ ] `serverless.yml` настроен корректно
- [ ] Все переменные окружения указаны
- [ ] IAM роли настроены

---

## 🚀 Deployment Steps

### Step 1: Проверка конфигурации

```bash
cd infra/serverless

# Проверка синтаксиса
serverless print --stage dev

# Проверка переменных
serverless print --stage dev | grep -E "STRIPE_SECRET_KEY|COGNITO"
```

### Step 2: Деплой

```bash
# Деплой в dev окружение
serverless deploy --stage dev

# Или с указанием региона
serverless deploy --stage dev --region us-east-1
```

### Step 3: Проверка деплоя

```bash
# Получение информации о деплое
serverless info --stage dev

# Проверка health endpoint
API_URL=$(serverless info --stage dev | grep "endpoints:" | awk '{print $2}')
curl $API_URL/health
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

### Testing

- [ ] API endpoints respond correctly
- [ ] Authentication flow working
- [ ] Database operations working
- [ ] S3 upload/download working

---

## 🔄 После успешного деплоя

### Обновление Stripe ключа

Когда будет готов реальный Stripe ключ:

```bash
# Обновление SSM параметра
aws ssm put-parameter \
  --name /flowlogic/dev/stripe/secret-key \
  --value "sk_test_ваш_реальный_ключ" \
  --type SecureString \
  --overwrite

# Передеплой Lambda (чтобы подхватить новый ключ)
cd infra/serverless
serverless deploy function -f api --stage dev
```

---

## 🐛 Troubleshooting

### Проблема: "Parameter not found"

**Решение:**
```bash
# Проверьте существование параметра
aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key

# Если не существует, создайте:
aws ssm put-parameter \
  --name /flowlogic/dev/stripe/secret-key \
  --value "sk_test_placeholder" \
  --type SecureString
```

### Проблема: "Access Denied"

**Решение:**
1. Проверьте IAM права пользователя
2. Проверьте, что Access Keys правильные
3. Проверьте политики IAM

---

## 📚 Дополнительные ресурсы

- [IAM Setup](docs/infrastructure/iam_setup.md)
- [Stripe Setup](docs/infrastructure/stripe_setup.md)
- [Deployment Guide](docs/deployment_guide.md)

---

**Обновлено:** 2025-12-23




