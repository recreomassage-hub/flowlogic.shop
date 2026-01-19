# Staging Deploy Confirmed: configure-aws-credentials

**Дата:** 2026-01-15  
**Change:** `configure-aws-credentials`  
**Environment:** staging ✅

---

## Подтверждение

✅ **Деплой запущен НА STAGING**

**Параметр:** `stage=staging` ✅  
**Workflow:** `Backend Deployment`  
**Environment:** `staging` (не production!)

---

## Проверка статуса

### Команды для проверки:

```bash
# Проверить последний run
gh run list --workflow="Backend Deployment" --limit 1

# Проверить что job "Deploy to Staging" запущен
gh run list --workflow="Backend Deployment" --limit 1 --json jobs --jq '.[0].jobs[] | {name, environment: .environment.name}'

# Мониторить выполнение
gh run watch
```

### Ожидаемое поведение:

- ✅ **"Deploy to Staging"** должен быть активен/запущен (environment: staging)
- ⏸️ **"Deploy to Production"** должен быть cancelled/skipped
- ⏸️ **"Deploy to Dev"** должен быть skipped

---

## Мониторинг

### Проверить статус:

```bash
# Последний run
RUN_ID=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $RUN_ID

# Логи staging job (когда запустится)
gh run view $RUN_ID --log --job "Deploy to Staging"
```

---

## После успешного деплоя

### 1. Проверка health endpoint

```bash
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'
```

### 2. Smoke tests

```bash
bash scripts/smoke_tests.sh staging
```

### 3. OIDC validation

```bash
bash scripts/validate-aws-credentials.sh staging
```

---

**Важно:** Убедитесь что деплой идет на staging (environment: staging), а не на production!
