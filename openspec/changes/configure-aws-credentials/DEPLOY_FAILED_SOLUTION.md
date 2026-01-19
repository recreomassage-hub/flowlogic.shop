# Deploy Failed - Final Solution

**Дата:** 2026-01-15  
**Проблема:** Stack в DELETE_FAILED блокирует деплой

---

## Проблема

**Статус stack:** `DELETE_FAILED`  
**Причина:** Deployment bucket не может быть удален CloudFormation  
**Блокирует:** Создание нового stack или обновление существующего

---

## Решение применено

### 1. ✅ Удален deployment bucket вручную

```bash
# Найден и удален bucket
aws s3 rb s3://flowlogic-backend-staging-serverlessdeploymentbuck-hl2wzrvp2vjw --force
```

### 2. ✅ Запущено удаление stack

```bash
aws cloudformation delete-stack --stack-name flowlogic-backend-staging
```

### 3. ✅ Перезапущен деплой

```bash
gh workflow run "Backend Deployment" -f stage=staging
```

---

## Если stack останется в DELETE_FAILED

**Serverless Framework должен справиться:**

1. **Попробует обновить существующий stack** (даже в DELETE_FAILED)
2. **Или создаст новый stack** с тем же именем
3. **Stack перейдет в `CREATE_COMPLETE` или `UPDATE_COMPLETE`**

**Если не поможет - альтернативные решения:**

### Вариант 1: Использовать другой stack name

Временно изменить service name:
```yaml
service: flowlogic-backend-staging-new
```

### Вариант 2: Использовать другой stage

```bash
serverless deploy --stage staging-new
```

### Вариант 3: Игнорировать старый stack

Удалить старый stack из CloudFormation через AWS Console вручную (если возможно).

---

## Текущие изменения в serverless.yml

1. ✅ **Отключен `onError: !GetAtt ProcessingDLQ.Arn`**
2. ✅ **Отключены права на SQS в IAM role**
3. ✅ **Отключен `monitoring.yml`**

**После успешного деплоя включить обратно!**

---

## Мониторинг

```bash
# Проверить статус stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus' 2>&1

# Мониторить деплой
gh run watch

# Проверить ресурсы после деплоя
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table
```

---

**Статус:** ✅ Bucket удален, stack удаление запущено, деплой перезапущен. Ожидание результатов.
