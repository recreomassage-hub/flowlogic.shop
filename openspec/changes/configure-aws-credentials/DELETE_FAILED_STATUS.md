# Stack Delete Failed Status

**Дата:** 2026-01-15  
**Статус:** `DELETE_FAILED` - удаление stack провалилось

---

## Проблема

**Статус stack:** `DELETE_FAILED`  
**Причина:** Удаление stack провалилось, возможно из-за защищенных ресурсов или зависимостей.

---

## Диагностика

### Проверка причин DELETE_FAILED:

```bash
# Проверить события с ошибками удаления
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 10 \
  --query 'StackEvents[?ResourceStatus==`DELETE_FAILED` || contains(ResourceStatusReason, `delete`) || contains(ResourceStatusReason, `Delete`)].{Time:Timestamp,LogicalId:LogicalResourceId,Type:ResourceType,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output json | jq '.'
```

### Возможные причины:

1. **Защищенные ресурсы:**
   - S3 buckets с защитой от удаления
   - DynamoDB tables с защитой от удаления
   - RDS instances с защитой от удаления
   - Другие ресурсы с DeletionProtection

2. **Зависимости:**
   - Ресурсы, на которые ссылаются другие ресурсы вне stack
   - IAM роли, используемые другими сервисами
   - VPC resources, используемые другими ресурсами

3. **Ошибки в ресурсах:**
   - Ресурсы в плохом состоянии
   - Ошибки при удалении ресурсов

---

## Решение

### Вариант 1: Принудительное удаление с retain-resources

Если есть защищенные ресурсы, можно удалить stack с сохранением этих ресурсов:

```bash
# Получить список ресурсов, которые не удаляются
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 50 \
  --query 'StackEvents[?ResourceStatus==`DELETE_FAILED`].LogicalResourceId' \
  --output json | jq -r '.[]' | sort -u > failed-delete-resources.txt

# Удалить stack с сохранением проблемных ресурсов
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging \
  --retain-resources $(cat failed-delete-resources.txt | tr '\n' ' ')
```

### Вариант 2: Удалить проблемные ресурсы вручную

Если знаем какие ресурсы не удаляются:

```bash
# S3 bucket (если защищен)
aws s3api delete-bucket \
  --bucket flowlogic-staging-videos \
  --force

# DynamoDB table (если защищен)
aws dynamodb delete-table \
  --table-name flowlogic-staging-users

# И т.д.
```

### Вариант 3: Игнорировать DELETE_FAILED и создать новый stack

Serverless Framework может создать новый stack с другим именем или обновить существующий.

---

## Текущий статус

✅ **Выполнено:**
1. Удаление stack запущено (провалилось с DELETE_FAILED)
2. Новый деплой запущен - попробует создать stack заново или обновить существующий

⏳ **Ожидание:**
- Результатов нового деплоя
- Если деплой провалится - попробовать принудительное удаление

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
  --query 'StackEvents[].{Time:Timestamp,LogicalId:LogicalResourceId,Status:ResourceStatus,Reason:ResourceStatusReason}' \
  --output table

# Мониторить новый деплой
gh run watch
```

---

**Статус:** ⏳ DELETE_FAILED - новый деплой запущен, ожидание результатов
