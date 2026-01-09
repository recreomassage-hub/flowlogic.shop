# 🔐 Настройка IAM для GitHub Actions

**Для:** OIDC (рекомендуется) и Access Keys (fallback)

---

## 📋 ОБЗОР

Для деплоя Flow Logic через GitHub Actions требуется:
1. **IAM Policy** - определяет, что можно делать (permissions)
2. **IAM Role** (для OIDC) - роль, которую может принять GitHub Actions
3. **IAM User** (для Access Keys) - пользователь с Access Keys

---

## 🎯 ЧАСТЬ 1: СОЗДАНИЕ IAM POLICY

### Шаг 1: JSON Policy

Используйте JSON из файла: `docs/deployment/aws_iam_policy_fixed.json`

Или скопируйте минимальную политику из `docs/deployment/aws_iam_permissions.md`

### Шаг 2: Policy Details

**Policy name:**
```
FlowLogicGitHubActionsDeployPolicy
```

**Альтернативные варианты:**
- `FlowLogic-CI-CD-Deploy-Policy`
- `flowlogic-github-actions-deploy`
- `GitHubActionsFlowLogicDeploy`

**Description:**
```
Minimal IAM permissions for GitHub Actions to deploy Flow Logic backend. Allows deployment of Lambda functions, API Gateway, DynamoDB tables, S3 buckets, and reading SSM parameters. Follows least privilege principle with resource restrictions.
```

### Шаг 3: Tags (опционально, но рекомендуется)

| Key | Value | Описание |
|-----|-------|----------|
| `Project` | `flowlogic` | Идентификация проекта |
| `Environment` | `all` | Применяется ко всем окружениям |
| `Purpose` | `ci-cd-deployment` | Назначение политики |
| `ManagedBy` | `github-actions` | Управляется через GitHub Actions |

### Шаг 4: Review and Create

1. Проверьте, что все поля заполнены
2. Убедитесь, что:
   - Policy name уникален
   - Description понятен
   - Tags добавлены (если нужно)
3. Нажмите **Create policy**

### Шаг 5: Проверка

После создания политики, проверьте:

```bash
# Получить информацию о политике
aws iam get-policy --policy-arn arn:aws:iam::ACCOUNT_ID:policy/FlowLogicGitHubActionsDeployPolicy

# Проверить версию политики
aws iam get-policy-version \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/FlowLogicGitHubActionsDeployPolicy \
  --version-id v1
```

---

## 🎯 ЧАСТЬ 2: СОЗДАНИЕ IAM ROLE (для OIDC)

### Шаг 1: Trust Policy

**Trust Policy для OIDC:**

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

**⚠️ ВАЖНО:**
- Замените `YOUR_ACCOUNT_ID` на ваш реальный AWS Account ID
- Убедитесь, что `repo:OWNER/REPO:*` соответствует вашему репозиторию
- Для более строгой безопасности можно ограничить только `main` и `develop` ветки:
  ```json
  "token.actions.githubusercontent.com:sub": [
    "repo:recreomassage-hub/flowlogic.shop:ref:refs/heads/main",
    "repo:recreomassage-hub/flowlogic.shop:ref:refs/heads/develop"
  ]
  ```

### Шаг 2: Permissions Policy

Прикрепите политику `FlowLogicGitHubActionsDeployPolicy` (созданную в Части 1).

### Шаг 3: Role Details

**Role name:**
```
flowlogic-github-actions-role
```

**Альтернативные варианты:**
- `FlowLogicGitHubActionsRole`
- `flowlogic-ci-cd-role`
- `github-actions-flowlogic-deploy`

**Description:**
```
IAM Role for GitHub Actions to deploy Flow Logic backend via OIDC. Allows CI/CD pipeline to deploy Lambda functions, API Gateway, DynamoDB tables, S3 buckets, and read SSM parameters.
```

### Шаг 4: Tags (опционально, но рекомендуется)

| Key | Value | Описание |
|-----|-------|----------|
| `Project` | `flowlogic` | Идентификация проекта |
| `Purpose` | `ci-cd-deployment` | Назначение роли |
| `ManagedBy` | `github-actions` | Управляется через GitHub Actions |
| `Environment` | `all` | Применяется ко всем окружениям |

### Шаг 5: Review and Create

1. Проверьте все поля:
   - ✅ Role name заполнен
   - ✅ Description заполнен
   - ✅ Trust Policy настроен (OIDC)
   - ✅ Permissions Policy прикреплена
   - ✅ Tags добавлены (опционально)

2. Нажмите **Create role**

### Шаг 6: После создания

1. **Скопируйте Role ARN:**
   - Он будет выглядеть как: `arn:aws:iam::ACCOUNT_ID:role/flowlogic-github-actions-role`
   - **ВАЖНО:** Сохраните этот ARN!

2. **Добавьте в GitHub Secrets:**
   - Перейдите: https://github.com/recreomassage-hub/flowlogic.shop/settings/secrets/actions
   - Нажмите **New repository secret**
   - Name: `AWS_ROLE_ARN`
   - Value: `arn:aws:iam::ACCOUNT_ID:role/flowlogic-github-actions-role`
   - Нажмите **Add secret**

### Шаг 7: Проверка

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

## 🎯 ЧАСТЬ 3: СОЗДАНИЕ IAM USER (для Access Keys)

Если вы используете Access Keys вместо OIDC:

### Шаг 1: Создание User

1. AWS Console → IAM → Users → **Create user**
2. Имя: `flowlogic-github-actions-user`
3. Нажмите **Next**

### Шаг 2: Прикрепление Policy

1. Выберите **Attach policies directly**
2. Найдите и выберите: `FlowLogicGitHubActionsDeployPolicy`
3. Нажмите **Next** → **Create user**

### Шаг 3: Создание Access Keys

1. Откройте созданного пользователя
2. Перейдите на вкладку **Security credentials**
3. Нажмите **Create access key**
4. Выберите **Application running outside AWS**
5. Нажмите **Next** → **Create access key**
6. **⚠️ ВАЖНО:** Немедленно скопируйте:
   - Access key ID
   - Secret access key (показывается только один раз!)

### Шаг 4: Добавление в GitHub Secrets

1. GitHub → Settings → Secrets and variables → Actions
2. Добавьте:
   - `AWS_ACCESS_KEY_ID_PROD` = ваш Access Key ID
   - `AWS_SECRET_ACCESS_KEY_PROD` = ваш Secret Access Key

---

## 📋 ПОРЯДОК СОЗДАНИЯ

### Для OIDC (рекомендуется):

1. ✅ Создайте IAM Policy (`FlowLogicGitHubActionsDeployPolicy`)
2. ✅ Создайте OIDC Provider (если еще не создан)
3. ✅ Создайте IAM Role с OIDC Trust Policy
4. ✅ Прикрепите Policy к Role
5. ✅ Добавьте `AWS_ROLE_ARN` в GitHub Secrets

### Для Access Keys (fallback):

1. ✅ Создайте IAM Policy (`FlowLogicGitHubActionsDeployPolicy`)
2. ✅ Создайте IAM User
3. ✅ Прикрепите Policy к User
4. ✅ Создайте Access Keys
5. ✅ Добавьте `AWS_ACCESS_KEY_ID_PROD` и `AWS_SECRET_ACCESS_KEY_PROD` в GitHub Secrets

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Trust Policy:**
   - Убедитесь, что `sub` содержит правильный репозиторий: `repo:recreomassage-hub/flowlogic.shop:*`
   - Для более строгой безопасности можно ограничить только `main` и `develop` ветки

2. **Permissions:**
   - Policy имеет минимальные необходимые права
   - Все ресурсы ограничены префиксом `flowlogic-*`

3. **Безопасность:**
   - OIDC предпочтительнее Access Keys (временные credentials)
   - Access Keys должны регулярно ротироваться (каждые 90 дней)
   - Никогда не коммитьте credentials в код

---

## 📚 СВЯЗАННАЯ ДОКУМЕНТАЦИЯ

- **IAM Permissions:** `docs/deployment/aws_iam_permissions.md` - Точный список permissions
- **IAM Roles Explained:** `docs/deployment/iam_roles_explained.md` - Объяснение типов ролей
- **OIDC Setup:** `docs/deployment/aws_oidc_setup.md` - Полная настройка OIDC
- **Credentials Setup:** `docs/deployment/aws_credentials_setup.md` - Настройка Access Keys
- **Troubleshooting:** `docs/deployment/troubleshooting/aws_credentials.md` - Диагностика проблем с IAM и credentials

---

**Последнее обновление:** 2025-12-26


