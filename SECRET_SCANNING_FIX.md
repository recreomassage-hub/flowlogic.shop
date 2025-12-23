# 🔒 Исправление GitHub Secret Scanning

## Проблема
GitHub Secret Scanning блокирует push из-за обнаруженных паттернов секретов в коде.

## ✅ Исправления

### 1. .env.example
- ❌ Было: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT формат)
- ❌ Было: `sk-ant-...` (Anthropic API формат)
- ❌ Было: `ghp_...` (GitHub token формат)
- ✅ Стало: `your-supabase-anon-key-here`, `your-anthropic-api-key-here`, `your-github-token-here`

### 2. PRD.md
- ❌ Было: `sk_test_xxxxx`, `whsec_xxxxx` (Stripe форматы)
- ✅ Стало: `your-stripe-secret-key-here`, `your-stripe-webhook-secret-here`

### 3. .gitignore
- ✅ Добавлены исключения для Obsidian: `.obsidian/`, `*.obsidian`
- ✅ Добавлены исключения для SSH ключей: `*.pub`, `id_rsa`, `id_ed25519`

## 📋 Команды для коммита

```bash
# Добавить исправленные файлы
git add .env.example docs/requirements/PRD.md .gitignore

# Создать коммит
git commit -m "fix: replace secret patterns with placeholders to pass GitHub Secret Scanning"

# Push (теперь должен пройти)
git push
```

## ⚠️ Если секреты уже в истории Git

Если вы уже делали коммиты с реальными секретами:

### Вариант 1: Очистка истории (для новых репозиториев)
```bash
# Создать новый репозиторий без истории
git checkout --orphan new-main
git add .
git commit -m "Initial commit without secrets"
git branch -D main
git branch -m main
git push -f origin main
```

### Вариант 2: BFG Repo-Cleaner (для существующих репозиториев)
```bash
# Установить BFG
# Использовать для замены секретов в истории
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## 🛡️ Предотвращение в будущем

1. ✅ Используйте только плейсхолдеры в `.env.example`
2. ✅ Всегда проверяйте `.gitignore` перед коммитом
3. ✅ Используйте `git-secrets` для локальной проверки
4. ✅ Настройте pre-commit hooks для автоматической проверки

## 📝 Форматы, которые GitHub распознает как секреты

- `sk-` (Stripe, Anthropic, OpenAI)
- `ghp_` (GitHub Personal Access Token)
- `eyJ` (JWT tokens)
- `sk_test_`, `sk_live_` (Stripe)
- `whsec_` (Stripe webhook secrets)
- И многие другие...

**Решение**: Используйте явные плейсхолдеры типа `your-*-key-here` вместо форматов секретов.
