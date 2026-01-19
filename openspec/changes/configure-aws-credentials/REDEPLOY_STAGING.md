# Re-deploy на Staging: configure-aws-credentials

**Дата:** 2026-01-15  
**Change:** `configure-aws-credentials`  
**Environment:** staging

---

## Статус

❌ **Предыдущий деплой провалился** (Run ID: 21100907700)

**Проверено:**
- ✅ GitHub Environment `staging` существует
- ✅ `AWS_ROLE_ARN` настроен в staging environment (2026-01-13)
- ✅ Protection rules не блокируют (пустые)
- ❌ Деплой провалился по неизвестной причине

---

## Повторный запуск деплоя на staging

### Команды:

```bash
# 1. Убедиться что находимся в правильной директории
cd "/home/s269819m/Obsidian Vault/Flow Logic 1.0/llm-os-project flowlogic.shop"

# 2. Запустить деплой НА STAGING (не production!)
gh workflow run "Backend Deployment" -f stage=staging

# 3. Проверить что запущен правильный job
gh run list --workflow="Backend Deployment" --limit 1

# 4. Мониторить выполнение
gh run watch
```

### Важно:

⚠️ **Убедитесь что указываете `stage=staging`, а НЕ `stage=production`!**

---

## Проверка результатов после деплоя

### 1. Проверка health endpoint

```bash
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'
```

**Ожидаемый результат:** `{"status": "healthy", ...}`

### 2. Smoke tests

```bash
bash scripts/smoke_tests.sh staging
```

### 3. OIDC credentials validation

```bash
bash scripts/validate-aws-credentials.sh staging
```

---

## Диагностика предыдущей ошибки

Для просмотра логов предыдущего провалившегося деплоя:

1. **Через веб интерфейс:**
   - Перейти в GitHub Repository → Actions
   - Найти Run ID: 21100907700
   - Открыть job "Deploy to Staging"
   - Просмотреть логи

2. **Через CLI (если доступно):**
   ```bash
   gh run view 21100907700 --log > staging-deploy-error.log
   ```

---

## Следующие шаги

1. ⬜ Запустить повторный деплой на staging
2. ⬜ Мониторить выполнение
3. ⬜ Проверить логи при ошибках
4. ⬜ Выполнить smoke tests после успешного деплоя
5. ⬜ Проверить health endpoint
6. ⬜ Обновить результаты

---

**Важно:** Убедитесь что используете `-f stage=staging`, а не `stage=production`!
