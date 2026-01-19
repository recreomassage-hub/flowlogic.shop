# Deploy & Test: configure-aws-credentials Staging Verification

**Дата:** 2026-01-15  
**Change:** `configure-aws-credentials`

---

## Цель

Выполнить деплой и тест на staging для проверки работы OIDC credentials и fallback механизма.

---

## Шаги для деплоя и теста

### 1. Подготовка

```bash
# Убедиться что находимся в правильной директории
cd "/home/s269819m/Obsidian Vault/Flow Logic 1.0/llm-os-project flowlogic.shop"

# Проверить текущий статус
git status
git branch --show-current
```

### 2. Проверка здоровья staging (до деплоя)

```bash
# Проверить health endpoints для всех окружений
bash scripts/check-health-endpoints.sh

# Или проверить только staging
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'
```

### 3. Запуск деплоя на staging

#### Вариант A: Через GitHub Actions UI (Рекомендуется)

1. Перейти в GitHub Repository → Actions → Backend Deployment
2. Нажать "Run workflow"
3. Выбрать:
   - Branch: `main` (или текущая ветка)
   - Stage: `staging`
4. Запустить workflow

#### Вариант B: Через GitHub CLI

```bash
# Проверить что gh CLI установлен и аутентифицирован
gh auth status

# Запустить workflow
gh workflow run "Backend Deployment" -f stage=staging

# Мониторить выполнение
gh run watch
```

#### Вариант C: Через скрипт

```bash
# Использовать готовый скрипт
bash scripts/test-deployment.sh staging
```

### 4. Мониторинг деплоя

```bash
# В новом терминале - мониторинг логов
gh run watch --workflow="Backend Deployment"

# Или проверить статус
gh run list --workflow="Backend Deployment" --limit 5
```

### 5. Проверка деплоя (Smoke Tests)

После успешного деплоя выполнить smoke tests:

```bash
# Запустить smoke tests для staging
bash scripts/smoke_tests.sh staging

# Ожидаемые результаты:
# ✅ Health endpoint доступен
# ✅ CORS настроен
# ✅ API endpoints возвращают правильные коды (401 для protected, 400 для validation)
```

### 6. Проверка OIDC credentials

```bash
# Проверить валидацию credentials
bash scripts/validate-aws-credentials.sh staging

# Ожидаемые результаты:
# ✅ AWS_ROLE_ARN найден
# ✅ OIDC authentication успешна
# ✅ SSM Parameter Store доступен
```

### 7. Проверка health endpoint после деплоя

```bash
# Проверить health endpoint
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'

# Ожидаемый ответ:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "version": "...",
#   "environment": "staging",
#   "checks": {
#     "database": { "status": "ok" },
#     "s3": { "status": "ok" },
#     ...
#   }
# }
```

---

## Тестирование fallback механизма (Опционально)

**⚠️ Внимание:** Этот тест нужно выполнять только если нужно проверить fallback логику.

### 1. Тест fallback на Access Keys

```bash
# Запустить тест fallback
bash scripts/test-fallback.sh staging
```

### 2. Восстановить OIDC после теста

```bash
# Убедиться что AWS_ROLE_ARN вернулся в GitHub Environment
gh secret list --env staging | grep AWS_ROLE_ARN
```

---

## Проверка результатов

### ✅ Критерии успеха:

1. **Deployment:**
   - ✅ Workflow завершился успешно
   - ✅ Backend деплоится через OIDC
   - ✅ Health endpoint возвращает `healthy`

2. **Smoke Tests:**
   - ✅ Все smoke tests пройдены
   - ✅ API endpoints отвечают корректно
   - ✅ CORS настроен правильно

3. **OIDC:**
   - ✅ OIDC authentication работает
   - ✅ AWS credentials настроены через OIDC
   - ✅ SSM Parameter Store доступен

4. **Fallback (если тестировался):**
   - ✅ Fallback на Access Keys работает (если OIDC не доступен)
   - ✅ CloudWatch metrics отправляются
   - ✅ Логирование работает

---

## Логи и отладка

### Просмотр логов workflow

```bash
# Получить последний run ID
RUN_ID=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')

# Просмотреть логи
gh run view $RUN_ID --log

# Скачать логи
gh run view $RUN_ID --log > staging-deployment-$(date +%Y%m%d).log
```

### Проверка CloudWatch Logs

```bash
# Проверить логи Lambda (если настроен AWS CLI)
aws logs tail /aws/lambda/flowlogic-staging-* --follow
```

---

## Следующие шаги

После успешного деплоя и тестов:

1. ✅ Задокументировать результаты
2. ✅ Обновить `STAGING_VERIFICATION_RESULTS.md` с результатами
3. ✅ Архивировать change через `/openspec-archive configure-aws-credentials`

---

## Troubleshooting

### Проблема: OIDC authentication failed

**Решение:**
1. Проверить что OIDC Provider настроен в AWS IAM
2. Проверить что IAM роль `flowlogic-ci-cd-staging` существует
3. Проверить trust policy для staging роли
4. Проверить что `AWS_ROLE_ARN` правильно настроен в GitHub Environment

### Проблема: Health endpoint недоступен

**Решение:**
1. Проверить что deployment завершился успешно
2. Проверить что Lambda функция деплоится
3. Проверить API Gateway endpoint URL
4. Проверить CloudWatch Logs для ошибок

### Проблема: Smoke tests провалились

**Решение:**
1. Проверить логи smoke tests
2. Проверить что все сервисы доступны (DynamoDB, S3, Cognito)
3. Проверить IAM permissions для staging роли
4. Проверить что environment variables правильно установлены

---

**Готово к выполнению!** 🚀
