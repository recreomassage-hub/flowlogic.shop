# 🔐 GitHub Actions Secrets - Настройка и использование

**Дата:** 2025-12-26  
**Для:** CI/CD workflows, агенты (Orchestrator, GFC, DS)

---

## 📋 Обзор

GitHub Actions workflows используют секреты для безопасной работы с внешними сервисами и API.

---

## 🔑 Настройка секретов

### Шаг 1: Добавление секрета в GitHub

1. Перейдите в настройки репозитория:
   ```
   https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions
   ```

2. Нажмите "New repository secret"

3. Заполните:
   - **Name:** `GITHUB_TOKEN` (или `MY_GITHUB_TOKEN`)
   - **Secret:** Ваш GitHub Personal Access Token (начинается с `ghp_`)

4. Нажмите "Add secret"

---

## 📝 Использование в Workflows

### Базовый пример

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Use GitHub token
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "Using GitHub token for authentication"
          # Токен доступен через переменную окружения
          curl -H "Authorization: token $GITHUB_TOKEN" \
               https://api.github.com/user
```

### Python агенты (PyGithub)

```yaml
jobs:
  agent-workflow:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install PyGithub
      
      - name: Agent operations
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python3 << 'EOF'
          import os
          from github import Github
          
          token = os.getenv('GITHUB_TOKEN')
          g = Github(token)
          repo = g.get_repo("recreomassage-hub/flowlogic.shop")
          print(f"✅ Connected: {repo.full_name}")
          EOF
```

### Node.js агенты (Octokit)

```yaml
jobs:
  agent-workflow:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install @octokit/rest
      
      - name: Agent operations
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          node << 'EOF'
          const { Octokit } = require('@octokit/rest');
          const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
          });
          
          octokit.repos.get({
            owner: 'recreomassage-hub',
            repo: 'flowlogic.shop'
          }).then(({ data }) => {
            console.log(`✅ Connected: ${data.full_name}`);
          });
          EOF
```

---

## 🔒 Безопасность

### ✅ Правила использования

1. **НИКОГДА не логируйте секреты:**
   ```yaml
   # ❌ НЕПРАВИЛЬНО
   run: echo "Token: ${{ secrets.GITHUB_TOKEN }}"
   
   # ✅ ПРАВИЛЬНО
   run: echo "Token configured (hidden)"
   ```

2. **Используйте переменные окружения:**
   ```yaml
   # ✅ ПРАВИЛЬНО
   env:
     GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   run: |
     python3 script.py  # Токен доступен через os.getenv()
   ```

3. **Ограничивайте доступ:**
   - Используйте `environment` для production секретов
   - Настраивайте `permissions` для минимальных прав

### ⚠️ Автоматический GITHUB_TOKEN

GitHub Actions автоматически предоставляет `GITHUB_TOKEN`:
- **Не требует настройки** - доступен автоматически
- **Ограниченные права** - только для текущего репозитория
- **Для агентов нужен пользовательский токен** с расширенными правами

---

## 📊 Доступные секреты в проекте

### Обязательные секреты

| Секрет | Описание | Использование |
|--------|----------|---------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Агенты, GitHub API |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | Deploy backend (Serverless) |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | Deploy backend (Serverless) |
| `VERCEL_TOKEN` | Vercel Deploy Token | Deploy frontend |
| `VERCEL_ORG_ID` | Vercel Organization ID | Deploy frontend |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Deploy frontend |

### Опциональные секреты

| Секрет | Описание | Использование |
|--------|----------|---------------|
| `VITE_API_URL` | Frontend API URL | Build frontend |
| `STRIPE_SECRET_KEY` | Stripe API Key | Payment processing |
| `COGNITO_USER_POOL_ID` | AWS Cognito Pool ID | Authentication |

---

## 🧪 Тестирование секретов

### Проверка в workflow

```yaml
- name: Test GitHub token
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    if [ -z "$GITHUB_TOKEN" ]; then
      echo "❌ GITHUB_TOKEN not set"
      exit 1
    fi
    
    # Проверка формата
    if [[ ! "$GITHUB_TOKEN" =~ ^ghp_ ]]; then
      echo "⚠️  Token format incorrect"
      exit 1
    fi
    
    echo "✅ Token configured (format: ${GITHUB_TOKEN:0:7}...)"
```

### Локальная проверка (через GitHub CLI)

```bash
# Установить GitHub CLI
# https://cli.github.com/

# Авторизация
gh auth login

# Проверка секретов
gh secret list

# Проверка конкретного секрета (только наличие, не значение)
gh secret list | grep GITHUB_TOKEN
```

---

## 🔄 Обновление секретов

### Через GitHub UI

1. Settings → Secrets and variables → Actions
2. Нажмите на секрет
3. "Update" → Введите новое значение
4. "Update secret"

### Через GitHub CLI

```bash
# Установить секрет
gh secret set GITHUB_TOKEN --body "ghp_новый_токен"

# Удалить секрет
gh secret delete GITHUB_TOKEN

# Список секретов
gh secret list
```

---

## 📚 Дополнительные ресурсы

- [GitHub Actions: Using secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub CLI: Managing secrets](https://cli.github.com/manual/gh_secret)
- [GitHub Token Setup](docs/agents/github_token_setup.md)
- [Security Policies](docs/security/policies.md)

---

**Обновлено:** 2025-12-26  
**Версия:** 1.0





