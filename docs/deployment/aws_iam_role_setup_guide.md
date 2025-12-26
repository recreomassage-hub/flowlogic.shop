# 📝 Руководство по созданию IAM Role для Flow Logic

## ✅ Шаг 1: Trust Policy (уже настроено)

Trust Policy для OIDC уже настроен. Проверьте, что он содержит:

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

---

## ✅ Шаг 2: Permissions Policy (уже прикреплено)

Политика `FlowLogicGitHubActionsDeployPolicy` уже прикреплена. ✅

---

## 📋 Шаг 3: Role Details

### Role name
```
flowlogic-github-actions-role
```

**Альтернативные варианты:**
- `FlowLogicGitHubActionsRole`
- `flowlogic-ci-cd-role`
- `github-actions-flowlogic-deploy`

**Ограничения:**
- Максимум 64 символа
- Только буквы, цифры и `+=,.@-_`

### Description
```
IAM Role for GitHub Actions to deploy Flow Logic backend via OIDC. Allows CI/CD pipeline to deploy Lambda functions, API Gateway, DynamoDB tables, S3 buckets, and read SSM parameters.
```

**Короткий вариант:**
```
GitHub Actions OIDC role for Flow Logic CI/CD deployment.
```

**Ограничения:**
- Максимум 1000 символов
- Разрешены буквы, цифры, пробелы и специальные символы

---

## 🏷️ Шаг 4: Tags (опционально, но рекомендуется)

Добавьте теги для организации:

| Key | Value | Описание |
|-----|-------|----------|
| `Project` | `flowlogic` | Идентификация проекта |
| `Purpose` | `ci-cd-deployment` | Назначение роли |
| `ManagedBy` | `github-actions` | Управляется через GitHub Actions |
| `Environment` | `all` | Применяется ко всем окружениям |

**Минимальный набор:**
- `Project: flowlogic`
- `Purpose: ci-cd-deployment`

---

## ✅ Шаг 5: Review and Create

1. Проверьте все поля:
   - ✅ Role name заполнен
   - ✅ Description заполнен
   - ✅ Trust Policy настроен (OIDC)
   - ✅ Permissions Policy прикреплена
   - ✅ Tags добавлены (опционально)

2. Нажмите **Create role**

---

## 📋 После создания

1. **Скопируйте Role ARN:**
   - Он будет выглядеть как: `arn:aws:iam::ACCOUNT_ID:role/flowlogic-github-actions-role`
   - **ВАЖНО:** Сохраните этот ARN!

2. **Добавьте в GitHub Secrets:**
   - Перейдите: https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions
   - Нажмите **New repository secret**
   - Name: `AWS_ROLE_ARN`
   - Value: `arn:aws:iam::ACCOUNT_ID:role/flowlogic-github-actions-role`
   - Нажмите **Add secret**

---

## 🔍 Проверка

После создания роли, проверьте:

```bash
# Получить информацию о роли
aws iam get-role --role-name flowlogic-github-actions-role

# Проверить Trust Policy
aws iam get-role --role-name flowlogic-github-actions-role --query 'Role.AssumeRolePolicyDocument'

# Проверить прикрепленные политики
aws iam list-attached-role-policies --role-name flowlogic-github-actions-role
```

---

## 📚 Следующие шаги

1. ✅ Role создана
2. ✅ Role ARN скопирован
3. ➡️ Добавьте `AWS_ROLE_ARN` в GitHub Secrets
4. ➡️ Проверьте workflow в GitHub Actions
5. ➡️ Deploy должен пройти успешно!

---

## ⚠️ Важные замечания

1. **Trust Policy:**
   - Убедитесь, что `sub` содержит правильный репозиторий: `repo:recreomassage-hub/flowlogic.shop:*`
   - Для более строгой безопасности можно ограничить только `main` и `develop` ветки

2. **Permissions:**
   - Роль имеет минимальные необходимые права
   - Все ресурсы ограничены префиксом `flowlogic-*`

3. **Безопасность:**
   - Роль может быть использована только из указанного репозитория
   - Credentials генерируются автоматически и временные
   - Не нужно хранить Access Keys



