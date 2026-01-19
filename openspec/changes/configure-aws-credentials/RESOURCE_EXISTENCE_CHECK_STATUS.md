# ResourceExistenceCheck Status

**Дата:** 2026-01-15  
**Статус:** ⏳ В процессе диагностики

---

## Проблема

**Ошибка:**
```
Could not create Change Set "flowlogic-backend-staging-change-set" due to: 
The following hook(s)/validation failed: [AWS::EarlyValidation::ResourceExistenceCheck].
```

**Статус stack:** `UPDATE_ROLLBACK_COMPLETE`  
**Причина:** Stack находится в состоянии rollback после неудачного update.

---

## Действия

### ✅ Выполнено:

1. **Удален failed change set:**
   ```bash
   aws cloudformation delete-change-set \
     --stack-name flowlogic-backend-staging \
     --change-set-name flowlogic-backend-staging-change-set
   ```

2. **Проверены SSM параметры:**
   - ✅ `/flowlogic/staging/cognito/user-pool-id` - существует
   - ✅ `/flowlogic/staging/cognito/client-id` - существует

3. **Проверены S3 buckets:**
   - ✅ Deployment bucket: `flowlogic-backend-staging-serverlessdeploymentbuck-hl2wzrvp2vjw` - существует
   - ⚠️ Videos bucket: `flowlogic-staging-videos` - требуется проверка

4. **Перезапущен деплой:**
   - Деплой на staging перезапущен после удаления failed change set

---

## Диагностика

### Stack в состоянии UPDATE_ROLLBACK_COMPLETE

**Проблема:** Stack находится в состоянии rollback после неудачного update. Это означает:
1. Update начался
2. Обнаружена ошибка
3. CloudFormation откатил изменения
4. Stack в состоянии `UPDATE_ROLLBACK_COMPLETE`

**Решение:** 
- Удалить failed change set (выполнено ✅)
- Попробовать новый деплой (в процессе ⏳)

### ResourceExistenceCheck

**Что это:** Early validation hook в CloudFormation, который проверяет существование внешних ресурсов **до** создания change set.

**Возможные причины:**
1. SSM Parameter не существует (проверено ✅)
2. S3 Bucket не существует (требуется проверка)
3. IAM Role не существует (требуется проверка)
4. Другие внешние ресурсы

---

## Проверка ресурсов

### SSM Parameters:
```bash
aws ssm get-parameter --name "/flowlogic/staging/cognito/user-pool-id"
aws ssm get-parameter --name "/flowlogic/staging/cognito/client-id"
aws ssm get-parameter --name "/flowlogic/staging/stripe/secret-key"
```
✅ Все параметры существуют

### S3 Buckets:
```bash
# Deployment bucket (создается Serverless Framework автоматически)
aws s3 ls s3://flowlogic-backend-staging-serverlessdeploymentbuck-hl2wzrvp2vjw

# Videos bucket (создается через CloudFormation)
aws s3 ls s3://flowlogic-staging-videos
```

### CloudFormation Resources:
```bash
# Проверить ресурсы в stack
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --query 'StackResources[?ResourceType==`AWS::S3::Bucket`]'
```

---

## Следующие шаги

1. ⏳ Дождаться результатов нового деплоя
2. ⬜ Если ошибка повторится - проверить детали в событиях CloudFormation
3. ⬜ Проверить что все внешние ресурсы существуют
4. ⬜ Возможно, нужно восстановить stack из предыдущего состояния

---

## Мониторинг

```bash
# Мониторить выполнение workflow
gh run watch

# Проверить статус stack
aws cloudformation describe-stacks --stack-name flowlogic-backend-staging --query 'Stacks[0].StackStatus'

# Проверить события
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --max-items 10 \
  --query 'StackEvents[].{Time:Timestamp,Status:ResourceStatus,Reason:ResourceStatusReason}'
```

---

**Статус:** ⏳ Деплой перезапущен, ожидание результатов
