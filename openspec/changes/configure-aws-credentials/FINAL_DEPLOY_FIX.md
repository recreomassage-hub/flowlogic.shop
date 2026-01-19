# Final Deploy Fix: ResourceExistenceCheck

**Дата:** 2026-01-15  
**Проблема:** ResourceExistenceCheck ошибка повторяется

---

## Проблема

**Ошибка:**
```
Could not create Change Set due to: 
[AWS::EarlyValidation::ResourceExistenceCheck] validation failed.
```

**Статус stack:** `CREATE_COMPLETE` (только с deployment bucket)  
**Статус change set:** `FAILED`  
**Ресурсы в stack:** Только `ServerlessDeploymentBucket` и `ServerlessDeploymentBucketPolicy`

**Причина:** 
- Stack был создан только с deployment bucket
- Change set пытается создать остальные ресурсы (Lambda, API Gateway, DynamoDB и т.д.)
- ResourceExistenceCheck проверяет ресурсы из template до создания change set
- Проверка падает, возможно из-за ProcessingDLQ или ReliabilityAlertsTopic

---

## Решение

### Попытка: Удалить stack и создать заново

**Выполнено:**

```bash
# 1. Удалить failed change set
aws cloudformation delete-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set

# 2. Удалить stack
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging

# 3. Дождаться удаления
sleep 15
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging || echo "Stack deleted"

# 4. Запустить новый деплой
gh workflow run "Backend Deployment" -f stage=staging
```

---

## Альтернативное решение (если не поможет)

### Вариант 1: Исправить template - сделать ресурсы опциональными

Если ResourceExistenceCheck проверяет ProcessingDLQ или ReliabilityAlertsTopic, можно сделать их опциональными:

```yaml
# В serverless.yml
functions:
  api:
    onError: !If
      - HasProcessingDLQ
      - !GetAtt ProcessingDLQ.Arn
      - !Ref AWS::NoValue

Conditions:
  HasProcessingDLQ: !Not [!Equals [!Ref ProcessingDLQ, ""]]
```

### Вариант 2: Удалить ссылки на ресурсы из template временно

Временно убрать `onError: !GetAtt ProcessingDLQ.Arn` и задеплоить, затем добавить обратно.

### Вариант 3: Использовать другой способ деплоя

Вместо Serverless Framework использовать прямой CloudFormation или другой инструмент.

---

## Диагностика

### Проверка каких ресурсов проверяет ResourceExistenceCheck:

```bash
# Проверить детали change set
aws cloudformation describe-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set \
  --query '{Status:Status,StatusReason:StatusReason,Changes:Changes[].ResourceChange.{Action:Action,LogicalId:LogicalResourceId,Type:ResourceType}}'

# Проверить изменения
aws cloudformation describe-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set \
  --query 'Changes[].ResourceChange | select(.Action == "Add")'
```

### Проверка ссылок на ресурсы в template:

```bash
# Проверить ссылки на ProcessingDLQ
grep -r "!GetAtt ProcessingDLQ" infra/serverless/

# Проверить ссылки на ReliabilityAlertsTopic
grep -r "!Ref ReliabilityAlertsTopic" infra/serverless/
```

---

## Текущий статус

✅ **Выполнено:**
1. Удален failed change set
2. Удаление stack запущено
3. Новый деплой запущен

⏳ **Ожидание:**
- Результатов нового деплоя
- Если ошибка повторится - попробовать альтернативные решения

---

## Мониторинг

```bash
# Проверить статус stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus' 2>&1 || echo "Stack deleted"

# Проверить ресурсы после деплоя
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table

# Мониторить деплой
gh run watch
```

---

**Статус:** ✅ Stack удаление запущено, новый деплой запущен, ожидание результатов
