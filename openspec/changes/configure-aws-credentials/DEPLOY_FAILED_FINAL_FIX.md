# Deploy Failed Final Fix

**Дата:** 2026-01-15  
**Проблема:** Stack в DELETE_FAILED, деплой провалился

---

## Проблема

**Статус stack:** `DELETE_FAILED`  
**Причина:** Deployment bucket не пустой (Serverless Framework добавляет файлы во время деплоя)

**Ошибка деплоя:**
- Workflow "Deploy to Staging": `failure`
- Stack не может быть удален из-за непустого bucket
- Новый stack не может быть создан пока старый существует

---

## Решение

### Выполнено:

1. **Очищен deployment bucket:**
   ```bash
   aws s3 rm s3://flowlogic-backend-staging-serverlessdeploymentbuck-hl2wzrvp2vjw --recursive
   ```

2. **Удаление stack с retain-resources:**
   ```bash
   aws cloudformation delete-stack \
     --stack-name flowlogic-backend-staging \
     --retain-resources ServerlessDeploymentBucket ServerlessDeploymentBucketPolicy
   ```

3. **Перезапущен деплой:**
   ```bash
   gh workflow run "Backend Deployment" -f stage=staging
   ```

---

## Альтернативное решение

### Если stack все еще в DELETE_FAILED:

**Вариант 1: Игнорировать DELETE_FAILED и обновить stack**

Serverless Framework может обновить существующий stack даже если он в DELETE_FAILED:
```bash
# Просто запустить деплой
serverless deploy --stage staging
```

**Вариант 2: Использовать другой bucket**

Временно изменить bucket name в serverless.yml:
```yaml
provider:
  deploymentBucket:
    name: flowlogic-deployment-staging-new
```

**Вариант 3: Удалить bucket вручную**

```bash
# Удалить bucket вручную (после удаления всех объектов)
aws s3 rb s3://flowlogic-backend-staging-serverlessdeploymentbuck-hl2wzrvp2vjw --force

# Затем удалить stack
aws cloudformation delete-stack --stack-name flowlogic-backend-staging
```

---

## Текущие изменения в serverless.yml

1. ✅ **Отключен `onError: !GetAtt ProcessingDLQ.Arn`**
2. ✅ **Отключены права на SQS в IAM role**
3. ✅ **Отключен `monitoring.yml`**

**После успешного деплоя включить обратно:**
- Раскомментировать `monitoring.yml`
- Раскомментировать `onError` и права на SQS
- Задеплоить update

---

## Проверка после деплоя

### Статус stack:
```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus'
```

**Ожидаемый статус:**
- `CREATE_COMPLETE` - новый stack создан
- `UPDATE_COMPLETE` - существующий stack обновлен
- `UPDATE_IN_PROGRESS` или `CREATE_IN_PROGRESS` - деплой в процессе

### Ресурсы в stack:
```bash
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table
```

### Health endpoint:
```bash
STAGING_URL=$(aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
  --output text)

curl -s "$STAGING_URL/health" | jq '.'
```

---

**Статус:** ✅ Bucket очищен, stack удаление запущено с retain-resources, деплой перезапущен
