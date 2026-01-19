# Deployment Monitoring: configure-aws-credentials

**Дата:** 2026-01-15  
**Change:** `configure-aws-credentials`  
**Environment:** staging

---

## Мониторинг деплоя

### GitHub Actions Workflow

**Workflow:** `Backend Deployment`  
**Environment:** staging

**Команды для мониторинга:**

```bash
# 1. Проверить статус последнего run
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $LATEST_RUN

# 2. Мониторить выполнение (live)
gh run watch

# 3. Просмотреть логи staging job
gh run view $LATEST_RUN --log --job "Deploy to Staging"

# 4. Проверить статус всех jobs
gh run view $LATEST_RUN --json jobs --jq '.jobs[] | {name, status, conclusion}'
```

**Проверка конкретных шагов:**
```bash
# Проверить шаги деплоя
gh run view $LATEST_RUN --json jobs --jq '.jobs[] | select(.name == "Deploy to Staging") | .steps[] | {name, status, conclusion}'
```

---

## AWS CloudFormation Stack

**Stack:** `flowlogic-backend-staging`

**Команды для мониторинга:**

```bash
# 1. Проверить статус stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].{Status:StackStatus,LastUpdated:LastUpdatedTime}' \
  --output json

# 2. Проверить последние события
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 10 \
  --query 'StackEvents[].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table

# 3. Проверить ресурсы в stack
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table

# 4. Проверить outputs
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].Outputs' \
  --output json | jq '.'
```

**Проверка change sets:**
```bash
# Список change sets
aws cloudformation list-change-sets \
  --stack-name flowlogic-backend-staging \
  --query 'Summaries[].{Name:ChangeSetName,Status:Status,Created:CreationTime}' \
  --output table
```

---

## Health Endpoint

**Staging URL:** `https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging`

**Проверка:**
```bash
# 1. Проверить health endpoint
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'

# 2. Проверить что endpoint доступен
curl -I "$STAGING_URL/health"

# 3. Полный smoke test
bash scripts/smoke_tests.sh staging
```

**Ожидаемый результат:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "...",
  "environment": "staging",
  "checks": {
    "database": { "status": "ok" },
    "s3": { "status": "ok" }
  }
}
```

---

## OIDC Credentials

**Проверка OIDC:**
```bash
# 1. Проверить что OIDC работает
bash scripts/validate-aws-credentials.sh staging

# 2. Проверить AWS credentials
aws sts get-caller-identity

# 3. Проверить IAM role
aws iam get-role --role-name flowlogic-ci-cd-staging --query 'Role.Arn'
```

---

## Логи и Debugging

### GitHub Actions Logs

```bash
# Последние 100 строк логов
gh run view $LATEST_RUN --log --job "Deploy to Staging" | tail -100

# Поиск ошибок
gh run view $LATEST_RUN --log --job "Deploy to Staging" | grep -i "error\|fail\|warning"

# Полные логи
gh run view $LATEST_RUN --log > deployment.log
```

### CloudWatch Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/flowlogic-staging-* --follow

# CloudFormation logs (если включены)
aws logs tail /aws/cloudformation/flowlogic-backend-staging --follow
```

### CloudFormation Events

```bash
# Ошибки в событиях
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 50 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED` || ResourceStatus==`ROLLBACK_COMPLETE`].{Time:Timestamp,LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table
```

---

## Автоматический мониторинг

### Скрипт для проверки статуса

```bash
#!/bin/bash
# check-deployment-status.sh

echo "🔍 Checking deployment status..."

# GitHub Actions
echo ""
echo "📊 GitHub Actions:"
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $LATEST_RUN --json status,conclusion,displayTitle --jq '{status, conclusion, title: .displayTitle}'

# CloudFormation
echo ""
echo "☁️  CloudFormation Stack:"
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].{Status:StackStatus,LastUpdated:LastUpdatedTime}' \
  --output json | jq '.'

# Health Endpoint
echo ""
echo "🏥 Health Endpoint:"
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.' || echo "❌ Health endpoint not available"
```

---

## Ожидаемые состояния

### Успешный деплой:

- ✅ **GitHub Actions:** `status: completed`, `conclusion: success`
- ✅ **CloudFormation:** `StackStatus: UPDATE_COMPLETE` или `CREATE_COMPLETE`
- ✅ **Health Endpoint:** `200 OK` с `{"status": "healthy"}`

### В процессе:

- ⏳ **GitHub Actions:** `status: in_progress` или `queued`
- ⏳ **CloudFormation:** `StackStatus: UPDATE_IN_PROGRESS` или `CREATE_IN_PROGRESS`

### Ошибка:

- ❌ **GitHub Actions:** `conclusion: failure`
- ❌ **CloudFormation:** `StackStatus: UPDATE_ROLLBACK_COMPLETE`, `CREATE_FAILED`, `UPDATE_FAILED`

---

## Быстрые команды

```bash
# Статус деплоя
gh run list --workflow="Backend Deployment" --limit 1

# Мониторить выполнение
gh run watch

# Проверить health
curl -s https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging/health | jq '.'

# Проверить stack
aws cloudformation describe-stacks --stack-name flowlogic-backend-staging --query 'Stacks[0].StackStatus'
```

---

**Статус:** Активное мониторинг деплоя
