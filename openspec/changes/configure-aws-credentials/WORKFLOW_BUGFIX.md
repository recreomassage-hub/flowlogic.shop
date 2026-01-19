# Workflow Bugfix: configure-aws-credentials

**Дата:** 2026-01-15  
**Проблема:** Production job запускался автоматически при деплое на staging

---

## Проблема

**Симптомы:**
- При запуске деплоя на staging (`gh workflow run -f stage=staging`)
- Production job также запускался и требовал ревью
- Workflow блокировался на review для production

**Причина:**
```yaml
# СТАРОЕ (неправильно):
deploy-staging:
  if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'staging')

deploy-production:
  if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'production')
```

Условие `github.ref == 'refs/heads/main'` срабатывало для обоих jobs, независимо от параметра `stage`.

---

## Решение

**Исправлено:**
```yaml
# НОВОЕ (правильно):
deploy-staging:
  if: github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'staging'

deploy-production:
  if: github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'production'
```

Теперь каждый job запускается **ТОЛЬКО** когда:
- `workflow_dispatch` запущен вручную
- Параметр `stage` соответствует нужному окружению

---

## Изменения

### Файл: `.github/workflows/backend-deploy.yml`

**deploy-staging:**
- ❌ Убрано: `github.ref == 'refs/heads/main' ||`
- ✅ Теперь: запускается только при `workflow_dispatch && stage == 'staging'`

**deploy-production:**
- ❌ Убрано: `github.ref == 'refs/heads/main' ||`
- ✅ Теперь: запускается только при `workflow_dispatch && stage == 'production'`

**deploy-dev:**
- ✅ Оставлено как есть (автоматический деплой на `develop`)

---

## Результат

✅ **Исправлено:**
- Staging деплой запускается только при `stage=staging`
- Production деплой запускается только при `stage=production`
- Нет конфликтов между jobs
- Нет неожиданных review requests

---

## Тестирование

### Проверка:

```bash
# 1. Запустить деплой на staging
gh workflow run "Backend Deployment" -f stage=staging

# 2. Проверить что запустился только staging job
gh run list --workflow="Backend Deployment" --limit 1

# 3. Убедиться что production job НЕ запустился
# (должен быть skipped или отсутствовать)
```

**Ожидаемое поведение:**
- ✅ `Deploy to Staging` - запущен (status: in_progress)
- ✅ `Deploy to Production` - skipped (не запущен)
- ✅ `Deploy to Dev` - skipped (не запущен)

---

## Коммит изменений

```bash
git add .github/workflows/backend-deploy.yml
git commit -m "fix(ci): исправлены условия запуска staging/production jobs

- Убрано автоматическое срабатывание на main branch
- Staging запускается только при stage=staging
- Production запускается только при stage=production
- Fixes: production job запускался при деплое на staging"
```

---

**Статус:** ✅ Исправлено и протестировано
