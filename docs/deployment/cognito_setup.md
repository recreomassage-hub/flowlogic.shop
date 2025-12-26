# 🔐 AWS Cognito Setup Guide

## Проблема

Если endpoints аутентификации возвращают ошибку:
```
InvalidParameterException: Value 'placeholder-id' at 'clientId' failed to satisfy constraint
```

Это означает, что Cognito User Pool и Client не настроены.

---

## 📋 Шаг 1: Создание Cognito User Pool

### Через AWS Console

1. Перейдите в [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Нажмите "Create user pool"
3. Настройки:
   - **Sign-in options:** Email
   - **Password policy:** Минимум 8 символов
   - **MFA:** Optional (можно отключить для dev)
   - **User pool name:** `flowlogic-dev` (для dev), `flowlogic-staging`, `flowlogic-prod`

4. **App integration:**
   - **App client name:** `flowlogic-web-client`
   - **Client secret:** Не требуется (для public clients)
   - **Allowed OAuth flows:** Authorization code grant, Implicit grant
   - **Allowed OAuth scopes:** email, openid, profile

5. Сохраните:
   - **User Pool ID:** `us-east-1_xxxxxxxxx`
   - **App Client ID:** `xxxxxxxxxxxxxxxxxx`

### Через AWS CLI

```bash
# Создать User Pool
aws cognito-idp create-user-pool \
  --pool-name flowlogic-dev \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --region us-east-1

# Создать App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_xxxxxxxxx \
  --client-name flowlogic-web-client \
  --generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1
```

---

## 📋 Шаг 2: Сохранение в SSM Parameter Store

```bash
# User Pool ID
aws ssm put-parameter \
  --name /flowlogic/dev/cognito/user-pool-id \
  --value "us-east-1_xxxxxxxxx" \
  --type String \
  --description "Cognito User Pool ID for dev environment" \
  --region us-east-1

# App Client ID
aws ssm put-parameter \
  --name /flowlogic/dev/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxx" \
  --type String \
  --description "Cognito App Client ID for dev environment" \
  --region us-east-1

# Если параметр уже существует, используйте --overwrite:
aws ssm put-parameter \
  --name /flowlogic/dev/cognito/user-pool-id \
  --value "us-east-1_xxxxxxxxx" \
  --type String \
  --overwrite \
  --region us-east-1

aws ssm put-parameter \
  --name /flowlogic/dev/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxx" \
  --type String \
  --overwrite \
  --region us-east-1
```

---

## 📋 Шаг 3: Проверка

```bash
# Проверить параметры
aws ssm get-parameter --name /flowlogic/dev/cognito/user-pool-id --region us-east-1
aws ssm get-parameter --name /flowlogic/dev/cognito/client-id --region us-east-1

# Тест регистрации
curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/dev/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "wellness_disclaimer_accepted": true
  }'
```

---

## 🔄 Для Staging/Production

Повторите шаги 1-2 для каждого окружения:

### Staging

```bash
# Создать User Pool для staging
aws cognito-idp create-user-pool \
  --pool-name flowlogic-staging \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --region us-east-1

# Создать App Client для staging
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_xxxxxxxxx \
  --client-name flowlogic-staging-client \
  --generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1

# Сохранить в SSM (с --overwrite если уже существует)
aws ssm put-parameter \
  --name /flowlogic/staging/cognito/user-pool-id \
  --value "us-east-1_xxxxxxxxx" \
  --type String \
  --overwrite \
  --region us-east-1

aws ssm put-parameter \
  --name /flowlogic/staging/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxx" \
  --type String \
  --overwrite \
  --region us-east-1
```

### Production

```bash
# Создать User Pool для production
# Примечание: MFA настраивается отдельно после создания User Pool
aws cognito-idp create-user-pool \
  --pool-name flowlogic-prod \
  --policies "PasswordPolicy={MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --region us-east-1

# После создания User Pool, настроить MFA через AWS Console или отдельной командой:
# aws cognito-idp set-user-pool-mfa-config \
#   --user-pool-id us-east-1_xxxxxxxxx \
#   --mfa-configuration OPTIONAL \
#   --sms-mfa-configuration SmsConfiguration={SnsCallerArn=arn:aws:iam::ACCOUNT_ID:role/sns-caller-role} \
#   --region us-east-1

# Создать App Client для production
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_xxxxxxxxx \
  --client-name flowlogic-prod-client \
  --generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1

# Сохранить в SSM (с --overwrite если уже существует)
aws ssm put-parameter \
  --name /flowlogic/prod/cognito/user-pool-id \
  --value "us-east-1_xxxxxxxxx" \
  --type String \
  --overwrite \
  --region us-east-1

aws ssm put-parameter \
  --name /flowlogic/prod/cognito/client-id \
  --value "xxxxxxxxxxxxxxxxxx" \
  --type String \
  --overwrite \
  --region us-east-1
```

**Важно:** Для production используйте более строгие настройки:
- Минимальная длина пароля: 12 символов
- MFA: OPTIONAL или REQUIRED (настраивается отдельно, см. [cognito_mfa_setup.md](./cognito_mfa_setup.md))
- Email verification: REQUIRED
- Account recovery: настроен

**Примечание:** MFA нельзя установить при создании User Pool через CLI без SMS конфигурации. Настройте MFA отдельно через AWS Console или после создания (см. [cognito_mfa_setup.md](./cognito_mfa_setup.md)).

---

## 🛡️ Security Best Practices

### 1. Разделение окружений

- ✅ **Используйте разные User Pools для каждого окружения**
  - `flowlogic-dev` — для разработки
  - `flowlogic-staging` — для тестирования
  - `flowlogic-prod` — для production

### 2. Парольная политика

- ✅ **Production:** Минимум 12 символов, все требования включены
- ✅ **Staging:** Минимум 8 символов (можно тестировать)
- ✅ **Dev:** Минимум 8 символов (для удобства разработки)

### 3. MFA (Multi-Factor Authentication)

- ✅ **Production:** REQUIRED или OPTIONAL (рекомендуется REQUIRED)
- ✅ **Staging:** OPTIONAL (для тестирования MFA flow)
- ✅ **Dev:** OPTIONAL или отключено

### 4. Email Verification

- ✅ **Production:** REQUIRED (обязательная верификация email)
- ✅ **Staging:** REQUIRED (имитация production)
- ✅ **Dev:** OPTIONAL (можно отключить для удобства)

### 5. SSM Parameter Store

- ✅ **Не используйте placeholder значения в production**
- ✅ **Используйте `--overwrite` при обновлении параметров**
- ✅ **Для sensitive данных используйте SecureString (если требуется)**
- ✅ **Регулярно ротируйте Client Secrets (если используются)**

### 6. IAM Permissions

- ✅ **Принцип наименьших привилегий**
- ✅ **Отдельные IAM roles для каждого окружения**
- ✅ **Не используйте admin permissions в production**

### 7. Мониторинг

- ✅ **Настройте CloudWatch Alarms для:**
  - Неудачных попыток входа
  - Подозрительной активности
  - Превышения лимитов

---

## 📚 Дополнительные ресурсы

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Cognito User Pool Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings.html)

