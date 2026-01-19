# ResourceExistenceCheck Diagnosis

**Дата:** 2026-01-15  
**Проблема:** Change Set не создается из-за ResourceExistenceCheck

---

## Проблема

**Ошибка:**
```
Could not create Change Set "flowlogic-backend-staging-change-set" due to: 
The following hook(s)/validation failed: [AWS::EarlyValidation::ResourceExistenceCheck].
```

**Статус stack:** `UPDATE_ROLLBACK_COMPLETE`  
**Статус change set:** `FAILED`

---

## Диагностика

### Change Set Changes:

Change set пытается создать:
- `ApiGatewayDeployment1768685844618` (Add)
- `ApiGatewayMethodAny` (Add)
- `ApiGatewayMethodOptions` (Add)
- `ApiGatewayMethodProxyVarAny` (Add)
- `ApiGatewayMethodProxyVarOptions` (Add)

**Проблема:** ResourceExistenceCheck проверяет существование ресурсов, на которые ссылается template **до** создания change set.

### Template использует:

1. **`!GetAtt ProcessingDLQ.Arn`** в `serverless.yml`:
   - `onError: !GetAtt ProcessingDLQ.Arn`
   - `Resource: !GetAtt ProcessingDLQ.Arn`

2. **`!Ref ReliabilityAlertsTopic`** в `monitoring.yml`

**Гипотеза:** После `UPDATE_ROLLBACK_COMPLETE` некоторые ресурсы (ProcessingDLQ, ReliabilityAlertsTopic) могут отсутствовать в stack, но template ссылается на них.

---

## Проверка ресурсов

### Проверить существование ресурсов в stack:

```bash
# Проверить ProcessingDLQ
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[?LogicalResourceId==`ProcessingDLQ`]'

# Проверить ReliabilityAlertsTopic
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[?LogicalResourceId==`ReliabilityAlertsTopic`]'

# Проверить все ресурсы
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].LogicalResourceId'
```

### Проверить физическое существование ресурсов:

```bash
# SQS Queue
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/flowlogic-staging-processing-dlq \
  --attribute-names QueueArn

# SNS Topic
aws sns list-topics \
  --query 'Topics[?contains(TopicArn, `flowlogic-staging-reliability-alerts`)].TopicArn'
```

---

## Возможные решения

### Вариант 1: Восстановить stack из предыдущего состояния

Если stack в `UPDATE_ROLLBACK_COMPLETE`, можно попробовать:
1. Удалить failed change set (выполнено ✅)
2. Создать новый change set
3. Выполнить update

### Вариант 2: Сделать ресурсы опциональными

Если ресурсы не критичны, использовать Conditions:
```yaml
Conditions:
  HasProcessingDLQ: !Not [!Equals [!Ref ProcessingDLQ, ""]]

Resources:
  ApiFunction:
    onError: !If
      - HasProcessingDLQ
      - !GetAtt ProcessingDLQ.Arn
      - !Ref AWS::NoValue
```

### Вариант 3: Удалить stack и создать заново

Если stack в плохом состоянии:
```bash
# Удалить stack
aws cloudformation delete-stack --stack-name flowlogic-backend-staging

# Дождаться удаления
aws cloudformation wait stack-delete-complete --stack-name flowlogic-backend-staging

# Создать заново
serverless deploy --stage staging
```

### Вариант 4: Проверить порядок создания ресурсов

Убедиться что ProcessingDLQ и ReliabilityAlertsTopic создаются до их использования.

---

## Следующие шаги

1. ✅ Удалить failed change set (выполнено)
2. ⬜ Проверить существование ProcessingDLQ и ReliabilityAlertsTopic в stack
3. ⬜ Проверить физическое существование ресурсов (SQS, SNS)
4. ⬜ Если ресурсы отсутствуют - попробовать восстановить или создать заново
5. ⬜ Перезапустить деплой

---

## Мониторинг

```bash
# Проверить статус stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus'

# Проверить события
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 10 \
  --query 'StackEvents[].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}'

# Проверить change sets
aws cloudformation list-change-sets \
  --stack-name flowlogic-backend-staging \
  --query 'Summaries[].{Name:ChangeSetName,Status:Status,Reason:StatusReason}'
```

---

**Статус:** ⏳ Диагностика в процессе
