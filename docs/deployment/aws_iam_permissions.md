# 🔐 Точный список IAM Permissions для Flow Logic

## 📋 Анализ проекта

На основе `infra/serverless/serverless.yml`, проект использует:
- **Lambda** - для выполнения API
- **API Gateway** - для HTTP endpoints
- **DynamoDB** - для хранения данных (users, subscriptions, assessments, plans, calendar-tasks, progress, user-limits, migrations)
- **S3** - для хранения видео
- **SSM Parameter Store** - для хранения секретов (Cognito IDs, Stripe keys)
- **Cognito** - для аутентификации (только чтение параметров)
- **CloudFormation** - Serverless Framework использует CloudFormation для деплоя
- **IAM** - для создания ролей Lambda функций
- **CloudWatch Logs** - для логирования Lambda функций

---

## ✅ Минимальная IAM Policy (рекомендуется)

Создайте кастомную политику с минимальными правами:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaDeploy",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:ListFunctions",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy",
        "lambda:TagResource",
        "lambda:UntagResource"
      ],
      "Resource": [
        "arn:aws:lambda:*:*:function:flowlogic-*",
        "arn:aws:lambda:*:*:function:*-flowlogic-*"
      ]
    },
    {
      "Sid": "APIGatewayDeploy",
      "Effect": "Allow",
      "Action": [
        "apigateway:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBManage",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:UpdateTable",
        "dynamodb:DeleteTable",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables",
        "dynamodb:TagResource",
        "dynamodb:UntagResource",
        "dynamodb:CreateGlobalSecondaryIndex",
        "dynamodb:UpdateGlobalSecondaryIndex",
        "dynamodb:DeleteGlobalSecondaryIndex"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/flowlogic-*"
      ]
    },
    {
      "Sid": "S3Manage",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetLifecycleConfiguration",
        "s3:PutLifecycleConfiguration",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock",
        "s3:PutBucketTagging",
        "s3:GetBucketTagging"
      ],
      "Resource": [
        "arn:aws:s3:::flowlogic-*"
      ]
    },
    {
      "Sid": "SSMRead",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "ssm:DescribeParameters"
      ],
      "Resource": [
        "arn:aws:ssm:*:*:parameter/flowlogic/*"
      ]
    },
    {
      "Sid": "CognitoRead",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:DescribeUserPool",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:ListUserPools"
      ],
      "Resource": [
        "arn:aws:cognito-idp:*:*:userpool/*"
      ]
    },
    {
      "Sid": "CloudFormationManage",
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
        "arn:aws:cloudformation:*:*:stack/flowlogic-*/*"
      ]
    },
    {
      "Sid": "IAMManageLambdaRoles",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/flowlogic-*",
        "arn:aws:iam::*:role/*-flowlogic-*"
      ]
    },
    {
      "Sid": "CloudWatchLogsManage",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:PutRetentionPolicy"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/aws/lambda/flowlogic-*"
      ]
    },
    {
      "Sid": "EventsManage",
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
        "arn:aws:events:*:*:rule/flowlogic-*"
      ]
    }
  ]
}
```

**Примечание:** Если AWS Policy Editor показывает ошибки, попробуйте:
1. Скопировать JSON из файла `docs/deployment/aws_iam_policy_fixed.json`
2. Или использовать Visual Editor в AWS Console
3. Или проверить, что все кавычки правильные (двойные, не одинарные)

---

## 🚀 Быстрый вариант (используя AWS Managed Policies)

Если хотите использовать готовые политики AWS (менее безопасно, но проще):

1. **AWSLambda_FullAccess** - для Lambda функций
2. **AmazonAPIGatewayAdministrator** - для API Gateway
3. **AmazonDynamoDBFullAccess** - для DynamoDB
4. **AmazonS3FullAccess** - для S3
5. **AmazonSSMFullAccess** - для SSM Parameter Store
6. **AmazonCognitoPowerUser** - для Cognito
7. **CloudFormationFullAccess** - для CloudFormation

**Примечание:** Эти политики дают полный доступ ко всем ресурсам, не только к Flow Logic. Для production рекомендуется использовать кастомную политику выше.

---

## 📝 Пошаговая инструкция

### Вариант 1: Кастомная политика (рекомендуется)

1. **AWS Console** → **IAM** → **Policies** → **Create policy**
2. Выберите **JSON** tab
3. Вставьте JSON политику выше
4. Нажмите **Next**
5. **Policy name**: `FlowLogicGitHubActionsDeployPolicy`
6. **Description**: `Minimal permissions for GitHub Actions to deploy Flow Logic`
7. Нажмите **Create policy**

### Вариант 2: AWS Managed Policies (быстро)

1. **AWS Console** → **IAM** → **Roles** → **Create role**
2. Выберите **Web identity** → **GitHub**
3. Нажмите **Next**
4. В разделе **Permissions** добавьте все 7 политик выше
5. Нажмите **Next**

---

## 🔍 Проверка прав

После создания роли, проверьте права:

```bash
# Проверить attached policies
aws iam list-attached-role-policies --role-name flowlogic-github-actions-role

# Проверить inline policies
aws iam list-role-policies --role-name flowlogic-github-actions-role

# Получить полную политику
aws iam get-role-policy --role-name flowlogic-github-actions-role --policy-name FlowLogicGitHubActionsDeployPolicy
```

---

## ⚠️ Важные замечания

1. **Resource ограничения:**
   - Политика выше ограничивает ресурсы префиксом `flowlogic-*`
   - Это предотвращает случайное изменение других ресурсов

2. **SSM Parameter Store:**
   - Только чтение (`GetParameter`, `GetParameters`)
   - Не нужно создавать/обновлять параметры из GitHub Actions
   - Параметры создаются вручную или через другой процесс

3. **Cognito:**
   - Только чтение (`DescribeUserPool`, `DescribeUserPoolClient`)
   - User Pools создаются вручную или через Terraform
   - GitHub Actions только читает параметры для деплоя

4. **IAM Roles:**
   - Может создавать/управлять только ролями с префиксом `flowlogic-*`
   - Это роли для Lambda функций, создаваемые Serverless Framework

---

## 🔒 Безопасность

### Принцип Least Privilege

Политика выше следует принципу минимальных необходимых прав:
- ✅ Только необходимые действия
- ✅ Ограничение ресурсов по префиксу
- ✅ Нет прав на удаление критических ресурсов (например, Cognito User Pools)

### Дополнительные меры безопасности

1. **Используйте Resource Tags:**
   ```json
   "Condition": {
     "StringEquals": {
       "aws:ResourceTag/Project": "flowlogic"
     }
   }
   ```

2. **Ограничьте по регионам:**
   ```json
   "Condition": {
     "StringEquals": {
       "aws:RequestedRegion": "us-east-1"
     }
   }
   ```

3. **Используйте MFA для критических операций:**
   ```json
   "Condition": {
     "BoolIfExists": {
       "aws:MultiFactorAuthPresent": "true"
     }
   }
   ```

---

## 📚 Дополнительные ресурсы

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Serverless Framework IAM Permissions](https://www.serverless.com/framework/docs/providers/aws/guide/iam)
- [AWS IAM Policy Reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html)

