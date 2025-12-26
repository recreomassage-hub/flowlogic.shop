# 🔧 Troubleshooting: AWS OIDC "Request ARN is invalid"

## ❌ Ошибка

```
Error: Could not assume role with OIDC: Request ARN is invalid
```

---

## 🔍 Причины и решения

### 1. Неправильный формат ARN

**Проблема:** ARN роли неправильно скопирован или содержит ошибки.

**Правильный формат ARN:**
```
arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME
```

**Пример:**
```
arn:aws:iam::123456789012:role/flowlogic-github-actions-role
```

**Решение:**
1. Перейдите в AWS Console → IAM → Roles
2. Откройте вашу роль (например, `flowlogic-github-actions-role`)
3. Скопируйте **полный ARN** из раздела "Summary"
4. Убедитесь, что нет лишних пробелов или символов
5. Обновите GitHub Secret `AWS_ROLE_ARN`

---

### 2. Роль не существует

**Проблема:** Роль с указанным именем не существует в AWS.

**Проверка:**
```bash
aws iam get-role --role-name flowlogic-github-actions-role
```

**Решение:**
- Если роль не существует, создайте её (см. `docs/deployment/aws_oidc_setup.md`)
- Убедитесь, что используете правильное имя роли

---

### 3. Trust Policy не настроен для OIDC

**Проблема:** Trust Policy роли не разрешает assume role через OIDC.

**Проверка:**
```bash
aws iam get-role --role-name flowlogic-github-actions-role --query 'Role.AssumeRolePolicyDocument'
```

**Правильный Trust Policy должен содержать:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
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

**Решение:**
1. Обновите Trust Policy роли в AWS Console
2. Убедитесь, что OIDC provider создан: `token.actions.githubusercontent.com`

---

### 4. OIDC Provider не создан

**Проблема:** OIDC Identity Provider для GitHub Actions не создан в AWS.

**Проверка:**
```bash
aws iam list-open-id-connect-providers
```

**Должен вернуть:**
```json
{
  "OpenIDConnectProviderList": [
    {
      "Arn": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
    }
  ]
}
```

**Решение:**
Если OIDC provider не создан, создайте его:

1. AWS Console → IAM → Identity providers → Add provider
2. Provider type: **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Нажмите **Add provider**

Или через AWS CLI:
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

---

### 5. ARN содержит лишние пробелы

**Проблема:** ARN в GitHub Secrets содержит пробелы или переносы строк.

**Решение:**
1. Откройте GitHub Secrets: https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions
2. Откройте `AWS_ROLE_ARN`
3. Удалите все пробелы в начале и конце
4. Убедитесь, что нет переносов строк
5. Сохраните

**Правильный формат:**
```
arn:aws:iam::123456789012:role/flowlogic-github-actions-role
```

**Неправильный формат:**
```
 arn:aws:iam::123456789012:role/flowlogic-github-actions-role 
```
(с пробелами)

---

### 6. Неправильный Account ID

**Проблема:** Account ID в ARN не соответствует вашему AWS аккаунту.

**Проверка Account ID:**
```bash
aws sts get-caller-identity --query Account --output text
```

**Решение:**
- Убедитесь, что Account ID в ARN правильный
- Обновите ARN в GitHub Secrets

---

## ✅ Пошаговая проверка

### Шаг 1: Проверка роли
```bash
# Получить информацию о роли
aws iam get-role --role-name flowlogic-github-actions-role

# Проверить Trust Policy
aws iam get-role --role-name flowlogic-github-actions-role \
  --query 'Role.AssumeRolePolicyDocument' --output json
```

### Шаг 2: Проверка OIDC Provider
```bash
# Список OIDC providers
aws iam list-open-id-connect-providers

# Детали provider
aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
```

### Шаг 3: Проверка ARN в GitHub Secrets
1. Перейдите: https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions
2. Откройте `AWS_ROLE_ARN`
3. Скопируйте значение
4. Проверьте формат: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`

### Шаг 4: Тест assume role локально (опционально)
```bash
# Если у вас есть AWS credentials локально
aws sts assume-role-with-web-identity \
  --role-arn "arn:aws:iam::ACCOUNT_ID:role/flowlogic-github-actions-role" \
  --role-session-name "test-session" \
  --web-identity-token "test-token"
```

---

## 🔄 Альтернатива: Использовать Access Keys

Если OIDC не работает, можно временно использовать Access Keys:

1. Создайте IAM User (см. `docs/deployment/aws_credentials_setup.md`)
2. Добавьте в GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
3. Удалите `AWS_ROLE_ARN` из workflow (или оставьте пустым)

Workflow автоматически использует Access Keys, если `AWS_ROLE_ARN` не указан или пустой.

---

## 📚 Дополнительные ресурсы

- [GitHub Actions OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [Troubleshooting OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/troubleshooting-openid-connect)



