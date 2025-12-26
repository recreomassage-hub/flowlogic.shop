# 🔐 Secrets Management — Flow Logic

Документация по управлению секретами и переменными окружения для Flow Logic платформы.

## Иерархия хранения секретов

### 1. Production (AWS Systems Manager Parameter Store)

**Использование:** Production и Staging окружения

**Формат:**
```
/flowlogic/{stage}/{service}/{key}
```

**Примеры:**
- `/flowlogic/prod/cognito/user-pool-id`
- `/flowlogic/prod/stripe/secret-key`
- `/flowlogic/staging/cognito/user-pool-id`

**Установка секрета:**
```bash
# String parameter
aws ssm put-parameter \
  --name /flowlogic/prod/cognito/user-pool-id \
  --value "us-east-1_XXXXXXXXX" \
  --type String \
  --region us-east-1

# SecureString (для секретных значений)
aws ssm put-parameter \
  --name /flowlogic/prod/stripe/secret-key \
  --value "sk_live_..." \
  --type SecureString \
  --region us-east-1
```

**Использование в Serverless Framework:**
```yaml
environment:
  COGNITO_USER_POOL_ID: ${ssm:/flowlogic/${self:provider.stage}/cognito/user-pool-id}
  STRIPE_SECRET_KEY: ${ssm:/flowlogic/${self:provider.stage}/stripe/secret-key~true}
```

---

### 2. CI/CD (GitHub Secrets)

**Использование:** GitHub Actions workflows

**Необходимые секреты:**

**Backend:**
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`

**Frontend:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_URL_STAGING`

**Установка:**
1. Перейти в Settings → Secrets and variables → Actions
2. Добавить новый secret
3. Указать имя и значение

---

### 3. Локальная разработка (.env файлы)

**Использование:** Локальная разработка

**Файлы:**
- `src/backend/.env` (не коммитится)
- `src/frontend/.env` (не коммитится)

**Шаблоны:**
- `src/backend/.env.example` (коммитится)
- `src/frontend/.env.example` (коммитится)

**Создание:**
```bash
# Backend
cd src/backend
cp .env.example .env
# Отредактировать .env с реальными значениями

# Frontend
cd src/frontend
cp .env.example .env
# Отредактировать .env с реальными значениями
```

---

## Список всех секретов

### Backend Secrets

| Secret | Описание | Где хранится | Пример |
|--------|----------|--------------|--------|
| `COGNITO_USER_POOL_ID` | AWS Cognito User Pool ID | SSM / .env | `us-east-1_XXXXXXXXX` |
| `COGNITO_CLIENT_ID` | AWS Cognito Client ID | SSM / .env | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | SSM / .env | `sk_test_...` или `sk_live_...` |
| `AWS_REGION` | AWS Region | Environment | `us-east-1` |
| `STAGE` | Deployment stage | Environment | `dev`, `staging`, `prod` |

### Frontend Secrets

| Secret | Описание | Где хранится | Пример |
|--------|----------|--------------|--------|
| `VITE_API_URL` | API Base URL | Vercel Env / .env | `https://api.flowlogic.shop/v1` |

### CI/CD Secrets

| Secret | Описание | Где хранится |
|--------|----------|--------------|
| `AWS_ACCESS_KEY_ID_*` | AWS Access Key для деплоя | GitHub Secrets |
| `AWS_SECRET_ACCESS_KEY_*` | AWS Secret Key для деплоя | GitHub Secrets |
| `VERCEL_TOKEN` | Vercel API Token | GitHub Secrets |
| `VERCEL_ORG_ID` | Vercel Organization ID | GitHub Secrets |
| `VERCEL_PROJECT_ID` | Vercel Project ID | GitHub Secrets |

---

## Безопасность

### ✅ Правила

1. **Никогда не коммитить:**
   - `.env` файлы
   - Реальные секреты в код
   - AWS credentials в код

2. **Всегда коммитить:**
   - `.env.example` файлы (без реальных значений)
   - Документацию по секретам

3. **Использовать:**
   - AWS SSM Parameter Store для production
   - GitHub Secrets для CI/CD
   - `.env` файлы только для локальной разработки

4. **Ротация секретов:**
   - Регулярно ротировать AWS credentials
   - Регулярно ротировать Stripe keys
   - Мониторить использование секретов

---

## Troubleshooting

### Проблема: Secret not found

**Решение:**
1. Проверить, что secret установлен в правильном месте
2. Проверить права доступа (IAM roles, GitHub permissions)
3. Проверить формат имени secret

### Проблема: Secret не загружается в Lambda

**Решение:**
1. Проверить SSM parameter существует
2. Проверить IAM роль Lambda имеет права на чтение SSM
3. Проверить синтаксис в serverless.yml

---

## Миграция секретов

### Из .env в SSM

```bash
# Читать из .env
source src/backend/.env

# Установить в SSM
aws ssm put-parameter \
  --name /flowlogic/prod/cognito/user-pool-id \
  --value "$COGNITO_USER_POOL_ID" \
  --type String \
  --overwrite
```

### Из SSM в .env (для локальной разработки)

```bash
# Получить из SSM
COGNITO_USER_POOL_ID=$(aws ssm get-parameter \
  --name /flowlogic/dev/cognito/user-pool-id \
  --query 'Parameter.Value' \
  --output text)

# Добавить в .env
echo "COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID" >> src/backend/.env
```



