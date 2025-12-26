# 🔒 GitHub Token Security - Критическая проблема

## ⚠️ ПРОБЛЕМА

GitHub Personal Access Token был найден в коммите и отозван GitHub.

**Дата обнаружения:** 2025-12-26  
**Токен:** `ghp_REVOKED_TOKEN_EXAMPLE` (отозван, пример)

---

## ✅ ИСПРАВЛЕНИЯ

### 1. Токен удален из файлов
- ✅ `AGENTS_SETUP.md`: токен заменен на placeholder
- ✅ Проверены все `.env` файлы
- ✅ `.gitignore` проверен и обновлен

### 2. Защита от повторения

**Правила:**
1. ❌ **НИКОГДА** не коммитьте реальные токены
2. ✅ Используйте только `.env.example` с placeholder значениями
3. ✅ Храните реальные токены только в `.env` (в .gitignore)
4. ✅ Для CI/CD используйте GitHub Secrets

---

## 🔑 СОЗДАНИЕ НОВОГО ТОКЕНА

### Шаг 1: Генерация нового токена

1. Перейдите: https://github.com/settings/tokens
2. Нажмите "Generate new token (classic)"
3. Настройки:
   - **Note:** `Flow Logic Multi-Agent System`
   - **Expiration:** 90 дней
   - **Scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `read:org` (Read org and team membership)
4. Скопируйте токен (показывается только один раз!)

### Шаг 2: Сохранение токена

**Локально (для разработки):**
```bash
# Добавить в .env (НЕ коммитить!)
echo "GITHUB_TOKEN=ghp_ваш_новый_токен" >> .env
```

**CI/CD (GitHub Actions):**
1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `GITHUB_TOKEN`
4. Value: ваш новый токен

**Production (если нужно):**
- AWS SSM Parameter Store: `/flowlogic/production/github/token`

---

## 🧹 ОЧИСТКА ИСТОРИИ GIT

⚠️ **ВАЖНО:** Токен может быть в истории Git. Для полной очистки:

### Вариант 1: BFG Repo-Cleaner (рекомендуется)

```bash
# Установить BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Создать файл с токенами для замены
echo "ghp_REVOKED_TOKEN_EXAMPLE==>ghp_REVOKED_TOKEN" > tokens.txt

# Очистить историю
bfg --replace-text tokens.txt

# Очистить reflog
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (ОСТОРОЖНО!)
git push --force
```

### Вариант 2: git-filter-repo

```bash
# Установить git-filter-repo
pip install git-filter-repo

# Заменить токен в истории
git filter-repo --replace-text <(echo "ghp_REVOKED_TOKEN_EXAMPLE==>ghp_REVOKED_TOKEN")

# Force push
git push --force
```

⚠️ **ВНИМАНИЕ:** Force push перезапишет историю. Убедитесь, что все участники проекта синхронизированы!

---

## 📋 ЧЕКЛИСТ БЕЗОПАСНОСТИ

- [ ] Токен удален из всех файлов
- [ ] `.env` в `.gitignore`
- [ ] `.env.example` содержит только placeholder значения
- [ ] Новый токен создан
- [ ] Новый токен сохранен в `.env` (локально)
- [ ] Новый токен добавлен в GitHub Secrets (для CI/CD)
- [ ] История Git очищена (опционально, но рекомендуется)
- [ ] Все участники проекта уведомлены о смене токена

---

## 🔍 ПРОВЕРКА

### Проверить, что токен не в файлах:
```bash
grep -r "ghp_REVOKED_TOKEN_EXAMPLE" . --exclude-dir=node_modules --exclude-dir=.git
```

### Проверить, что .env в .gitignore:
```bash
git check-ignore .env
# Должно вывести: .env
```

### Проверить новый токен:
```bash
# Python
python3 -c "import os; from github import Github; g = Github(os.getenv('GITHUB_TOKEN')); print('✅ Токен работает')"

# Node.js
node -e "const {Octokit} = require('@octokit/rest'); const octokit = new Octokit({auth: process.env.GITHUB_TOKEN}); console.log('✅ Токен работает')"
```

---

## 📚 Дополнительные ресурсы

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)

---

**Обновлено:** 2025-12-26  
**Статус:** Токен отозван, файлы исправлены

