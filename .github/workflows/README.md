# GitHub Actions Workflows

Автоматический CI/CD для Flow Logic Platform.

## Workflows

### 1. `backend-deploy.yml` - Backend Deployment

Автоматический деплой backend через Serverless Framework.

**Триггеры:**
- Push в `develop` → деплой на `dev`
- Push в `main` → деплой на `staging` и `production`
- Manual dispatch (workflow_dispatch)

**Что делает:**
1. Проверяет код
2. Устанавливает Node.js 20
3. Устанавливает Serverless Framework
4. Устанавливает зависимости
5. Настраивает AWS credentials
6. Деплоит через `serverless deploy`
7. Запускает smoke tests (health endpoint)

### 2. `frontend-deploy.yml` - Frontend Deployment

Автоматический деплой frontend через Vercel.

**Триггеры:**
- Push в `develop` → деплой preview
- Push в `main` → деплой production
- Manual dispatch

**Что делает:**
1. Проверяет код
2. Устанавливает Node.js 20
3. Устанавливает Vercel CLI
4. Pull environment variables из Vercel
5. Собирает проект
6. Деплоит на Vercel

## Настройка GitHub Secrets

### Backend Secrets

Перейдите в **Settings → Secrets and variables → Actions → New repository secret** и добавьте:

#### Dev окружение:
- `AWS_ACCESS_KEY_ID_DEV` - AWS Access Key для dev окружения
- `AWS_SECRET_ACCESS_KEY_DEV` - AWS Secret Key для dev окружения

#### Staging окружение:
- `AWS_ACCESS_KEY_ID_STAGING` - AWS Access Key для staging окружения
- `AWS_SECRET_ACCESS_KEY_STAGING` - AWS Secret Key для staging окружения

#### Production окружение:
- `AWS_ACCESS_KEY_ID_PROD` - AWS Access Key для production окружения
- `AWS_SECRET_ACCESS_KEY_PROD` - AWS Secret Key для production окружения

### Frontend Secrets

#### Vercel:
- `VERCEL_TOKEN` - Vercel API Token (получить в Vercel Dashboard → Settings → Tokens)
- `VERCEL_ORG_ID` - Vercel Organization ID (получить в Vercel Dashboard → Settings → General)
- `VERCEL_PROJECT_ID` - Vercel Project ID (получить в Vercel Dashboard → Project Settings → General)

### Создание AWS Access Keys

1. Перейдите в AWS Console → IAM → Users
2. Создайте пользователя (или используйте существующего)
3. Прикрепите политику с правами на деплой (или используйте `flowlogic-github-actions-role`)
4. Создайте Access Key в Security credentials
5. Скопируйте Access Key ID и Secret Access Key
6. Добавьте в GitHub Secrets

**⚠️ ВАЖНО:** Не коммитьте Access Keys в код! Только через GitHub Secrets.

## GitHub Environments

Workflows используют GitHub Environments для управления деплоями:

- **dev** - Development окружение (автодеплой из `develop`)
- **staging** - Staging окружение (автодеплой из `main`)
- **production** - Production окружение (автодеплой из `main`, может требовать approval)

Настройка approval для production:
1. Перейдите в Settings → Environments
2. Создайте environment `production`
3. Включите "Required reviewers" (опционально)

## Проверка работы

После настройки secrets, workflows должны автоматически запускаться при push.

Проверить статус:
1. Перейдите в Actions tab в GitHub
2. Найдите workflow run
3. Проверьте логи

## Troubleshooting

### Ошибка: "AWS credentials not found"
- Проверьте, что secrets добавлены в GitHub Settings
- Проверьте правильность имен secrets (должны совпадать точно)

### Ошибка: "Vercel token invalid"
- Проверьте, что `VERCEL_TOKEN` правильный
- Получите новый token в Vercel Dashboard

### Ошибка: "Serverless deploy failed"
- Проверьте AWS credentials
- Проверьте SSM параметры в AWS
- Проверьте CloudWatch Logs для деталей

### Smoke test failed
- Проверьте, что Lambda функция деплоится корректно
- Проверьте API Gateway endpoint
- Проверьте health endpoint в Lambda logs




