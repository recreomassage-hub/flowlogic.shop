# Staging Deploy & Test Results

**Дата:** 2026-01-15  
**Change:** `configure-aws-credentials`  
**Environment:** staging

---

## Предварительная проверка (до деплоя)

### Health Endpoints Status

**Dev:**
- Status: ❌ 502 (Internal server error)
- URL: `https://t1p7ii26f5.execute-api.us-east-1.amazonaws.com/dev/health`

**Staging:**
- Status: ❌ 403 (Forbidden)
- URL: `https://4yei7a5aig.execute-api.us-east-1.amazonaws.com/staging/health`
- **Примечание:** Требуется деплой для обновления

**Production:**
- Status: ✅ 200 (OK)
- URL: `https://4yei7a5aig.execute-api.us-east-1.amazonaws.com/prod/health`
- Response: `{"status": "ok", "timestamp": "2026-01-17T21:09:05.556Z"}`

---

## План деплоя

### Команды для запуска:

```bash
# 1. Проверить готовность
cd "/home/s269819m/Obsidian Vault/Flow Logic 1.0/llm-os-project flowlogic.shop"
git status
git branch --show-current

# 2. Запустить деплой на staging
gh workflow run "Backend Deployment" -f stage=staging

# 3. Мониторить деплой
gh run watch

# 4. После успешного деплоя - запустить smoke tests
bash scripts/smoke_tests.sh staging

# 5. Проверить health endpoint после деплоя
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'
```

---

## Результаты деплоя

**Заполнить после выполнения:**

- [ ] Workflow запущен
- [ ] Deployment завершен успешно
- [ ] OIDC authentication работает
- [ ] Health endpoint возвращает 200 OK
- [ ] Smoke tests пройдены

**Run ID:** __________  
**Время деплоя:** __________  
**Статус:** __________

---

## Результаты тестов

**Заполнить после выполнения:**

### Smoke Tests
- [ ] Health endpoint доступен
- [ ] CORS настроен
- [ ] API endpoints возвращают правильные коды
- [ ] Auth endpoints работают

**Результат:** __________ тестов пройдено, __________ провалено

### OIDC Credentials Validation
- [ ] AWS_ROLE_ARN найден
- [ ] OIDC authentication успешна
- [ ] SSM Parameter Store доступен
- [ ] Fallback механизм работает (если тестировался)

**Результат:** __________

---

## Логи

**Workflow logs:**
```bash
# Получить последний run ID
RUN_ID=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $RUN_ID --log
```

**CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/flowlogic-staging-* --follow
```

---

## Заключение

**Статус:** ⏳ В процессе / ✅ Завершено / ❌ Ошибка

**Примечания:**
__________

**Следующие шаги:**
__________
