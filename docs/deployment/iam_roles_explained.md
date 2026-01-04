# 🔐 Объяснение IAM Roles для Flow Logic

## ❓ Почему существующие роли не подходят для GitHub Actions?

### Типы ролей в вашем проекте

#### 1. **Service-Linked Roles** (нельзя использовать)
```
AWSServiceRoleForAPIGateway
AWSServiceRoleForResourceExplorer
AWSServiceRoleForSupport
AWSServiceRoleForTrustedAdvisor
```

**Что это:**
- Специальные роли, созданные AWS для внутренних сервисов
- Используются только AWS сервисами для управления ресурсами
- Не могут быть использованы внешними приложениями (включая GitHub Actions)

**Почему нельзя использовать:**
- Trust Policy разрешает только AWS сервисам использовать эти роли
- GitHub Actions не является AWS сервисом

---

#### 2. **Cognito-SMS-Role** (нельзя использовать)
```
Cognito-SMS-Role
Trusted entities: AWS Service: lambda
```

**Что это:**
- Роль для Lambda функций, которые отправляют SMS через Cognito
- Trust Policy разрешает только Lambda функциям использовать эту роль
- Используется внутри AWS, не для внешних приложений

**Почему нельзя использовать:**
- Trust Policy: `"Service": "lambda.amazonaws.com"`
- GitHub Actions не может assume эту роль

---

#### 3. **flowlogic-backend-dev-us-east-1-lambdaRole** (нельзя использовать)
```
flowlogic-backend-dev-us-east-1-lambdaRole
Trusted entities: AWS Service: lambda
```

**Что это:**
- Роль, созданная Serverless Framework для Lambda функций
- Используется Lambda функциями для выполнения кода
- Trust Policy разрешает только Lambda сервису использовать эту роль

**Почему нельзя использовать:**
- Trust Policy: `"Service": "lambda.amazonaws.com"`
- GitHub Actions не может assume эту роль
- Эта роль используется Lambda функциями, а не для деплоя

---

## ✅ Что нужно для GitHub Actions?

### Вариант 1: IAM Role с OIDC (рекомендуется)

**Требования:**
1. **Trust Policy** должен разрешать GitHub Actions:
   ```json
   {
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
   ```

2. **Permissions Policy** должен иметь права на:
   - Lambda (деплой и управление)
   - API Gateway (деплой)
   - DynamoDB (создание таблиц)
   - S3 (создание bucket)
   - SSM (чтение параметров)
   - Cognito (чтение параметров)
   - CloudFormation (Serverless Framework использует CloudFormation)

**Как создать:**
См. `docs/deployment/aws_oidc_setup.md`

---

### Вариант 2: IAM User с Access Keys (проще, но менее безопасно)

**Требования:**
1. IAM User (не Role!)
2. Access Key ID и Secret Access Key
3. Те же права, что и для Role

**Как создать:**
См. `docs/deployment/aws_credentials_setup.md`

---

## 🔄 Можно ли переиспользовать существующую роль?

### ❌ НЕТ, нельзя использовать существующие роли

**Причины:**
1. **Trust Policy не подходит:**
   - Существующие роли имеют Trust Policy для Lambda или AWS сервисов
   - GitHub Actions не может assume эти роли

2. **Разные цели:**
   - `flowlogic-backend-dev-us-east-1-lambdaRole` - для выполнения Lambda функций
   - Роль для GitHub Actions - для деплоя и управления инфраструктурой

3. **Безопасность:**
   - Разделение прав: Lambda функции не должны иметь права на деплой
   - Принцип least privilege: каждая роль должна иметь только необходимые права

---

## 🎯 Правильная архитектура ролей

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│  (нужна роль для деплоя и управления инфраструктурой)   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Assume Role (OIDC)
                     ▼
         ┌───────────────────────────┐
         │  IAM Role для GitHub      │
         │  Actions (OIDC)           │
         │  - Lambda: deploy         │
         │  - API Gateway: deploy    │
         │  - DynamoDB: create       │
         │  - S3: create             │
         │  - SSM: read              │
         └───────────────────────────┘
                     │
                     │ Deploy Lambda
                     ▼
         ┌───────────────────────────┐
         │  Lambda Function          │
         │  (использует свою роль)   │
         └───────────────────────────┘
                     │
                     │ Assume Role
                     ▼
         ┌───────────────────────────┐
         │  flowlogic-backend-dev-   │
         │  us-east-1-lambdaRole     │
         │  - DynamoDB: read/write    │
         │  - S3: read/write          │
         │  - Cognito: read           │
         └───────────────────────────┘
```

---

## 📋 Что делать?

### Шаг 1: Создать новую роль для GitHub Actions

**Через AWS Console:**
1. IAM → Roles → Create role
2. Выберите **Web identity**
3. Identity provider: GitHub (или создайте новый)
4. Audience: `sts.amazonaws.com`
5. Trust Policy: см. `docs/deployment/aws_oidc_setup.md`
6. Permissions: добавьте необходимые политики
7. Role name: `flowlogic-github-actions-role`

**Или через AWS CLI:**
```bash
# Создать OIDC provider (если еще не создан)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# Создать роль
aws iam create-role \
  --role-name flowlogic-github-actions-role \
  --assume-role-policy-document file://trust-policy.json \
  --permissions-boundary arn:aws:iam::aws:policy/PowerUserAccess
```

---

### Шаг 2: Добавить в GitHub Secrets

1. Получите ARN роли:
   ```bash
   aws iam get-role --role-name flowlogic-github-actions-role --query 'Role.Arn'
   ```

2. Добавьте в GitHub Secrets:
   - Name: `AWS_ROLE_ARN`
   - Value: `arn:aws:iam::ACCOUNT_ID:role/flowlogic-github-actions-role`

---

## 🔍 Проверка существующих ролей

Если хотите проверить Trust Policy существующих ролей:

```bash
# Проверить Trust Policy роли
aws iam get-role --role-name flowlogic-backend-dev-us-east-1-lambdaRole --query 'Role.AssumeRolePolicyDocument'

# Проверить Permissions роли
aws iam list-attached-role-policies --role-name flowlogic-backend-dev-us-east-1-lambdaRole
```

Вы увидите, что Trust Policy разрешает только Lambda сервису использовать эту роль.

---

## 📚 Дополнительные ресурсы

- [AWS IAM Roles vs Users](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [GitHub Actions OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Serverless Framework IAM Roles](https://www.serverless.com/framework/docs/providers/aws/guide/iam)





