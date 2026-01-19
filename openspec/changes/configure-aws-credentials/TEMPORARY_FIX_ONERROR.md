# Temporary Fix: Disable onError for ProcessingDLQ

**Дата:** 2026-01-15  
**Проблема:** ResourceExistenceCheck падает из-за `onError: !GetAtt ProcessingDLQ.Arn`

---

## Проблема

**Ошибка:**
```
ResourceExistenceCheck validation failed
```

**Причина:**
- `serverless.yml` содержит `onError: !GetAtt ProcessingDLQ.Arn` (строка 118)
- ProcessingDLQ создается в том же stack через `resources.yml`
- ResourceExistenceCheck проверяет ProcessingDLQ до создания change set
- Проверка падает, возможно из-за порядка создания ресурсов

---

## Решение

### Временно отключены ссылки на ProcessingDLQ

**Изменения в `infra/serverless/serverless.yml`:**

1. **Отключен `onError` в Lambda function:**
```yaml
# БЫЛО:
onError: !GetAtt ProcessingDLQ.Arn

# СТАЛО:
# Временно отключено из-за ResourceExistenceCheck ошибки
# TODO: Включить обратно после успешного деплоя
# onError: !GetAtt ProcessingDLQ.Arn
```

2. **Отключены права на SQS в IAM role:**
```yaml
# БЫЛО:
- Effect: Allow
  Action:
    - sqs:SendMessage
    - sqs:GetQueueAttributes
  Resource:
    - !GetAtt ProcessingDLQ.Arn

# СТАЛО:
# Временно отключено из-за ResourceExistenceCheck ошибки
# TODO: Включить обратно после успешного деплоя
# - Effect: Allow
#   Action:
#     - sqs:SendMessage
#     - sqs:GetQueueAttributes
#   Resource:
#     - !GetAtt ProcessingDLQ.Arn
```

---

## Что это означает

**Временно:**
- ❌ Lambda function не будет использовать Dead Letter Queue
- ❌ Failed invocations не будут попадать в DLQ
- ✅ Stack должен создать все остальные ресурсы успешно

**После успешного деплоя:**
- ✅ Включить `onError: !GetAtt ProcessingDLQ.Arn` обратно
- ✅ Включить права на SQS в IAM role
- ✅ Задеплоить update

---

## Следующие шаги

1. ✅ Изменения в `serverless.yml` применены
2. ⏳ Ожидание удаления stack
3. ⬜ Запуск нового деплоя
4. ⬜ После успешного деплоя - включить onError обратно
5. ⬜ Задеплоить update для добавления DLQ

---

## Восстановление DLQ после деплоя

После успешного деплоя:

```yaml
# 1. Раскомментировать onError в serverless.yml
onError: !GetAtt ProcessingDLQ.Arn

# 2. Раскомментировать права на SQS
- Effect: Allow
  Action:
    - sqs:SendMessage
    - sqs:GetQueueAttributes
  Resource:
    - !GetAtt ProcessingDLQ.Arn

# 3. Задеплоить update
serverless deploy --stage staging
```

---

**Статус:** ✅ Изменения применены, stack удаление запущено, деплой перезапущен
