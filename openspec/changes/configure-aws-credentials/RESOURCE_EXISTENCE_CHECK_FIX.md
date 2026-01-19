# CloudFormation ResourceExistenceCheck Fix

**Дата:** 2026-01-15  
**Проблема:** Change Set не создается из-за `AWS::EarlyValidation::ResourceExistenceCheck`

---

## Проблема

**Ошибка:**
```
Could not create Change Set "flowlogic-backend-staging-change-set" due to: 
The following hook(s)/validation failed: [AWS::EarlyValidation::ResourceExistenceCheck]. 
To troubleshoot Early Validation errors, use the DescribeEvents API for detailed failure information.
```

**Статус stack:** `UPDATE_ROLLBACK_COMPLETE`  
**Статус change set:** `FAILED`

---

## Причина

`ResourceExistenceCheck` - это early validation hook в CloudFormation, который проверяет существование ресурсов **до** создания change set. Это может происходить если:

1. **SSM Parameter не существует** - template ссылается на SSM параметр, который не найден
2. **S3 Bucket не существует** - template ссылается на S3 bucket, который не найден
3. **IAM Role не существует** - template ссылается на IAM роль, которая не найдена
4. **Другие внешние ресурсы** - template ссылается на ресурсы, которые должны существовать заранее

---

## Решение

### 1. ✅ Удалить failed change set

```bash
aws cloudformation delete-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set
```

### 2. Проверить события CloudFormation для деталей

```bash
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 20 \
  --query 'StackEvents[?contains(ResourceStatusReason, `ResourceExistenceCheck`) || contains(ResourceStatusReason, `not found`) || contains(ResourceStatusReason, `does not exist`)].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output json | jq '.'
```

### 3. Проверить необходимые ресурсы

**SSM Parameters:**
```bash
# Проверить SSM параметры для staging
aws ssm get-parameter --name "/flowlogic/staging/cognito/user-pool-id" --output text
aws ssm get-parameter --name "/flowlogic/staging/cognito/client-id" --output text
aws ssm get-parameter --name "/flowlogic/staging/stripe/secret-key" --output text
```

**S3 Bucket:**
```bash
# Проверить S3 bucket
aws s3 ls s3://flowlogic-backend-staging
```

**IAM Roles:**
```bash
# Проверить IAM роли, на которые ссылается template
aws iam get-role --role-name flowlogic-backend-staging-us-east-1-lambdaRole
```

### 4. Создать недостающие ресурсы (если нужно)

Если какие-то ресурсы отсутствуют, создать их перед деплоем.

### 5. Перезапустить деплой

После удаления failed change set и проверки ресурсов, перезапустить деплой.

---

## Диагностика

### Проверить события для деталей:

```bash
# Последние события с ошибками
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 50 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED` || contains(ResourceStatusReason, `ResourceExistenceCheck`)].{Time:Timestamp,LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table
```

### Проверить change set детали:

```bash
# Детали failed change set
aws cloudformation describe-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set \
  --query '{Status:Status,StatusReason:StatusReason,Changes:Changes}' \
  --output json | jq '.'
```

---

## Возможные решения

### Вариант 1: Сделать SSM параметры опциональными

В `serverless.yml` можно использовать fallback:
```yaml
environment:
  COGNITO_USER_POOL_ID: ${ssm:/flowlogic/${self:provider.stage}/cognito/user-pool-id, ''}
```

### Вариант 2: Создать недостающие ресурсы заранее

Если ресурсы должны существовать, создать их перед деплоем.

### Вариант 3: Использовать условные ресурсы

Если ресурсы опциональны, использовать CloudFormation Conditions.

---

## Следующие шаги

1. ✅ Удалить failed change set
2. ⬜ Проверить события CloudFormation для деталей
3. ⬜ Проверить SSM параметры
4. ⬜ Проверить S3 bucket
5. ⬜ Перезапустить деплой

---

**Статус:** ⏳ В процессе диагностики
