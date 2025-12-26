# 🔐 Настройка AWS Credentials для GitHub Actions

## Проблема

Если вы видите ошибку:
```
❌ AWS credentials not found in secrets!
Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in GitHub Secrets
```

Это означает, что AWS credentials не настроены в GitHub Secrets.

---

## 📋 Пошаговая инструкция

### Шаг 1: Создание IAM User в AWS

1. Войдите в AWS Console: https://console.aws.amazon.com/
2. Перейдите в **IAM** → **Users** → **Create user**
3. Имя пользователя: `flowlogic-github-actions` (или любое другое)
4. Выберите **Provide user access to the AWS Management Console** → **I want to create an IAM user**
5. Нажмите **Next**

### Шаг 2: Настройка прав доступа

1. Выберите **Attach policies directly**
2. Добавьте следующие политики:
   - `AWSLambda_FullAccess` (для деплоя Lambda функций)
   - `AmazonAPIGatewayAdministrator` (для деплоя API Gateway)
   - `AmazonDynamoDBFullAccess` (для создания/управления таблицами)
   - `AmazonS3FullAccess` (для создания S3 bucket)
   - `AmazonSSMFullAccess` (для чтения SSM параметров)
   - `AmazonCognitoPowerUser` (для чтения Cognito параметров)
   - `CloudFormationFullAccess` (Serverless Framework использует CloudFormation)

   **Или создайте кастомную политику** с минимальными правами (см. ниже)

3. Нажмите **Next** → **Create user**

### Шаг 3: Создание Access Key

1. Откройте созданного пользователя
2. Перейдите на вкладку **Security credentials**
3. Нажмите **Create access key**
4. Выберите **Application running outside AWS**
5. Нажмите **Next** → **Create access key**
6. **ВАЖНО**: Сохраните:
   - **Access key ID** (начинается с `AKIA`, 20 символов)
   - **Secret access key** (40 символов, показывается только один раз!)

   ⚠️ **Secret access key показывается только один раз!** Если потеряете, нужно создать новый ключ.

### Шаг 4: Добавление Secrets в GitHub

1. Перейдите в ваш репозиторий: https://github.com/recreomassage-hub/flowlogic.shop
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте два секрета:

   **Secret 1:**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: ваш Access key ID (из шага 3)

   **Secret 2:**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: ваш Secret access key (из шага 3)

5. Нажмите **Add secret** для каждого

---

## 🔒 Минимальная IAM Policy (рекомендуется)

Если вы хотите использовать минимальные права вместо полных доступов, создайте кастомную политику:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "s3:*",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:DescribeUserPoolClient",
        "cloudformation:*",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "logs:*",
        "events:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## ✅ Проверка настройки

После добавления secrets:

1. Перейдите в **Actions** → выберите последний workflow run
2. Нажмите **Re-run jobs** → **Re-run failed jobs**
3. Или сделайте новый commit в `main` branch
4. Workflow должен пройти успешно

---

## 🔍 Отладка

Если workflow все еще падает:

1. **Проверьте, что secrets правильно названы:**
   - `AWS_ACCESS_KEY_ID` (точно так, без пробелов)
   - `AWS_SECRET_ACCESS_KEY` (точно так, без пробелов)

2. **Проверьте, что Access Key активен:**
   - AWS Console → IAM → Users → ваш пользователь → Security credentials
   - Access key должен быть в статусе **Active**

3. **Проверьте права доступа:**
   - Убедитесь, что IAM user имеет все необходимые права (см. Шаг 2)

4. **Проверьте регион:**
   - Убедитесь, что вы используете правильный AWS регион (`us-east-1`)

---

## 🚨 Безопасность

- **Никогда не коммитьте AWS credentials в код!**
- Используйте только GitHub Secrets для хранения credentials
- Регулярно ротируйте Access Keys (каждые 90 дней)
- Используйте минимальные необходимые права (принцип least privilege)
- Рассмотрите использование AWS IAM Roles для GitHub Actions (OIDC) вместо Access Keys

---

## 📚 Дополнительные ресурсы

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Serverless Framework AWS Credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials)



