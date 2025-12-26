# 🤖 Быстрая настройка агентов

**Для:** Orchestrator, GFC (Git Flow Controller), DS (Deploy Supervisor)

---

## ⚡ Быстрый старт (2 минуты)

### 1. Создайте .env файл

```bash
cp .env.example .env
```

### 2. Добавьте GitHub токен

Откройте `.env` и добавьте ваш токен:

```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO=recreomassage-hub/flowlogic.shop
```

### 3. Проверьте подключение

#### Python (PyGithub)

```bash
python3 -c "
import os
from github import Github
token = os.getenv('GITHUB_TOKEN')
if not token:
    print('❌ GITHUB_TOKEN не установлен')
    exit(1)
g = Github(token)
repo = g.get_repo('recreomassage-hub/flowlogic.shop')
print(f'✅ Подключено: {repo.full_name}')
"
```

#### Node.js (Octokit)

```bash
node -e "
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
octokit.repos.get({ owner: 'recreomassage-hub', repo: 'flowlogic.shop' })
  .then(({ data }) => console.log('✅ Подключено:', data.full_name))
  .catch(err => console.error('❌ Ошибка:', err.message));
"
```

---

## ⚠️ ВАЖНО: Безопасность

1. **НИКОГДА не коммитьте .env файл**
   - ✅ `.env` уже в `.gitignore`
   - ✅ Используйте только `.env.example` как шаблон

2. **Токен должен быть защищен**
   - Храните только в `.env` (локально)
   - Для CI/CD используйте GitHub Secrets
   - Для production используйте AWS SSM Parameter Store

---

## 📚 Полная документация

- **GitHub Token Setup:** [docs/agents/github_token_setup.md](docs/agents/github_token_setup.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Обновлено:** 2025-12-23


