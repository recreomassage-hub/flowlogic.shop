# Change Stack Name Fix

**Дата:** 2026-01-15  
**Проблема:** Stack в DELETE_FAILED блокирует деплой, ничего не помогает

---

## Проблема

**Статус stack:** `DELETE_FAILED` (застрял в этом состоянии)  
**Проблемы:**
- Stack не может быть удален
- Деплой проваливается снова и снова
- ResourceExistenceCheck ошибки
- Bucket удален, но stack остался в DELETE_FAILED

**Ничего не помогает:**
- ❌ Удаление bucket вручную - не помогло
- ❌ Очистка bucket - не помогло
- ❌ Удаление stack с retain-resources - не помогло
- ❌ Отключение monitoring.yml и onError - не помогло

---

## Решение: Изменить Stack Name

### Временно изменить service name

**Изменения в `infra/serverless/serverless.yml`:**

```yaml
# БЫЛО:
service: flowlogic-backend

# СТАЛО:
service: flowlogic-backend-staging-new
# Временно изменено для обхода DELETE_FAILED stack
# TODO: Вернуть обратно после успешного деплоя
# service: flowlogic-backend
```

**Что это даст:**
- ✅ Создаст новый stack `flowlogic-backend-staging-new-staging`
- ✅ Не будет конфликтов с существующим stack в DELETE_FAILED
- ✅ Деплой должен пройти успешно

---

## После успешного деплоя

### Вариант 1: Оставить новый stack

Если новый stack работает:
- Удалить старый stack `flowlogic-backend-staging` через AWS Console (если возможно)
- Оставить новый stack `flowlogic-backend-staging-new-staging`
- Обновить URLs и документацию

### Вариант 2: Вернуть старое имя

Если хотите вернуть старое имя:
1. Дождаться удаления старого stack (может занять время)
2. Вернуть `service: flowlogic-backend` в serverless.yml
3. Задеплоить снова

---

## Текущие изменения в serverless.yml

1. ✅ **Изменен service name:** `flowlogic-backend-staging-new`
2. ✅ **Отключен `onError: !GetAtt ProcessingDLQ.Arn`**
3. ✅ **Отключены права на SQS в IAM role**
4. ✅ **Отключен `monitoring.yml`**

---

## Проверка после деплоя

### Новый stack:
```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging-new-staging \
  --query 'Stacks[0].StackStatus'
```

### Ресурсы:
```bash
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging-new-staging \
  --query 'StackResources[].{LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus}' \
  --output table
```

### Health endpoint:
```bash
STAGING_URL=$(aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging-new-staging \
  --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
  --output text)

curl -s "$STAGING_URL/health" | jq '.'
```

---

**Статус:** ✅ Service name изменен, деплой перезапущен с новым stack name
