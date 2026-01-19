# Staging S3 Deployment Bucket Permissions Fix

**Дата:** 2026-01-15  
**Проблема:** "Could not access objects in the deployment bucket" при деплое на staging

---

## Проблема

**Ошибка в логах:**
```
Could not access objects in the deployment bucket. 
Make sure you have sufficient permissions to access it.
```

**Причина:**
IAM роль `flowlogic-ci-cd-staging` не имеет прав на доступ к S3 deployment bucket, который использует Serverless Framework.

**Deployment bucket:** Serverless Framework автоматически создает bucket с именем:
- `serverless-deployment-buckets-{region}` или подобное

**Текущие права:** IAM policy для staging роли разрешает доступ только к `arn:aws:s3:::flowlogic-*`, но не к `serverless-deployment-buckets-*`.

---

## Решение

### 1. Обновлена IAM Policy

**Файл:** `docs/deployment/aws_iam_policy_fixed.json`

**Добавлен новый statement:**
```json
{
  "Sid": "S3DeploymentBucket",
  "Effect": "Allow",
  "Action": [
    "s3:CreateBucket",
    "s3:DeleteBucket",
    "s3:GetBucketLocation",
    "s3:ListBucket",
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:GetBucketVersioning",
    "s3:PutBucketVersioning",
    "s3:GetLifecycleConfiguration",
    "s3:PutLifecycleConfiguration"
  ],
  "Resource": [
    "arn:aws:s3:::serverless-deployment-buckets-*",
    "arn:aws:s3:::serverless-deployment-buckets-*/*"
  ]
}
```

### 2. Скрипт для обновления

**Создан:** `scripts/fix-staging-s3-permissions.sh`

**Использование:**
```bash
# Обновить IAM policy для staging роли
bash scripts/fix-staging-s3-permissions.sh
```

**Что делает скрипт:**
1. Проверяет что IAM роль `flowlogic-ci-cd-staging` существует
2. Обновляет policy `flowlogic-ci-cd-staging-policy` с новыми правами на S3
3. Проверяет что права обновлены корректно

---

## Применение исправления

### Вариант 1: Через скрипт (рекомендуется)

```bash
# 1. Убедиться что AWS CLI настроен
aws sts get-caller-identity

# 2. Запустить скрипт
bash scripts/fix-staging-s3-permissions.sh

# 3. Проверить что права обновлены
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --query 'PolicyDocument.Statement[?Sid==`S3DeploymentBucket`]' \
  --output json | jq '.'
```

### Вариант 2: Вручную через AWS Console

1. Перейти в AWS Console → IAM → Roles → `flowlogic-ci-cd-staging`
2. Открыть вкладку "Permissions"
3. Найти policy `flowlogic-ci-cd-staging-policy`
4. Нажать "Edit"
5. Добавить вышеуказанный statement для S3DeploymentBucket
6. Сохранить

### Вариант 3: Через AWS CLI

```bash
# Обновить policy напрямую
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --policy-document file://docs/deployment/aws_iam_policy_fixed.json
```

---

## Проверка после исправления

```bash
# 1. Проверить что права обновлены
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --query 'PolicyDocument.Statement[?Sid==`S3DeploymentBucket`]' \
  --output json | jq '.'

# 2. Перезапустить деплой на staging
gh workflow run "Backend Deployment" -f stage=staging

# 3. Мониторить выполнение
gh run watch
```

---

## Результат

✅ **После исправления:**
- IAM роль `flowlogic-ci-cd-staging` имеет права на S3 deployment bucket
- Serverless Framework сможет создавать/использовать deployment bucket
- Деплой на staging должен пройти успешно

---

## Альтернативное решение (если проблема сохраняется)

Если проблема сохраняется, можно явно указать deployment bucket в `serverless.yml`:

```yaml
provider:
  deploymentBucket:
    name: flowlogic-deployment-staging-${aws:region}
    serverSideEncryption: AES256
```

Но это требует:
1. Создать bucket заранее
2. Настроить права на конкретный bucket
3. Обновить serverless.yml

---

**Статус:** ✅ Policy обновлена, требуется применение через AWS CLI/Console
