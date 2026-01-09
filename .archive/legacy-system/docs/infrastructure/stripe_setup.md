# 💳 Stripe Setup Guide — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-23  
**Для:** DevOps Engineers, Backend Developers

---

## 📋 Текущая настройка

### В serverless.yml (строка 28)

```yaml
STRIPE_SECRET_KEY: ${ssm:/flowlogic/${self:provider.stage}/stripe/secret-key, true}
```

**Что это означает:**
- Используется AWS SSM Parameter Store
- Путь зависит от stage:
  - `dev`: `/flowlogic/dev/stripe/secret-key`
  - `staging`: `/flowlogic/staging/stripe/secret-key`
  - `prod`: `/flowlogic/prod/stripe/secret-key`
- `, true` означает, что параметр зашифрован (SecureString) и требует расшифровки

**⚠️ ВАЖНО:** В Serverless Framework 3.x синтаксис для SecureString: `${ssm:/path/to/param, true}` (запятая, а не `~true`)

---

## ✅ Вариант 1: Использовать SSM Parameter Store (рекомендуется)

### Шаг 1: Получите Stripe ключ

1. Войдите в [Stripe Dashboard](https://dashboard.stripe.com/)
2. Перейдите в Developers → API keys
3. Скопируйте **Secret key** (начинается с `sk_test_` для тестового режима или `sk_live_` для production)

### Шаг 2: Создайте/обновите SSM параметр

#### Для dev окружения:

```bash
aws ssm put-parameter \
  --name /flowlogic/dev/stripe/secret-key \
  --value "sk_test_ваш_реальный_ключ" \
  --type SecureString \
  --description "Stripe Secret Key for dev environment" \
  --key-id alias/aws/ssm \
  --overwrite
```

#### Для staging окружения:

```bash
aws ssm put-parameter \
  --name /flowlogic/staging/stripe/secret-key \
  --value "sk_test_ваш_реальный_ключ" \
  --type SecureString \
  --description "Stripe Secret Key for staging environment" \
  --key-id alias/aws/ssm \
  --overwrite
```

#### Для production окружения:

```bash
aws ssm put-parameter \
  --name /flowlogic/prod/stripe/secret-key \
  --value "YOUR_STRIPE_LIVE_SECRET_KEY" \
  --type SecureString \
  --description "Stripe Secret Key for production environment" \
  --key-id alias/aws/ssm \
  --overwrite
```

### Шаг 3: Проверка

```bash
# Проверка параметра (без расшифровки значения)
aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key

# Проверка с расшифровкой (только если у вас есть права)
aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key --with-decryption
```

---

## ⚠️ Вариант 2: Временная заглушка для теста деплоя

Если вы хотите просто протестировать деплой без настройки Stripe, можно временно использовать заглушку.

### В serverless.yml:

```yaml
# Было:
STRIPE_SECRET_KEY: ${ssm:/flowlogic/${self:provider.stage}/stripe/secret-key, true}

# Стало (временно для теста):
STRIPE_SECRET_KEY: "sk_test_mock_key"
```

**⚠️ ВАЖНО:**
- Это только для теста деплоя
- Stripe функции не будут работать с mock ключом
- **НЕ коммитьте** это изменение в production
- После настройки Stripe верните SSM параметр

### Временное изменение (только для dev):

```bash
# Создайте backup
cp infra/serverless/serverless.yml infra/serverless/serverless.yml.backup

# Временно замените (только для dev теста)
sed -i 's|STRIPE_SECRET_KEY:.*|STRIPE_SECRET_KEY: "sk_test_mock_key"|' infra/serverless/serverless.yml

# После теста верните обратно
mv infra/serverless/serverless.yml.backup infra/serverless/serverless.yml
```

---

## 🔍 Проверка текущего состояния

### Проверка SSM параметра

```bash
# Проверка для dev
aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key --with-decryption

# Проверка для staging
aws ssm get-parameter --name /flowlogic/staging/stripe/secret-key --with-decryption

# Проверка для prod
aws ssm get-parameter --name /flowlogic/prod/stripe/secret-key --with-decryption
```

### Проверка в serverless.yml

```bash
grep "STRIPE_SECRET_KEY" infra/serverless/serverless.yml
```

Ожидаемый результат:
```yaml
STRIPE_SECRET_KEY: ${ssm:/flowlogic/${self:provider.stage}/stripe/secret-key, true}
```

---

## 🚀 Рекомендуемый подход

### Для первого деплоя (тест):

1. **Создайте SSM параметр с placeholder:**
   ```bash
   aws ssm put-parameter \
     --name /flowlogic/dev/stripe/secret-key \
     --value "YOUR_STRIPE_SECRET_KEY" \
     --type SecureString \
     --description "Stripe Secret Key placeholder for dev" \
     --key-id alias/aws/ssm
   ```

2. **Протестируйте деплой:**
   ```bash
   cd infra/serverless
   serverless deploy --stage dev
   ```

3. **После успешного деплоя обновите с реальным ключом:**
   ```bash
   aws ssm put-parameter \
     --name /flowlogic/dev/stripe/secret-key \
     --value "sk_test_ваш_реальный_ключ" \
     --type SecureString \
     --overwrite
   ```

4. **Передеплойте Lambda (чтобы подхватить новый ключ):**
   ```bash
   serverless deploy function -f api --stage dev
   ```

---

## 🔐 Безопасность

### ⚠️ КРИТИЧЕСКИ ВАЖНО

1. **НИКОГДА не коммитьте Stripe ключи в код:**
   - Используйте только SSM Parameter Store
   - Не добавляйте ключи в `.env` файлы, которые могут попасть в Git

2. **Разные ключи для разных окружений:**
   - Dev: `sk_test_...` (тестовый режим)
   - Staging: `sk_test_...` (тестовый режим)
   - Production: `sk_live_...` (реальный режим)

3. **Ротация ключей:**
   - Токены должны ротироваться каждые 90 дней
   - См. `docs/security/policies.md`

---

## 📋 Чеклист настройки

- [ ] Получен Stripe Secret Key из Stripe Dashboard
- [ ] Создан SSM параметр `/flowlogic/dev/stripe/secret-key`
- [ ] Создан SSM параметр `/flowlogic/staging/stripe/secret-key` (опционально)
- [ ] Создан SSM параметр `/flowlogic/prod/stripe/secret-key` (опционально)
- [ ] Проверен доступ Lambda к SSM параметру (IAM policy)
- [ ] Протестирован деплой с SSM параметром
- [ ] Stripe функции работают корректно

---

## 🐛 Troubleshooting

### Проблема: "Parameter not found" при деплое

**Решение:**
1. Проверьте, что параметр создан:
   ```bash
   aws ssm get-parameter --name /flowlogic/dev/stripe/secret-key
   ```

2. Проверьте правильность пути в serverless.yml:
   ```yaml
   STRIPE_SECRET_KEY: ${ssm:/flowlogic/${self:provider.stage}/stripe/secret-key, true}
   ```

3. Проверьте IAM права Lambda на чтение SSM:
   ```bash
   aws iam list-attached-role-policies --role-name <lambda-role-name>
   ```

### Проблема: Lambda не может прочитать параметр

**Решение:**
1. Проверьте IAM политику Lambda:
   - Должна быть политика с `ssm:GetParameter` для `/flowlogic/*`

2. Проверьте, что параметр существует:
   ```bash
   aws ssm describe-parameters --filters "Key=Name,Values=/flowlogic/dev/stripe/secret-key"
   ```

---

## 📚 Дополнительные ресурсы

- [Stripe API Keys](https://stripe.com/docs/keys)
- [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [Serverless Framework SSM](https://www.serverless.com/framework/docs/providers/aws/guide/variables#reference-variables-using-the-ssm-parameter-store)
- [Security Policies](docs/security/policies.md)

---

**Обновлено:** 2025-12-23  
**Версия:** 1.0

