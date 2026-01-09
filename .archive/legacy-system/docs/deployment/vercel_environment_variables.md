# Vercel Environment Variables Configuration

## Production Environment Variables

Для production деплоя на Vercel нужно настроить следующие переменные окружения в Vercel Dashboard:

### Настройка в Vercel Dashboard

1. Перейдите в Vercel Dashboard: https://vercel.com/dashboard
2. Выберите проект `flowlogic-frontend` (или соответствующий проект)
3. Перейдите в Settings → Environment Variables
4. Добавьте следующие переменные для **Production** окружения:

```
VITE_API_URL=https://4yei7a5aig.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_CLIENT_ID=42toafnjvi016f0hi32t0sjqio
```

### Обновление переменных

После изменения переменных окружения в Vercel Dashboard, нужно:
1. Выполнить новый deployment (перезапустить workflow или push в main)
2. Или использовать Vercel CLI: `vercel env pull .env.production.local`

### Проверка текущих переменных

Для проверки настроенных переменных в Vercel:
```bash
cd src/frontend
npx vercel env ls
```

### Локальная разработка

Для локальной разработки создайте файл `.env` в `src/frontend/`:

```env
# Development Environment Variables
VITE_API_URL=https://t1p7ii26f5.execute-api.us-east-1.amazonaws.com/dev
VITE_COGNITO_CLIENT_ID=6a1074nmfc46nv7pkapfl3d8nb
```

**Важно:** `.env` файлы должны быть в `.gitignore` и не коммититься в репозиторий.

### Автоматизация через GitHub Secrets

Переменные окружения также можно настроить через GitHub Secrets для использования в GitHub Actions workflows, но для Vercel deployment лучше использовать встроенные Environment Variables в Vercel Dashboard, так как они автоматически доступны при деплое через `vercel` CLI.

