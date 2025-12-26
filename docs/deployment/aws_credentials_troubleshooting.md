# 🔧 AWS Credentials Troubleshooting Guide

**Проблема:** GitHub Actions не может найти или правильно настроить AWS учетные данные.

**Ошибка:** `Error: Could not assume role with OIDC: Request ARN is invalid` или `AWS provider credentials not found`

---

## 🔍 ДИАГНОСТИКА ПРОБЛЕМЫ

### 1. Проверка формата AWS_ROLE_ARN

**Ошибка:** `ARN format is INVALID!`

**Правильный формат:**
```
arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME
```

**Пример:**
```
arn:aws:iam::123456789012:role/GitHubActionsRole
```

**Как проверить:**
1. Перейдите в AWS Console → IAM → Roles
2. Выберите вашу роль
3. В верхней части страницы найдите **ARN**
4. Скопируйте полный ARN (должен начинаться с `arn:aws:iam::`)

**Проверка в GitHub:**
1. Перейдите в GitHub repository → Settings → Secrets and variables → Actions
2. Найдите `AWS_ROLE_ARN`
3. Убедитесь, что значение:
   - Начинается с `arn:aws:iam::`
   - Содержит 12-значный Account ID
   - Заканчивается на `:role/ROLE_NAME`
   - **Нет пробелов** в начале или конце
   - **Нет лишних символов**

---

### 2. Проверка GitHub Secrets

#### Для OIDC (рекомендуется):

**Требуемые секреты:**
- `AWS_ROLE_ARN` - ARN роли с OIDC Trust Policy

**Проверка:**
```bash
# Формат ARN должен быть:
arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME

# Пример:
arn:aws:iam::123456789012:role/flowlogic-github-actions-role
```

#### Для Access Keys (fallback):

**Требуемые секреты:**
- `AWS_ACCESS_KEY_ID` - Access Key ID
- `AWS_SECRET_ACCESS_KEY` - Secret Access Key

**Проверка:**
- `AWS_ACCESS_KEY_ID` должен начинаться с `AKIA` (20 символов)
- `AWS_SECRET_ACCESS_KEY` должен быть длиной 40 символов

---

### 3. Проверка конфигурации OIDC

Если используете OIDC, убедитесь, что:

#### A. OIDC Provider создан в AWS:

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

**Если не создан:**
См. `docs/deployment/aws_oidc_setup.md` - раздел "Создание OIDC Provider"

#### B. IAM Role имеет правильный Trust Policy:

```bash
aws iam get-role --role-name flowlogic-github-actions-role
```

**Trust Policy должен содержать:**
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

**Проверьте:**
- `ACCOUNT_ID` правильный
- `repo:OWNER/REPO:*` соответствует вашему репозиторию
- `oidc-provider` ARN правильный

---

### 4. Проверка IAM Permissions Policy

Убедитесь, что роль имеет необходимые permissions:

```bash
aws iam list-attached-role-policies --role-name flowlogic-github-actions-role
```

**Должна быть прикреплена политика:**
- `FlowLogicGitHubActionsDeployPolicy` (или другая с необходимыми permissions)

**Проверка permissions:**
См. `docs/deployment/aws_iam_permissions.md`

---

### 5. Проверка Workflow конфигурации

**Файл:** `.github/workflows/ci-cd.yml`

**Проверьте:**
1. `permissions` на уровне job:
   ```yaml
   permissions:
     id-token: write  # Требуется для OIDC
     contents: read
   ```

2. `Configure AWS credentials` step:
   ```yaml
   - name: Configure AWS credentials (OIDC)
     if: steps.check-aws-creds.outputs.USE_OIDC == 'true'
     uses: aws-actions/configure-aws-credentials@v4
     with:
       role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
       aws-region: us-east-1
   ```

3. `Configure AWS credentials (Access Keys)` step:
   ```yaml
   - name: Configure AWS credentials (Access Keys)
     if: steps.check-aws-creds.outputs.USE_OIDC != 'true' && steps.check-aws-creds.outputs.HAS_ACCESS_KEYS == 'true'
     uses: aws-actions/configure-aws-credentials@v4
     with:
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
       aws-region: us-east-1
   ```

---

## 🛠️ РЕШЕНИЕ ПРОБЛЕМ

### Вариант 1: Исправить OIDC (если хотите использовать OIDC)

#### Шаг 1: Проверьте ARN в GitHub Secrets

1. Перейдите в GitHub → Settings → Secrets and variables → Actions
2. Найдите `AWS_ROLE_ARN`
3. Проверьте формат:
   ```
   arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME
   ```
4. Убедитесь, что нет пробелов

#### Шаг 2: Проверьте роль в AWS

```bash
# Получить ARN роли
aws iam get-role --role-name flowlogic-github-actions-role --query 'Role.Arn' --output text

# Проверить Trust Policy
aws iam get-role --role-name flowlogic-github-actions-role --query 'Role.AssumeRolePolicyDocument'
```

#### Шаг 3: Проверьте OIDC Provider

```bash
# Список OIDC providers
aws iam list-open-id-connect-providers

# Если не создан, создайте:
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

#### Шаг 4: Обновите Trust Policy (если нужно)

См. `docs/deployment/aws_oidc_setup.md` - раздел "Настройка Trust Policy"

---

### Вариант 2: Использовать Access Keys (быстрое решение)

#### Шаг 1: Создайте IAM User

1. AWS Console → IAM → Users → Create user
2. Имя: `flowlogic-github-actions-user`
3. Attach policies: `FlowLogicGitHubActionsDeployPolicy` (или создайте custom policy)

#### Шаг 2: Создайте Access Keys

1. Выберите пользователя → Security credentials
2. Create access key → Application running outside AWS
3. Скопируйте `Access key ID` и `Secret access key`

#### Шаг 3: Добавьте в GitHub Secrets

1. GitHub → Settings → Secrets and variables → Actions
2. Добавьте:
   - `AWS_ACCESS_KEY_ID` = ваш Access Key ID
   - `AWS_SECRET_ACCESS_KEY` = ваш Secret Access Key
3. **Удалите или оставьте пустым** `AWS_ROLE_ARN`

#### Шаг 4: Перезапустите workflow

Workflow автоматически использует Access Keys, если `AWS_ROLE_ARN` пустой или невалидный.

---

## ✅ ПРОВЕРОЧНЫЙ ЧЕКЛИСТ

Перед запуском деплоя проверьте:

### Для OIDC:
- [ ] OIDC Provider создан в AWS
- [ ] IAM Role создана с правильным Trust Policy
- [ ] Permissions Policy прикреплена к роли
- [ ] `AWS_ROLE_ARN` добавлен в GitHub Secrets с правильным форматом
- [ ] `permissions: id-token: write` настроено в workflow
- [ ] Trust Policy содержит правильный `repo:OWNER/REPO:*`

### Для Access Keys:
- [ ] IAM User создан
- [ ] Permissions Policy прикреплена к пользователю
- [ ] Access Keys созданы
- [ ] `AWS_ACCESS_KEY_ID` добавлен в GitHub Secrets
- [ ] `AWS_SECRET_ACCESS_KEY` добавлен в GitHub Secrets
- [ ] `AWS_ROLE_ARN` удален или пустой в GitHub Secrets

---

## 🔍 ДОПОЛНИТЕЛЬНАЯ ДИАГНОСТИКА

### Проверка логов GitHub Actions

1. Перейдите в Actions → выберите failed workflow
2. Найдите step `Check AWS credentials configuration`
3. Проверьте вывод:
   - `✅ ARN format is valid` - ARN правильный
   - `❌ ARN format is INVALID!` - ARN неправильный
   - `⚠️ AWS_ROLE_ARN not found` - секрет не добавлен

### Проверка логов AWS

```bash
# Проверить CloudTrail для попыток assume role
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRoleWithWebIdentity \
  --max-results 10
```

### Тестирование локально

```bash
# Тест OIDC (требует настройки локально)
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME \
  --role-session-name test-session \
  --web-identity-token-file /path/to/token

# Тест Access Keys
export AWS_ACCESS_KEY_ID=your-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-key
aws sts get-caller-identity
```

---

## 📚 СВЯЗАННАЯ ДОКУМЕНТАЦИЯ

- `docs/deployment/aws_oidc_setup.md` - Настройка OIDC
- `docs/deployment/aws_credentials_setup.md` - Настройка Access Keys
- `docs/deployment/aws_iam_permissions.md` - Требуемые IAM permissions
- `docs/deployment/aws_oidc_troubleshooting.md` - Детальное руководство по OIDC

---

## 🆘 ЕСЛИ НИЧЕГО НЕ ПОМОГЛО

1. **Проверьте Account ID:**
   ```bash
   aws sts get-caller-identity --query Account --output text
   ```
   Убедитесь, что Account ID в ARN совпадает с реальным.

2. **Проверьте регион:**
   Убедитесь, что `aws-region: us-east-1` в workflow соответствует региону ваших ресурсов.

3. **Проверьте права доступа:**
   Убедитесь, что IAM User/Role имеет все необходимые permissions (см. `docs/deployment/aws_iam_permissions.md`).

4. **Создайте новый ARN:**
   Если ARN все еще не работает, создайте новую роль и обновите GitHub Secrets.

5. **Используйте Access Keys:**
   Если OIDC не работает, временно используйте Access Keys для деплоя.

---

**Последнее обновление:** 2025-12-26


