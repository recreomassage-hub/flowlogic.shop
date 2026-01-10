# 💻 Локальная разработка - Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-27  
**Для:** Разработчики

---

## 📋 PREREQUISITES

### Required Tools

- **Node.js** 20+ (рекомендуется 22+)
- **npm** или **yarn**
- **Git**
- **AWS CLI** (для работы с AWS сервисами локально)
- **Docker** (опционально, для локальных сервисов)

### Required Accounts

- **AWS Account** (для доступа к DynamoDB, S3, Cognito)
- **GitHub Account** (для доступа к репозиторию)

---

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Клонирование репозитория

```bash
git clone https://github.com/recreomassage-hub/flowlogic.shop.git
cd flowlogic.shop
```

### 2. Установка зависимостей

```bash
# Backend
cd src/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Настройка окружения

**Backend:**
```bash
cd src/backend
cp .env.example .env
# Отредактируйте .env с вашими AWS credentials и настройками
```

**Frontend:**
```bash
cd src/frontend
cp .env.example .env.local
# Отредактируйте .env.local с API URL
```

### 4. Запуск локально

**Backend:**
```bash
cd src/backend
npm run dev
# Backend запустится на http://localhost:3001
```

**Frontend:**
```bash
cd src/frontend
npm run dev
# Frontend запустится на http://localhost:3000
```

---

## 🔧 НАСТРОЙКА ОКРУЖЕНИЯ

### Backend Environment Variables

Создайте файл `src/backend/.env`:

```env
# AWS Configuration
AWS_REGION=us-east-1
STAGE=dev

# DynamoDB Tables
DYNAMODB_USERS_TABLE=flowlogic-dev-users
DYNAMODB_SUBSCRIPTIONS_TABLE=flowlogic-dev-subscriptions
DYNAMODB_ASSESSMENTS_TABLE=flowlogic-dev-assessments
DYNAMODB_PLANS_TABLE=flowlogic-dev-plans
DYNAMODB_CALENDAR_TASKS_TABLE=flowlogic-dev-calendar-tasks
DYNAMODB_PROGRESS_TABLE=flowlogic-dev-progress
DYNAMODB_USER_LIMITS_TABLE=flowlogic-dev-user-limits
DYNAMODB_MIGRATIONS_TABLE=flowlogic-dev-migrations

# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# AWS S3
S3_BUCKET=flowlogic-dev-videos

# Stripe
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXX

# Frontend URL (для CORS)
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**⚠️ ВАЖНО:** Не коммитьте `.env` файлы! Они уже в `.gitignore`.

### Frontend Environment Variables

Создайте файл `src/frontend/.env.local`:

```env
# API URL для локальной разработки
VITE_API_URL=http://localhost:3001

# Или используйте dev endpoint на AWS
# VITE_API_URL=https://t1p7ii26f5.execute-api.us-east-1.amazonaws.com/dev
```

---

## 🗄️ ЛОКАЛЬНАЯ БАЗА ДАННЫХ

### Вариант 1: DynamoDB Local (Docker)

**Запуск DynamoDB Local:**
```bash
docker run -d -p 8000:8000 \
  --name dynamodb-local \
  amazon/dynamodb-local:latest
```

**Настройка AWS CLI для локального DynamoDB:**
```bash
# В .env файле backend
DYNAMODB_ENDPOINT=http://localhost:8000
```

**Создание таблиц:**
```bash
cd infra/serverless
# Используйте Serverless Framework для создания таблиц локально
npx serverless dynamodb install
npx serverless dynamodb start
```

### Вариант 2: Использование AWS Dev окружения

**Использование реального AWS Dev окружения:**
- Настройте AWS credentials: `aws configure`
- Используйте dev таблицы в AWS
- Убедитесь, что у вас есть доступ к dev окружению

---

## 🧪 ТЕСТИРОВАНИЕ

### Unit Tests

```bash
# Backend
cd src/backend
npm test

# Frontend
cd src/frontend
npm test
```

### Integration Tests

```bash
# Backend
cd src/backend
npm run test:integration
```

### E2E Tests

```bash
# Требуется запущенный backend и frontend
npm run test:e2e
```

### Smoke Tests

```bash
# Проверка production/staging/dev окружения
./scripts/smoke_tests.sh production
./scripts/smoke_tests.sh staging
./scripts/smoke_tests.sh dev
```

---

## 🔐 БЕЗОПАСНОСТЬ

### ⚠️ КРИТИЧЕСКИ ВАЖНО

**НЕ коммитьте:**
- `.env` файлы
- AWS credentials
- API keys
- Tokens
- Private keys
- `awscliv2.zip` и другие артефакты AWS CLI

**Используйте:**
- GitHub Secrets для CI/CD
- AWS SSM Parameter Store для production
- `.env.example` файлы для документирования переменных

### Pre-commit проверка

Скрипт `scripts/pre-commit-secrets-check.sh` автоматически проверяет на секреты перед коммитом.

**Настройка pre-commit hook:**
```bash
# Создать symlink
ln -s ../../scripts/pre-commit-secrets-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 🐛 TROUBLESHOOTING

### Проблема: Backend не запускается

**Решение:**
1. Проверьте, что все зависимости установлены: `npm install`
2. Проверьте `.env` файл на наличие всех переменных
3. Проверьте AWS credentials: `aws sts get-caller-identity`
4. Проверьте логи: `npm run dev` покажет ошибки

### Проблема: Frontend не может подключиться к backend

**Решение:**
1. Проверьте, что backend запущен на `http://localhost:3001`
2. Проверьте `VITE_API_URL` в `.env.local`
3. Проверьте CORS настройки в backend
4. Проверьте Network tab в браузере для ошибок

### Проблема: DynamoDB таблицы не найдены

**Решение:**
1. Если используете DynamoDB Local - убедитесь, что он запущен
2. Если используете AWS - проверьте credentials и регион
3. Создайте таблицы вручную или через Serverless Framework

---

## 📚 СМ. ТАКЖЕ

- `docs/developer_guide.md` - Полное руководство для разработчиков
- `docs/troubleshooting.md` - Решение проблем
- `docs/deployment_guide.md` - Deployment процесс
- `README.md` - Общая информация о проекте

---

**Последнее обновление:** 2025-12-27





