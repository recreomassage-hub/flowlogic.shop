# 🔐 Настройка AWS через OIDC (рекомендуется)

## 🎯 Преимущества OIDC над Access Keys

- ✅ **Более безопасно**: не нужно хранить долгоживущие Access Keys
- ✅ **Автоматическая ротация**: credentials генерируются автоматически
- ✅ **Временные credentials**: действительны только во время выполнения workflow
- ✅ **Лучшая аудитория**: можно видеть, какой workflow использовал роль

---

## 📋 Пошаговая инструкция

### Шаг 1: Создание IAM Role для GitHub Actions

1. Войдите в AWS Console: https://console.aws.amazon.com/
2. Перейдите в **IAM** → **Roles** → **Create role**
3. Выберите **Web identity**
4. В разделе **Identity provider**:
   - Выберите **GitHub** (если уже настроен) или нажмите **Add identity provider**
   - Если нужно добавить:
     - **Provider type**: OpenID Connect
     - **Provider URL**: `https://token.actions.githubusercontent.com`
     - **Audience**: `sts.amazonaws.com`
     - Нажмите **Add identity provider**
5. В разделе **Audience** выберите `sts.amazonaws.com`
6. Нажмите **Next**

### Шаг 2: Настройка Trust Policy

1. В разделе **Permissions** добавьте те же политики, что и для IAM User:
   - `AWSLambda_FullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonSSMFullAccess`
   - `AmazonCognitoPowerUser`
   - `CloudFormationFullAccess`

   Или используйте кастомную политику (см. ниже)

2. Нажмите **Next**

### Шаг 3: Настройка Trust Policy (важно!)

1. В разделе **Role name** введите: `flowlogic-github-actions-role`
2. В разделе **Description** введите:
   ```
   IAM Role for GitHub Actions to deploy Flow Logic backend via OIDC. Allows CI/CD pipeline to deploy Lambda functions, API Gateway, DynamoDB tables, S3 buckets, and read SSM parameters.
   ```
2. В разделе **Trust policy** замените JSON на:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:recreomassage-hub/flowlogic.shop:*"
        }
      }
    }
  ]
}
```

**Важно:**
- Замените `YOUR_ACCOUNT_ID` на ваш AWS Account ID
- `repo:recreomassage-hub/flowlogic.shop:*` означает, что роль может быть использована только для этого репозитория
- Для более строгой безопасности можно указать конкретные ветки:
  ```json
  "token.actions.githubusercontent.com:sub": [
    "repo:recreomassage-hub/flowlogic.shop:ref:refs/heads/main",
    "repo:recreomassage-hub/flowlogic.shop:ref:refs/heads/develop"
  ]
  ```

3. Нажмите **Create role**

### Шаг 4: Получение Role ARN

1. Откройте созданную роль
2. Скопируйте **ARN** (например: `arn:aws:iam::123456789012:role/flowlogic-github-actions-role`)

### Шаг 5: Добавление в GitHub Secrets

1. Перейдите в ваш репозиторий: https://github.com/recreomassage-hub/flowlogic.shop
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте:
   - Name: `AWS_ROLE_ARN`
   - Value: ARN вашей роли (из шага 4)

**Примечание:** Если вы используете OIDC, вам НЕ нужны `AWS_ACCESS_KEY_ID` и `AWS_SECRET_ACCESS_KEY`!

---

## 🔒 Минимальная IAM Policy для Role

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
        "events:*",
        "sts:AssumeRole"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## ✅ Проверка настройки

После настройки:

1. Сделайте commit в `main` branch
2. Проверьте workflow в GitHub Actions
3. Workflow должен использовать роль автоматически

---

## 🔍 Отладка

Если workflow падает с ошибкой:

1. **Проверьте Trust Policy:**
   - Убедитесь, что `sub` содержит правильный репозиторий
   - Проверьте, что `aud` равен `sts.amazonaws.com`

2. **Проверьте Role ARN в GitHub Secrets:**
   - Должен быть полный ARN: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`

3. **Проверьте права роли:**
   - Убедитесь, что роль имеет все необходимые права

---

## 📚 Дополнительные ресурсы

- **Troubleshooting:** `docs/deployment/troubleshooting/aws_credentials.md` - Диагностика проблем с OIDC
- **IAM Setup:** `docs/deployment/aws_iam_setup.md` - Полная настройка IAM
- **Credentials Setup:** `docs/deployment/aws_credentials_setup.md` - Настройка Access Keys (fallback)
- [GitHub Actions OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)

