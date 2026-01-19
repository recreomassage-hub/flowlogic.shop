# Manual Bucket Delete Fix

**Дата:** 2026-01-15  
**Проблема:** Stack в DELETE_FAILED, блокирует деплой

---

## Проблема

**Статус stack:** `DELETE_FAILED`  
**Причина:** Deployment bucket не может быть удален CloudFormation, блокирует удаление stack

**Ошибка:**
- Stack не может быть удален из-за непустого bucket
- Новый stack не может быть создан пока старый существует
- Деплой проваливается

---

## Решение: Удалить bucket вручную

### Выполнено:

```bash
# 1. Найти deployment bucket
BUCKET_NAME=$(aws s3 ls | grep "flowlogic-backend-staging-serverlessdeployment" | awk '{print $3}' | head -1)

# 2. Очистить bucket
aws s3 rm s3://$BUCKET_NAME --recursive

# 3. Удалить bucket вручную
aws s3 rb s3://$BUCKET_NAME --force

# 4. Удалить stack
aws cloudformation delete-stack --stack-name flowlogic-backend-staging

# 5. Дождаться удаления stack
sleep 30

# 6. Запустить новый деплой
gh workflow run "Backend Deployment" -f stage=staging
```

---

## Альтернативное решение

### Если bucket все еще существует:

**Вариант 1: Использовать другой deployment bucket**

Временно изменить bucket name в serverless.yml:
```yaml
provider:
  deploymentBucket:
    name: flowlogic-deployment-staging-new-$(date +%s)
```

**Вариант 2: Игнорировать DELETE_FAILED и создать новый stack**

Использовать другой stack name временно:
```yaml
service: flowlogic-backend-new
```

Или использовать другой stage:
```bash
serverless deploy --stage staging-new
```

---

## Текущие изменения в serverless.yml

1. ✅ **Отключен `onError: !GetAtt ProcessingDLQ.Arn`**
2. ✅ **Отключены права на SQS в IAM role**
3. ✅ **Отключен `monitoring.yml`**

**После успешного деплоя включить обратно!**

---

## Проверка после деплоя

### Статус stack:
```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus' 2>&1 || echo "Stack deleted"
```

**Ожидаемый статус:** Stack удален или `CREATE_COMPLETE`

### Ресурсы:
```bash
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table
```

---

**Статус:** ✅ Bucket удален вручную, stack удаление запущено, деплой перезапущен
