# 🔐 Места хранения секретов проекта Flow Logic

**Дата создания:** 2025-12-26  
**Цель:** Полный список всех мест, где хранятся секреты проекта

---

## 📋 ОСНОВНЫЕ МЕСТА ХРАНЕНИЯ

### 1. **GitHub Secrets** (НЕ в репозитории)

**Где:** GitHub Repository Settings → Secrets and variables → Actions

**Секреты:**
- `AWS_ACCESS_KEY_ID_PROD` - AWS Access Key для production
- `AWS_SECRET_ACCESS_KEY_PROD` - AWS Secret Key для production
- `AWS_ACCESS_KEY_ID_DEV` - AWS Access Key для dev
- `AWS_SECRET_ACCESS_KEY_DEV` - AWS Secret Key для dev
- `AWS_ACCESS_KEY_ID_STAGING` - AWS Access Key для staging
- `AWS_SECRET_ACCESS_KEY_STAGING` - AWS Secret Key для staging
- `AWS_ROLE_ARN` - ARN роли для OIDC (опционально)
- `VERCEL_TOKEN` - Токен Vercel для деплоя frontend
- `VERCEL_ORG_ID` - ID организации Vercel
- `VERCEL_PROJECT_ID` - ID проекта Vercel
- `MY_GITHUB_TOKEN` - GitHub Personal Access Token (опционально)
- `GITHUB_TOKEN` - Автоматический токен GitHub Actions (доступен по умолчанию)
- `VITE_API_URL` - URL API для frontend (опционально)

**Используются в:**
- `.github/workflows/ci-cd.yml`
- `.github/workflows/test-github-token.yml`

**Проверка:**
```bash
# Вариант 1: Через веб-интерфейс (РЕКОМЕНДУЕТСЯ)
# Перейти по ссылке ниже и проверить вручную

# Вариант 2: Через GitHub CLI (если установлен)
gh secret list

# Вариант 3: Через GitHub API (требует токен)
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/recreomassage-hub/flowlogic.shop/actions/secrets
```

**Ссылка (веб-интерфейс):**
https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions

**Установка GitHub CLI (опционально):**
```bash
# Ubuntu/Debian
sudo apt install gh

# Или через snap
sudo snap install gh

# После установки
gh auth login
```

---

### 2. **AWS SSM Parameter Store** (НЕ в репозитории)

**Где:** AWS Systems Manager → Parameter Store

**Параметры:**
- `/flowlogic/dev/cognito/user-pool-id`
- `/flowlogic/dev/cognito/client-id`
- `/flowlogic/dev/stripe/secret-key`
- `/flowlogic/staging/cognito/user-pool-id`
- `/flowlogic/staging/cognito/client-id`
- `/flowlogic/staging/stripe/secret-key`
- `/flowlogic/production/cognito/user-pool-id`
- `/flowlogic/production/cognito/client-id`
- `/flowlogic/production/stripe/secret-key`

**Используются в:**
- `infra/serverless/serverless.yml` (через `${ssm:...}`)

**Проверка:**
```bash
# Проверить параметры
./llmos check-ssm
# или
./scripts/check_ssm_params.sh
```

**Документация:**
- `docs/deployment/aws_ssm_setup.md` (если есть)
- `scripts/check_ssm_params.sh`

---

### 3. **Локальные .env файлы** (НЕ в репозитории)

**Где:** Локально на машине разработчика

**Файлы (в .gitignore):**
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `.env.*.local`

**Содержимое:**
- AWS credentials (локальная разработка)
- Stripe keys (локальная разработка)
- Database URLs (локальная разработка)
- Другие локальные секреты

**Проверка:**
```bash
# Проверить наличие .env файлов
find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*"
```

---

### 4. **Config файлы** (НЕ в репозитории)

**Где:** 
- `/config` (корневая директория, SSH config)
- `src/backend/config/` (может содержать локальные конфиги)
- `src/frontend/config/` (может содержать локальные конфиги)

**В .gitignore:**
- `/config` - исключена корневая директория
- `src/**/config/` - НЕ исключены (могут быть в репозитории, но без секретов)

**Проверка:**
```bash
# Проверить config файлы
find . -path "./config" -o -path "*/config/*" | grep -v node_modules | grep -v .git
```

---

### 5. **Serverless Build Artifacts** (НЕ в репозитории)

**Где:** `infra/serverless/.serverless/`

**Содержимое:**
- Скомпилированные артефакты
- Могут содержать временные секреты из SSM

**В .gitignore:**
- `.serverless/`

**Проверка:**
```bash
# Проверить наличие артефактов
ls -la infra/serverless/.serverless/ 2>/dev/null || echo "Артефакты не найдены"
```

---

### 6. **AWS IAM Roles и Policies** (НЕ в репозитории)

**Где:** AWS IAM Console

**Содержимое:**
- IAM Role для Lambda функций
- IAM Role для GitHub Actions (OIDC)
- IAM Policies с permissions

**Используются в:**
- `infra/serverless/serverless.yml` (IAM role для Lambda)
- `.github/workflows/ci-cd.yml` (IAM role для GitHub Actions)

**Проверка:**
```bash
# Требует AWS CLI и credentials
aws iam list-roles --query "Roles[?contains(RoleName, 'flowlogic')]"
```

---

### 7. **Vercel Environment Variables** (НЕ в репозитории)

**Где:** Vercel Dashboard → Project Settings → Environment Variables

**Содержимое:**
- `VITE_API_URL` - URL API
- Другие переменные окружения для frontend

**Используются в:**
- `.github/workflows/ci-cd.yml` (через Vercel CLI)

**Проверка:**
```bash
# Требует Vercel CLI
vercel env ls
```

---

## ⚠️ МЕСТА, ГДЕ СЕКРЕТЫ НЕ ДОЛЖНЫ БЫТЬ

### ❌ В репозитории (проверено через gitleaks):

- ✅ `.env` файлы - в .gitignore
- ✅ `config/` - в .gitignore
- ✅ `.serverless/` - в .gitignore
- ✅ `aws/dist/` - в .gitignore
- ✅ SSH keys (`*.pem`, `*.key`, `id_*`) - в .gitignore

### ✅ Документация (только placeholders):

- `docs/deployment/aws_credentials_setup.md` - только форматы, без реальных ключей
- `docs/deployment/aws_oidc_setup.md` - только примеры ARN
- `docs/deployment/aws_iam_setup.md` - только структура policies

---

## 🔍 ПРОВЕРКА СЕКРЕТОВ

### Автоматическая проверка:

```bash
# Pre-commit проверка
./scripts/pre-commit-secrets-check.sh

# GitHub Actions проверка
# Автоматически при каждом push через .github/workflows/secret-scanning.yml
```

### Ручная проверка:

```bash
# Проверить SSM параметры
./llmos check-ssm

# Проверить GitHub Secrets (через веб-интерфейс)
# https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions
# Или через GitHub CLI (если установлен):
# gh secret list

# Проверить .env файлы
find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*"

# Проверить config файлы
find . -path "./config" -o -path "*/config/*" | grep -v node_modules | grep -v .git

# Проверить наличие секретов в коде (gitleaks)
# Автоматически при каждом push через .github/workflows/secret-scanning.yml
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- **Secret Rotation:** `docs/security/troubleshooting/secret_rotation_required.md`
- **GitHub Token Rotation:** `docs/security/troubleshooting/github_token_rotation_required.md`
- **AWS Credentials Setup:** `docs/deployment/aws_credentials_setup.md`
- **AWS OIDC Setup:** `docs/deployment/aws_oidc_setup.md`
- **Pre-commit Check:** `scripts/pre-commit-secrets-check.sh`

---

## 🎯 ИТОГОВАЯ ТАБЛИЦА

| Место | Тип | Доступ | Проверка |
|-------|-----|--------|----------|
| GitHub Secrets | Cloud | GitHub UI | `gh secret list` |
| AWS SSM | Cloud | AWS Console | `./llmos check-ssm` |
| .env файлы | Локально | Файловая система | `find . -name ".env*"` |
| Config файлы | Локально | Файловая система | `find . -path "./config"` |
| Serverless artifacts | Локально | `.serverless/` | `ls .serverless/` |
| AWS IAM | Cloud | AWS Console | AWS CLI |
| Vercel Env | Cloud | Vercel Dashboard | `vercel env ls` |

---

**Последнее обновление:** 2025-12-26

