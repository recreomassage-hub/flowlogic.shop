# 📝 Руководство по созданию IAM Policy для Flow Logic

## ✅ Шаг 1: JSON Policy (уже готово)

Используйте JSON из файла: `docs/deployment/aws_iam_policy_fixed.json`

---

## 📋 Шаг 2: Policy Details

### Policy name
```
FlowLogicGitHubActionsDeployPolicy
```

**Альтернативные варианты:**
- `FlowLogic-CI-CD-Deploy-Policy`
- `flowlogic-github-actions-deploy`
- `GitHubActionsFlowLogicDeploy`

### Description (опционально, но рекомендуется)
```
Minimal IAM permissions for GitHub Actions to deploy Flow Logic backend. Allows deployment of Lambda functions, API Gateway, DynamoDB tables, S3 buckets, and reading SSM parameters. Follows least privilege principle with resource restrictions.
```

**Короткий вариант:**
```
GitHub Actions deployment policy for Flow Logic. Minimal permissions for CI/CD pipeline.
```

---

## 🏷️ Шаг 3: Tags (опционально, но рекомендуется)

Добавьте теги для организации:

| Key | Value | Описание |
|-----|-------|----------|
| `Project` | `flowlogic` | Идентификация проекта |
| `Environment` | `all` | Применяется ко всем окружениям |
| `Purpose` | `ci-cd-deployment` | Назначение политики |
| `ManagedBy` | `github-actions` | Управляется через GitHub Actions |

**Минимальный набор:**
- `Project: flowlogic`
- `Purpose: ci-cd-deployment`

---

## ✅ Шаг 4: Review and Create

1. Проверьте, что все поля заполнены
2. Убедитесь, что:
   - Policy name уникален
   - Description понятен
   - Tags добавлены (если нужно)
3. Нажмите **Create policy**

---

## 📋 После создания

1. **Скопируйте ARN политики:**
   - Он будет выглядеть как: `arn:aws:iam::ACCOUNT_ID:policy/FlowLogicGitHubActionsDeployPolicy`
   - Сохраните его для следующего шага

2. **Создайте IAM Role:**
   - См. `docs/deployment/aws_oidc_setup.md`
   - При создании Role → Attach эту политику

---

## 🔍 Проверка

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

## 📚 Следующие шаги

1. ✅ Policy создана
2. ➡️ Создайте IAM Role с OIDC (см. `docs/deployment/aws_oidc_setup.md`)
3. ➡️ Добавьте `AWS_ROLE_ARN` в GitHub Secrets
4. ➡️ Проверьте workflow в GitHub Actions


