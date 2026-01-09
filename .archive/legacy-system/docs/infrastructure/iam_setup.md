# 🔐 IAM Setup Guide — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-23  
**Для:** DevOps Engineers, Infrastructure Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [IAM User for CI/CD](#iam-user-for-cicd)
3. [IAM Roles for Lambda Functions](#iam-roles-for-lambda-functions)
4. [IAM Policies](#iam-policies)
5. [SSM Parameter Store Access](#ssm-parameter-store-access)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Flow Logic использует следующие AWS сервисы, требующие IAM настроек:

- **Lambda** — Backend API functions
- **DynamoDB** — 8 таблиц (users, subscriptions, assessments, plans, calendar-tasks, progress, user-limits, migrations)
- **S3** — Video storage bucket
- **Cognito** — User authentication
- **API Gateway** — REST API endpoints
- **CloudWatch** — Logging and monitoring
- **SSM Parameter Store** — Secrets management
- **EventBridge** — Event-driven architecture
- **SQS** — Message queue (FIFO)

---

## 👤 IAM User for CI/CD

### Создание IAM пользователя для GitHub Actions

Этот пользователь используется для деплоя через GitHub Actions и Serverless Framework.

#### Шаг 1: Создание пользователя

```bash
# Создайте IAM пользователя
aws iam create-user \
  --user-name flowlogic-cicd-user \
  --tags Key=Project,Value=FlowLogic Key=Environment,Value=All
```

#### Шаг 2: Создание политики для CI/CD

Создайте файл `infra/iam/cicd-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaDeployment",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunction",
        "lambda:ListFunctions",
        "lambda:DeleteFunction",
        "lambda:PublishVersion",
        "lambda:CreateAlias",
        "lambda:UpdateAlias",
        "lambda:GetAlias",
        "lambda:ListAliases"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:*:function:flowlogic-*"
      ]
    },
    {
      "Sid": "APIGatewayDeployment",
      "Effect": "Allow",
      "Action": [
        "apigateway:GET",
        "apigateway:POST",
        "apigateway:PUT",
        "apigateway:PATCH",
        "apigateway:DELETE",
        "apigateway:PUT",
        "apigateway:POST"
      ],
      "Resource": [
        "arn:aws:apigateway:us-east-1::/restapis/*",
        "arn:aws:apigateway:us-east-1::/restapis/*/*"
      ]
    },
    {
      "Sid": "DynamoDBManagement",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:UpdateTable",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables",
        "dynamodb:DeleteTable",
        "dynamodb:TagResource"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/flowlogic-*"
      ]
    },
    {
      "Sid": "S3BucketManagement",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:PutBucketCors",
        "s3:GetBucketCors",
        "s3:PutBucketVersioning",
        "s3:GetBucketVersioning",
        "s3:ListBucket",
        "s3:DeleteBucket"
      ],
      "Resource": [
        "arn:aws:s3:::flowlogic-*"
      ]
    },
    {
      "Sid": "CloudFormationDeployment",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ValidateTemplate",
        "cloudformation:ListStacks"
      ],
      "Resource": [
        "arn:aws:cloudformation:us-east-1:*:stack/flowlogic-*/*"
      ]
    },
    {
      "Sid": "IAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:PassRole",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies"
      ],
      "Resource": [
        "arn:aws:iam::*:role/flowlogic-*",
        "arn:aws:iam::*:role/*flowlogic*"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DescribeLogGroups",
        "logs:DeleteLogGroup"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:*:log-group:/aws/lambda/flowlogic-*"
      ]
    },
    {
      "Sid": "SSMReadOnly",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:DescribeParameters"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:*:parameter/flowlogic/*"
      ]
    },
    {
      "Sid": "EventBridgeManagement",
      "Effect": "Allow",
      "Action": [
        "events:PutRule",
        "events:DeleteRule",
        "events:DescribeRule",
        "events:PutTargets",
        "events:RemoveTargets",
        "events:ListTargetsByRule"
      ],
      "Resource": [
        "arn:aws:events:us-east-1:*:rule/flowlogic-*"
      ]
    },
    {
      "Sid": "SQSManagement",
      "Effect": "Allow",
      "Action": [
        "sqs:CreateQueue",
        "sqs:DeleteQueue",
        "sqs:GetQueueAttributes",
        "sqs:SetQueueAttributes",
        "sqs:TagQueue"
      ],
      "Resource": [
        "arn:aws:sqs:us-east-1:*:flowlogic-*"
      ]
    }
  ]
}
```

#### Шаг 3: Применение политики

```bash
# Создайте политику
aws iam create-policy \
  --policy-name FlowLogic-CICD-Policy \
  --policy-document file://infra/iam/cicd-policy.json \
  --description "Policy for CI/CD deployment of Flow Logic platform"

# Прикрепите политику к пользователю
aws iam attach-user-policy \
  --user-name flowlogic-cicd-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/FlowLogic-CICD-Policy
```

#### Шаг 4: Создание Access Keys

```bash
# Создайте Access Key
aws iam create-access-key --user-name flowlogic-cicd-user

# Сохраните вывод:
# {
#   "AccessKey": {
#     "UserName": "flowlogic-cicd-user",
#     "AccessKeyId": "AKIA...",
#     "Status": "Active",
#     "SecretAccessKey": "...",
#     "CreateDate": "..."
#   }
# }
```

#### Шаг 5: Добавление в GitHub Secrets

Добавьте в GitHub Repository Settings → Secrets and variables → Actions:

- `AWS_ACCESS_KEY_ID_DEV` = AccessKeyId
- `AWS_SECRET_ACCESS_KEY_DEV` = SecretAccessKey
- `AWS_ACCESS_KEY_ID_STAGING` = AccessKeyId (можно использовать тот же)
- `AWS_SECRET_ACCESS_KEY_STAGING` = SecretAccessKey
- `AWS_ACCESS_KEY_ID_PROD` = AccessKeyId (можно использовать тот же)
- `AWS_SECRET_ACCESS_KEY_PROD` = SecretAccessKey

**⚠️ ВАЖНО:** Для production рекомендуется создать отдельного пользователя с более ограниченными правами.

---

## 🔄 IAM Roles for Lambda Functions

IAM роли для Lambda функций уже настроены в `serverless.yml`. Вот полная политика:

### Lambda Execution Role Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/flowlogic-*",
        "arn:aws:dynamodb:us-east-1:*:table/flowlogic-*/index/*"
      ]
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectVersion"
      ],
      "Resource": [
        "arn:aws:s3:::flowlogic-*-videos/*"
      ]
    },
    {
      "Sid": "S3PresignedURL",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::flowlogic-*-videos/*"
      ],
      "Condition": {
        "StringEquals": {
          "s3:authType": "REST-QUERY-STRING"
        }
      }
    },
    {
      "Sid": "CognitoAccess",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:ListUsers",
        "cognito-idp:AdminSetUserPassword"
      ],
      "Resource": [
        "arn:aws:cognito-idp:us-east-1:*:userpool/*"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:*:*"
      ]
    },
    {
      "Sid": "SSMParameterStore",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:*:parameter/flowlogic/*"
      ]
    },
    {
      "Sid": "EventBridgePublish",
      "Effect": "Allow",
      "Action": [
        "events:PutEvents"
      ],
      "Resource": [
        "arn:aws:events:us-east-1:*:event-bus/default"
      ]
    },
    {
      "Sid": "SQSSendMessage",
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": [
        "arn:aws:sqs:us-east-1:*:flowlogic-*"
      ]
    }
  ]
}
```

Эта политика автоматически применяется через `serverless.yml`:

```yaml
provider:
  iam:
    role:
      statements:
        # Политики из serverless.yml
```

---

## 🔐 SSM Parameter Store Access

### Настройка доступа к секретам

SSM Parameter Store используется для хранения секретов (Cognito IDs, Stripe keys).

#### Создание параметров

```bash
# Cognito User Pool ID
aws ssm put-parameter \
  --name /flowlogic/dev/cognito/user-pool-id \
  --value "us-east-1_XXXXXXXXX" \
  --type String \
  --description "Cognito User Pool ID for dev environment"

# Cognito Client ID
aws ssm put-parameter \
  --name /flowlogic/dev/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxx" \
  --type String \
  --description "Cognito Client ID for dev environment"

# Stripe Secret Key (SecureString)
aws ssm put-parameter \
  --name /flowlogic/dev/stripe/secret-key \
  --value "sk_test_..." \
  --type SecureString \
  --description "Stripe Secret Key for dev environment" \
  --key-id alias/aws/ssm
```

#### Политика доступа для Lambda

Доступ к SSM уже настроен в Lambda role policy (см. выше).

#### Политика доступа для CI/CD пользователя

CI/CD пользователь должен иметь доступ только на чтение:

```json
{
  "Sid": "SSMReadOnly",
  "Effect": "Allow",
  "Action": [
    "ssm:GetParameter",
    "ssm:GetParameters",
    "ssm:DescribeParameters"
  ],
  "Resource": [
    "arn:aws:ssm:us-east-1:*:parameter/flowlogic/*"
  ]
}
```

---

## 🛡️ Security Best Practices

### 1. Principle of Least Privilege

- ✅ Используйте минимальные необходимые права
- ✅ Разделяйте права для dev/staging/prod
- ✅ Не используйте `*` в Resource, если возможно

### 2. Разделение окружений

Рекомендуется создать отдельных пользователей для каждого окружения:

```bash
# Dev environment
flowlogic-cicd-user-dev

# Staging environment
flowlogic-cicd-user-staging

# Production environment
flowlogic-cicd-user-prod
```

### 3. Ротация Access Keys

- Ротация каждые 90 дней (см. `docs/security/policies.md`)
- Используйте AWS IAM Access Analyzer для обнаружения неиспользуемых ключей

### 4. MFA для Production

Для production окружения рекомендуется включить MFA:

```bash
aws iam enable-mfa-device \
  --user-name flowlogic-cicd-user-prod \
  --serial-number arn:aws:iam::ACCOUNT_ID:mfa/flowlogic-cicd-user-prod \
  --authentication-code-1 123456 \
  --authentication-code-2 654321
```

### 5. CloudTrail Logging

Включите CloudTrail для аудита:

```bash
aws cloudtrail create-trail \
  --name flowlogic-audit-trail \
  --s3-bucket-name flowlogic-audit-logs
```

---

## 🔧 Troubleshooting

### Проблема: "Access Denied" при деплое

**Решение:**
1. Проверьте, что Access Keys правильные:
   ```bash
   aws sts get-caller-identity
   ```

2. Проверьте политики пользователя:
   ```bash
   aws iam list-attached-user-policies --user-name flowlogic-cicd-user
   aws iam list-user-policies --user-name flowlogic-cicd-user
   ```

3. Проверьте, что политики имеют правильные Resource ARNs

### Проблема: Lambda не может получить доступ к DynamoDB

**Решение:**
1. Проверьте IAM роль Lambda функции:
   ```bash
   aws lambda get-function --function-name flowlogic-dev-api | jq .Configuration.Role
   ```

2. Проверьте политики роли:
   ```bash
   aws iam list-attached-role-policies --role-name <role-name>
   ```

3. Убедитесь, что Resource ARNs правильные (включают stage)

### Проблема: Не могу прочитать SSM параметры

**Решение:**
1. Проверьте, что параметр существует:
   ```bash
   aws ssm get-parameter --name /flowlogic/dev/cognito/user-pool-id
   ```

2. Проверьте права доступа:
   ```bash
   aws iam simulate-principal-policy \
     --policy-source-arn arn:aws:iam::ACCOUNT_ID:role/flowlogic-dev-api \
     --action-names ssm:GetParameter \
     --resource-arns arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/flowlogic/dev/cognito/user-pool-id
   ```

---

## 📋 Quick Setup Checklist

- [ ] Создан IAM пользователь `flowlogic-cicd-user`
- [ ] Создана и применена политика `FlowLogic-CICD-Policy`
- [ ] Созданы Access Keys
- [ ] Access Keys добавлены в GitHub Secrets
- [ ] SSM параметры созданы для всех окружений
- [ ] Lambda роли настроены через `serverless.yml`
- [ ] CloudTrail включен для аудита
- [ ] MFA включен для production пользователя (опционально)

---

## 📚 Дополнительные ресурсы

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Serverless Framework IAM](https://www.serverless.com/framework/docs/providers/aws/guide/iam)
- [Security Policies](docs/security/policies.md)
- [Deployment Guide](docs/deployment_guide.md)

---

**Обновлено:** 2025-12-23  
**Версия:** 1.0







