# Исправление DELETE_FAILED в Staging

## Проблема

Stack `flowlogic-backend-staging` застрял в состоянии `DELETE_FAILED`, что блокировало новые деплои.

## Выполненные исправления

### 1. Восстановлен правильный service name
- ✅ Изменено: `service: flowlogic-backend-staging-v2` → `service: flowlogic-backend`
- ✅ Все ресурсы теперь используют `${self:provider.stage}` вместо hardcoded имен

### 2. Обновлена конфигурация
- ✅ Установлены плагины: `serverless-prune-plugin`, `serverless-offline`
- ✅ Настроена автоматическая очистка старых версий Lambda
- ✅ Добавлены OpenSpec правила для валидации конфигурации

### 3. Настроен pre-deploy проверки
- ✅ Валидация serverless.yml перед каждым deploy
- ✅ Bugbot проверка перед deploy

## Следующие шаги

### Шаг 1: Проверить состояние DELETE_FAILED stack

**Быстрая проверка (рекомендуется):**
```bash
./scripts/check-stack-status.sh staging us-east-1
```

**Или вручную:**
```bash
# Проверить статус старого stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging-staging \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus' \
  --output text

# Проверить ресурсы в DELETE_FAILED
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging-staging \
  --region us-east-1 \
  --query 'StackResources[?ResourceStatus==`DELETE_FAILED`]' \
  --output table
```

### Шаг 2: Очистить DELETE_FAILED ресурсы (если есть)

**Автоматическая очистка (рекомендуется):**
```bash
./scripts/cleanup-delete-failed-stack.sh flowlogic-backend-staging-staging us-east-1
```

Скрипт интерактивно:
- Найдет все ресурсы в DELETE_FAILED
- Покажет детали каждого ресурса
- Предложит удалить каждый ресурс вручную (S3, DynamoDB, Lambda)
- Попытается удалить stack снова

**Или вручную:**
```bash
# Найти ресурсы, которые не удалились
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging-staging \
  --region us-east-1 \
  --query 'StackResources[?ResourceStatus==`DELETE_FAILED`].{LogicalId:LogicalResourceId,Type:ResourceType,PhysicalId:PhysicalResourceId}' \
  --output table

# Для каждого ресурса:
# 1. Если это S3 bucket - удалить вручную через Console или CLI
# 2. Если это DynamoDB table - проверить, что она пустая, затем удалить
# 3. Если это Lambda - проверить зависимости, затем удалить
```

### Шаг 3: Удалить DELETE_FAILED stack (если нужно)

**Вариант A: Игнорировать и продолжить (рекомендуется)**

Serverless Framework v4 может работать с существующим stack, даже если он в DELETE_FAILED. Просто продолжить деплой:

```bash
cd infra/serverless
npm run deploy:staging
```

**Вариант B: Принудительно удалить stack**

```bash
# Удалить stack, игнорируя ошибки
aws cloudformation delete-stack \
  --stack-name flowlogic-backend-staging-staging \
  --region us-east-1

# Подождать завершения
aws cloudformation wait stack-delete-complete \
  --stack-name flowlogic-backend-staging-staging \
  --region us-east-1
```

### Шаг 4: Протестировать deploy в staging

```bash
cd infra/serverless

# 1. Валидация конфигурации (автоматически)
npm run deploy:staging

# Или вручную:
# 1. Валидация
./scripts/validate-serverless-config.sh

# 2. Bugbot проверка
./scripts/bug-hunter.sh --mode fast

# 3. Deploy
serverless deploy --stage staging
```

### Шаг 5: Проверить результат

```bash
# Проверить статус нового stack
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --region us-east-1 \
  --query 'Stacks[0].{Status:StackStatus,Service:Tags[?Key==`service`].Value|[0]}' \
  --output table

# Проверить, что нет DELETE_FAILED
aws cloudformation describe-stack-resources \
  --stack-name flowlogic-backend-staging \
  --region us-east-1 \
  --query 'StackResources[?ResourceStatus==`DELETE_FAILED`]' \
  --output table
```

## Ожидаемый результат

После выполнения шагов:

1. ✅ Stack `flowlogic-backend-staging` в состоянии `CREATE_COMPLETE` или `UPDATE_COMPLETE`
2. ✅ Нет ресурсов в состоянии `DELETE_FAILED`
3. ✅ Service name: `flowlogic-backend` (не `flowlogic-backend-staging-v2`)
4. ✅ Все ресурсы используют `${self:provider.stage}` для именования
5. ✅ Deploy проходит без ошибок

## Troubleshooting

### Если deploy все еще проваливается:

1. **Проверить логи CloudFormation:**
```bash
aws cloudformation describe-stack-events \
  --stack-name flowlogic-backend-staging \
  --region us-east-1 \
  --max-items 20 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`]' \
  --output table
```

2. **Проверить IAM permissions:**
```bash
# Убедиться, что у пользователя/роли есть права на создание ресурсов
aws sts get-caller-identity
```

3. **Проверить конфликты имен:**
```bash
# Проверить, не заняты ли имена ресурсов
aws s3 ls | grep flowlogic-staging
aws dynamodb list-tables | grep flowlogic-staging
```

## Ссылки

- OpenSpec правила: `openspec/specs/infrastructure/serverless-rules.md`
- Валидация скрипт: `scripts/validate-serverless-config.sh`
- Bugbot: `scripts/bug-hunter.sh`
