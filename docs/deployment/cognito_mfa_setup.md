# 🔐 Настройка MFA для Cognito User Pool

## ⚠️ Важно

1. **При создании User Pool через AWS CLI** нельзя сразу установить `--mfa-configuration OPTIONAL` или `REQUIRED` без SMS конфигурации. MFA настраивается отдельно после создания User Pool.

2. **Ошибка SNS Sandbox:** Если вы видите ошибку "Failed to get SNS sandbox status" при настройке SMS:
   - **Решение (рекомендуется):** Используйте только TOTP (не требует SNS)
   - Или выйдите из SNS sandbox режима (см. раздел "Решение проблемы SNS Sandbox")

---

## 📋 Шаг 1: Создать User Pool (без MFA)

```bash
aws cognito-idp create-user-pool \
  --pool-name flowlogic-prod \
  --policies "PasswordPolicy={MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --region us-east-1
```

Сохраните **User Pool ID** из ответа.

---

## 📋 Шаг 2: Настроить MFA через AWS Console (рекомендуется)

1. Перейдите в [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Выберите ваш User Pool (`flowlogic-prod`)
3. Перейдите в **Sign-in experience** → **Multi-factor authentication**
4. Выберите:
   - **MFA:** Optional или Required
   - **MFA methods:** 
     - ✅ **Authenticator apps (TOTP)** — рекомендуется ⭐
       - Не требует дополнительной настройки
       - Не требует SNS/SES
       - Более безопасно
       - Работает офлайн
     - ⚠️ **SMS message** — требует настройки SNS
       - Требует IAM role для SNS
       - Требует выхода из SNS sandbox режима
       - Дополнительные расходы на SMS
     - ⚠️ **Email message** — требует настройки SES
       - Не работает с "Send email with Cognito"
       - Требует настройки Amazon SES
       - Требует верификации домена/email

**⚠️ Важно:** 
- Если вы видите ошибку "Failed to get SNS sandbox status" → используйте только TOTP
- Если видите "Can't enable email MFA with email sending in Send email with Cognito" → настройте SES отдельно или используйте TOTP

**Рекомендация:** Для начала используйте только **Authenticator apps (TOTP)** — это самый простой и безопасный вариант.

5. Нажмите **Save changes**

---

## 📋 Шаг 3: Настроить MFA через AWS CLI (продвинутый)

### Вариант A: TOTP (рекомендуется, не требует SMS)

```bash
# Установить MFA с TOTP (не требует SMS конфигурации)
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id us-east-1_xxxxxxxxx \
  --mfa-configuration OPTIONAL \
  --software-token-mfa-configuration Enabled=true \
  --region us-east-1
```

### Вариант B: SMS (требует SNS конфигурацию)

**Предварительные требования:**
1. Создать IAM role для SNS с правами `sns:Publish`
2. Настроить SNS для отправки SMS

```bash
# Создать IAM role для SNS
aws iam create-role \
  --role-name CognitoSMSRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "cognito-idp.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Прикрепить политику для SNS
aws iam attach-role-policy \
  --role-name CognitoSMSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

# Получить ARN роли
ROLE_ARN=$(aws iam get-role --role-name CognitoSMSRole --query 'Role.Arn' --output text)

# Настроить MFA с SMS
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id us-east-1_xxxxxxxxx \
  --mfa-configuration OPTIONAL \
  --sms-mfa-configuration "SmsConfiguration={SnsCallerArn=$ROLE_ARN}" \
  --region us-east-1
```

---

## 📋 Шаг 4: Проверка

```bash
# Проверить текущую конфигурацию MFA
aws cognito-idp get-user-pool-mfa-config \
  --user-pool-id us-east-1_xxxxxxxxx \
  --region us-east-1
```

---

## 🔧 Решение проблемы SNS Sandbox

### Проблема
Ошибка: `Failed to get SNS sandbox status for account`

### Решение 1: Использовать только TOTP (рекомендуется)

**Преимущества:**
- ✅ Не требует настройки SNS
- ✅ Не требует выхода из sandbox режима
- ✅ Более безопасно (не зависит от SMS)
- ✅ Работает офлайн (authenticator apps)

**Настройка:**
1. В AWS Console → Cognito → User Pool → MFA
2. Выберите только **TOTP** (снимите галочку с SMS)
3. Сохраните изменения

### Решение 2: Выйти из SNS Sandbox (для SMS)

**Шаг 1: Запросить увеличение лимита**
1. Перейдите в [SNS Console](https://console.aws.amazon.com/sns/)
2. **Text messaging (SMS)** → **Request a spending limit increase**
3. Заполните форму (для production обычно $100-500/месяц)
4. Дождитесь одобрения (обычно 24-48 часов)

**Шаг 2: Настроить Pinpoint (рекомендуется для production)**
1. Перейдите в [Pinpoint Console](https://console.aws.amazon.com/pinpoint/)
2. Создайте проект
3. Настройте SMS channel
4. Используйте Pinpoint в Cognito вместо прямого SNS

**Шаг 3: Настроить IAM Role для SNS**
```bash
# Создать IAM role для Cognito → SNS
aws iam create-role \
  --role-name CognitoSMSRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "cognito-idp.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Прикрепить политику
aws iam attach-role-policy \
  --role-name CognitoSMSRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess
```

---

## 🎯 Рекомендации

### Для Production

- ✅ **Используйте TOTP (Authenticator apps)** — рекомендуется ⭐
  - Не требует SNS/SES
  - Безопаснее и удобнее
  - Работает сразу
- ✅ **MFA: REQUIRED** для критичных операций
- ✅ **MFA: OPTIONAL** для обычных пользователей (рекомендуется)
- ⚠️ **SMS/Email только если:** TOTP недоступен или требуется backup метод
- ⚠️ **Email MFA:** Требует настройки SES (не работает с "Send email with Cognito")

### Для Staging

- ✅ **MFA: OPTIONAL** с TOTP (для тестирования MFA flow)

### Для Dev

- ✅ **MFA: OFF** (для удобства разработки)

---

## 📚 Дополнительные ресурсы

- [Cognito MFA Configuration](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html)
- [TOTP Setup Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa-totp.html)
- [SMS MFA Setup](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa-sms.html)

