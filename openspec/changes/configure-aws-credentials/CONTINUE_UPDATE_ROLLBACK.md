# Continue Update Rollback: Fix ResourceExistenceCheck

**Дата:** 2026-01-15  
**Проблема:** Stack в UPDATE_ROLLBACK_COMPLETE, ResourceExistenceCheck падает

---

## Проблема

**Ошибка:**
```
Could not create Change Set due to: 
[AWS::EarlyValidation::ResourceExistenceCheck] validation failed.
```

**Статус stack:** `UPDATE_ROLLBACK_COMPLETE`  
**Причина:** Stack в состоянии rollback, многие ресурсы удалены, но template ссылается на них.

---

## Решение: Continue Update Rollback

### Выполнено:

```bash
# 1. Запустить continue-update-rollback
aws cloudformation continue-update-rollback \
  --stack-name flowlogic-backend-staging

# 2. Дождаться завершения rollback
aws cloudformation wait stack-update-complete \
  --stack-name flowlogic-backend-staging

# 3. Проверить статус
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus'

# 4. Перезапустить деплой
gh workflow run "Backend Deployment" -f stage=staging
```

---

## Что делает continue-update-rollback

**continue-update-rollback:**
1. Завершает незавершенный rollback
2. Восстанавливает stack до состояния `UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS`
3. Затем до `UPDATE_ROLLBACK_COMPLETE`
4. Позволяет продолжить работу со stack

**После continue-update-rollback:**
- Stack должен перейти в состояние `UPDATE_ROLLBACK_COMPLETE` (завершен rollback)
- Можно создать новый change set
- Можно выполнить update

---

## Альтернативное решение: Удалить stack

Если `continue-update-rollback` не помогает, можно удалить stack и создать заново:

```bash
# 1. Удалить stack
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging

# 2. Дождаться удаления
aws cloudformation wait stack-delete-complete \
  --stack-name flowlogic-backend-staging

# 3. Создать заново
cd infra/serverless
serverless deploy --stage staging
```

⚠️ **Внимание:** Это удалит все ресурсы (Lambda, API Gateway, DynamoDB tables, S3 buckets и т.д.).

---

## Проверка после continue-update-rollback

### Статус stack:
```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].{Status:StackStatus,LastUpdated:LastUpdatedTime}' \
  --output json | jq '.'
```

**Ожидаемый статус:** `UPDATE_ROLLBACK_COMPLETE` (завершен rollback)

### Ресурсы в stack:
```bash
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table
```

### Change sets:
```bash
# Удалить все failed change sets
aws cloudformation list-change-sets \
  --stack-name flowlogic-backend-staging \
  --query 'Summaries[?Status==`FAILED`].ChangeSetName' \
  --output text | xargs -I {} aws cloudformation delete-change-set \
    --stack-name flowlogic-backend-staging \
    --change-set-name {}
```

---

## Следующие шаги

1. ✅ Выполнен continue-update-rollback
2. ⏳ Ожидание завершения rollback
3. ⬜ Проверить статус stack
4. ⬜ Удалить failed change sets (если есть)
5. ⬜ Перезапустить деплой
6. ⬜ Мониторить результаты

---

## Мониторинг

```bash
# Проверить статус rollback
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus'

# Проверить события
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 10 \
  --query 'StackEvents[].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table

# Мониторить деплой
gh run watch
```

---

**Статус:** ✅ Continue-update-rollback выполнен, ожидание завершения
