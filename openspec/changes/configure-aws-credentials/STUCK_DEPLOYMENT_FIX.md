# Stuck Deployment Fix

**Дата:** 2026-01-15  
**Проблема:** Деплой завис, ничего не происходит 15+ минут

---

## Проблема

**Симптомы:**
- Деплой запущен, но ничего не происходит 15+ минут
- Stack в состоянии DELETE_IN_PROGRESS или DELETE_FAILED
- GitHub Actions workflow в состоянии "waiting" или "in_progress" без прогресса

---

## Диагностика

### Проверка статуса:

```bash
# 1. Проверить статус CloudFormation stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus'

# 2. Проверить статус GitHub Actions workflow
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $LATEST_RUN --json status,conclusion

# 3. Проверить активные delete операции
aws cloudformation list-stacks \
  --stack-status-filter DELETE_IN_PROGRESS DELETE_FAILED \
  --query 'StackSummaries[?contains(StackName, `flowlogic-backend-staging`)]'

# 4. Проверить последние события stack
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 10 \
  --query 'StackEvents[].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}'
```

---

## Решение

### Вариант 1: Принудительное удаление stack с retain-resources

Если stack завис в DELETE_IN_PROGRESS или DELETE_FAILED:

```bash
# 1. Удалить stack с сохранением проблемных ресурсов
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging \
  --retain-resources ServerlessDeploymentBucket ServerlessDeploymentBucketPolicy

# 2. Дождаться удаления
aws cloudformation wait stack-delete-complete \
  --stack-name flowlogic-backend-staging
```

### Вариант 2: Отменить зависший workflow и перезапустить

Если GitHub Actions workflow завис:

```bash
# 1. Отменить текущий run
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run cancel $LATEST_RUN

# 2. Убедиться что stack удален или в стабильном состоянии
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus' 2>&1 || echo "Stack not found"

# 3. Перезапустить деплой
gh workflow run "Backend Deployment" -f stage=staging
```

### Вариант 3: Создать новый stack с другим именем (временно)

Если stack не удаляется:

```bash
# Изменить имя stack в serverless.yml временно
# Или использовать другой stage
serverless deploy --stage staging-new
```

---

## Быстрое решение

```bash
# 1. Отменить текущий workflow run
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run cancel $LATEST_RUN 2>&1 || echo "Run not found or already finished"

# 2. Принудительно удалить stack
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging \
  --retain-resources ServerlessDeploymentBucket ServerlessDeploymentBucketPolicy 2>&1

# 3. Подождать немного
sleep 30

# 4. Проверить статус
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus' 2>&1 || echo "Stack deleted"

# 5. Если stack удален, запустить новый деплой
gh workflow run "Backend Deployment" -f stage=staging
```

---

**Статус:** ⏳ Диагностика и исправление в процессе
