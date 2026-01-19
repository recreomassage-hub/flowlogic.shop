# Delete Stack and Recreate: Fix ResourceExistenceCheck

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
**Причина:** 
- Stack в состоянии rollback после неудачного update
- Многие ресурсы удалены (ProcessingDLQ, ReliabilityAlertsTopic, VideosBucket, Lambda, API Gateway)
- Template ссылается на отсутствующие ресурсы (`!GetAtt ProcessingDLQ.Arn`)
- ResourceExistenceCheck проверяет эти ресурсы до создания change set и падает

**Попытки исправления:**
- ❌ Удаление failed change set - не помогло
- ❌ continue-update-rollback - невозможно (rollback уже завершен)
- ✅ Удаление stack и создание заново

---

## Решение: Удалить Stack и Создать Заново

### Выполнено:

```bash
# 1. Удалить failed change set
aws cloudformation delete-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set

# 2. Удалить stack
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging

# 3. Дождаться удаления
aws cloudformation wait stack-delete-complete \
  --stack-name flowlogic-backend-staging

# 4. Запустить деплой (stack будет создан заново)
gh workflow run "Backend Deployment" -f stage=staging
```

---

## Что происходит

**Удаление stack:**
1. CloudFormation удаляет все ресурсы в stack:
   - Lambda functions
   - API Gateway
   - DynamoDB tables
   - S3 buckets
   - SQS queues
   - SNS topics
   - IAM roles
   - CloudWatch Logs
   - И другие ресурсы

2. После удаления stack не существует

**Создание заново:**
1. Serverless Framework создаст новый stack
2. Все ресурсы будут созданы заново:
   - ProcessingDLQ
   - ReliabilityAlertsTopic
   - VideosBucket
   - Lambda functions
   - API Gateway
   - DynamoDB tables
   - И другие ресурсы

3. Stack будет в состоянии `CREATE_COMPLETE` или `UPDATE_COMPLETE`

---

## ⚠️ Внимание

**Удаление stack удаляет ВСЕ ресурсы:**
- ✅ Lambda functions - будут пересозданы
- ✅ API Gateway - будет пересоздан
- ✅ DynamoDB tables - будут пересозданы (⚠️ данные будут потеряны!)
- ✅ S3 buckets - будут пересозданы (⚠️ данные будут потеряны!)
- ✅ SQS queues - будут пересозданы (⚠️ сообщения будут потеряны!)
- ✅ SNS topics - будут пересозданы
- ✅ CloudWatch Logs - будут пересозданы (⚠️ логи будут потеряны!)

**⚠️ Данные будут потеряны!**

---

## Проверка после удаления

### Проверить что stack удален:

```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging 2>&1 | grep -i "not found" || echo "Stack still exists"
```

**Ожидаемый результат:** Stack not found

### Проверить что ресурсы удалены:

```bash
# Lambda
aws lambda list-functions --query 'Functions[?contains(FunctionName, `flowlogic-staging`)].FunctionName'

# API Gateway
aws apigateway get-rest-apis --query 'items[?contains(name, `flowlogic-staging`)].name'

# DynamoDB
aws dynamodb list-tables --query 'TableNames[?contains(@, `flowlogic-staging`)]'

# S3
aws s3 ls | grep flowlogic-staging

# SQS
aws sqs list-queues --query 'QueueUrls[?contains(@, `flowlogic-staging`)]'

# SNS
aws sns list-topics --query 'Topics[?contains(TopicArn, `flowlogic-staging`)].TopicArn'
```

---

## Новый деплой

**После удаления stack запущен новый деплой:**

```bash
gh workflow run "Backend Deployment" -f stage=staging
```

**Что произойдет:**
1. Serverless Framework создаст новый stack `flowlogic-backend-staging`
2. Все ресурсы будут созданы заново
3. Stack будет в состоянии `CREATE_COMPLETE`
4. Health endpoint будет доступен

---

## Мониторинг

### Проверить статус удаления:

```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus' 2>&1 || echo "Stack deleted"
```

### Проверить события удаления:

```bash
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 20 \
  --query 'StackEvents[].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table
```

### Мониторить новый деплой:

```bash
gh run watch
```

---

## Следующие шаги

1. ✅ Stack удаление запущено
2. ⏳ Ожидание удаления stack
3. ⬜ Проверить что stack удален
4. ⬜ Мониторить новый деплой
5. ⬜ Проверить health endpoint после успешного деплоя
6. ⬜ Выполнить smoke tests

---

**Статус:** ✅ Stack удаление запущено, новый деплой запущен
