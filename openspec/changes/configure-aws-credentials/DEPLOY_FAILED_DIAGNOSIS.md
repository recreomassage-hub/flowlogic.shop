# Deploy Failed Diagnosis

**Дата:** 2026-01-15  
**Проблема:** Деплой проваливается из-за ResourceExistenceCheck

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

### Обнаружена проблема:

1. **Stack в состоянии UPDATE_ROLLBACK_COMPLETE:**
   - Stack находится в состоянии rollback после неудачного update
   - Многие ресурсы были удалены при rollback
   - В stack осталось только **2 ресурса** (из многих)

2. **Отсутствующие ресурсы:**
   - ❌ `ProcessingDLQ` - отсутствует в stack
   - ❌ `ReliabilityAlertsTopic` - отсутствует в stack
   - ❌ `VideosBucket` - отсутствует в stack
   - ❌ Другие ресурсы удалены при rollback

3. **Template ссылается на отсутствующие ресурсы:**
   - `!GetAtt ProcessingDLQ.Arn` в `serverless.yml` (строка 88, 118)
   - `!Ref ReliabilityAlertsTopic` в `monitoring.yml`
   - ResourceExistenceCheck проверяет эти ресурсы до создания change set
   - Проверка падает, так как ресурсы отсутствуют

---

## Причина

**Почему это происходит:**

1. Предыдущий update провалился
2. CloudFormation откатил изменения (rollback)
3. Некоторые ресурсы были удалены при rollback
4. Stack остался в состоянии `UPDATE_ROLLBACK_COMPLETE`
5. Новый деплой пытается создать change set
6. ResourceExistenceCheck проверяет существование ресурсов из template
7. ProcessingDLQ и другие ресурсы отсутствуют
8. Проверка падает с ResourceExistenceCheck ошибкой

---

## Решение

### Вариант 1: Удалить failed change set и попробовать снова (пробуем сейчас)

```bash
# 1. Удалить failed change set
aws cloudformation delete-change-set \
  --stack-name flowlogic-backend-staging \
  --change-set-name flowlogic-backend-staging-change-set

# 2. Перезапустить деплой
gh workflow run "Backend Deployment" -f stage=staging
```

**Статус:** ✅ Выполнено

### Вариант 2: Восстановить stack через continue-update-rollback (если нужно)

Если вариант 1 не работает:
```bash
# Продолжить rollback до завершения
aws cloudformation continue-update-rollback \
  --stack-name flowlogic-backend-staging

# Дождаться завершения
aws cloudformation wait stack-update-complete \
  --stack-name flowlogic-backend-staging

# Попробовать update снова
serverless deploy --stage staging
```

### Вариант 3: Удалить stack и создать заново (крайний случай)

Если stack в плохом состоянии и ничего не помогает:
```bash
# Удалить stack
aws cloudformation delete-stack --stack-name flowlogic-backend-staging

# Дождаться удаления
aws cloudformation wait stack-delete-complete --stack-name flowlogic-backend-staging

# Создать заново
serverless deploy --stage staging
```

⚠️ **Внимание:** Вариант 3 удалит все ресурсы (Lambda, API Gateway, DynamoDB tables, S3 buckets и т.д.). Использовать только в крайнем случае!

---

## Текущий статус

✅ **Выполнено:**
1. Удален failed change set
2. Перезапущен деплой на staging

⏳ **Ожидание:**
- Результатов нового деплоя
- Если ошибка повторится - попробовать вариант 2 или 3

---

## Мониторинг

```bash
# Проверить статус деплоя
gh run watch

# Проверить статус stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].StackStatus'

# Проверить change sets
aws cloudformation list-change-sets \
  --stack-name flowlogic-backend-staging \
  --query 'Summaries[].{Name:ChangeSetName,Status:Status,Reason:StatusReason}'

# Проверить ресурсы в stack
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[].LogicalResourceId'
```

---

**Статус:** ✅ Failed change set удален, деплой перезапущен, ожидание результатов
