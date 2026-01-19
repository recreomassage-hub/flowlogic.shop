# S3 Deployment Bucket Permissions Fix

**Дата:** 2026-01-15  
**Проблема:** "Could not access objects in the deployment bucket" при деплое на staging

---

## Проблема

**Ошибка:**
```
Could not access objects in the deployment bucket. 
Make sure you have sufficient permissions to access it.
```

**Причина:**
IAM роль `flowlogic-ci-cd-staging` не имеет достаточных прав для доступа к S3 deployment bucket, который использует Serverless Framework.

---

## Решение

### 1. Определить deployment bucket

Serverless Framework автоматически создает bucket с именем:
```
serverless-deployment-buckets-{stage}
```

Или можно проверить в CloudFormation stack:
```bash
aws cloudformation describe-stacks \
  --stack-name flowlogic-backend-staging \
  --query 'Stacks[0].Outputs[?OutputKey==`DeploymentBucketName`].OutputValue' \
  --output text
```

### 2. Добавить права на S3 в IAM роль

**IAM роль:** `flowlogic-ci-cd-staging`

**Необходимые права:**
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket",
    "s3:GetBucketLocation",
    "s3:CreateBucket"
  ],
  "Resource": [
    "arn:aws:s3:::serverless-deployment-buckets-*",
    "arn:aws:s3:::serverless-deployment-buckets-*/*"
  ]
}
```

### 3. Обновить IAM политику

**Через AWS Console:**
1. Перейти в IAM → Roles → `flowlogic-ci-cd-staging`
2. Открыть вкладку "Permissions"
3. Найти policy для CI/CD (например, `flowlogic-ci-cd-staging-policy`)
4. Нажать "Edit"
5. Добавить вышеуказанные права на S3
6. Сохранить

**Через AWS CLI:**
```bash
# Получить текущую policy
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  > staging-policy.json

# Отредактировать policy (добавить S3 права)
# ...

# Обновить policy
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --policy-document file://staging-policy.json
```

---

## Полная IAM Policy для staging

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "iam:*",
        "logs:*",
        "s3:*",
        "events:*",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:CreateBucket"
      ],
      "Resource": [
        "arn:aws:s3:::serverless-deployment-buckets-*",
        "arn:aws:s3:::serverless-deployment-buckets-*/*"
      ]
    }
  ]
}
```

---

## Альтернативное решение: Использовать кастомный deployment bucket

Если не хотите давать широкие права на S3, можно указать конкретный bucket в `serverless.yml`:

```yaml
provider:
  deploymentBucket:
    name: flowlogic-deployment-staging
    serverSideEncryption: AES256
```

Но тогда нужно:
1. Создать bucket заранее
2. Настроить права на конкретный bucket
3. Обновить serverless.yml

---

## Проверка после исправления

```bash
# 1. Проверить что IAM роль обновлена
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  | jq '.PolicyDocument.Statement[] | select(.Action[]? == "s3:*" or .Action[]? == "s3:GetObject")'

# 2. Запустить деплой снова
gh workflow run "Backend Deployment" -f stage=staging

# 3. Проверить что deployment bucket доступен
```

---

**Статус:** Требуется обновление IAM policy для `flowlogic-ci-cd-staging`
