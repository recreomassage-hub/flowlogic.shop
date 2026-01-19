# Staging Deploy Fixed: configure-aws-credentials

**Дата:** 2026-01-15  
**Статус:** ✅ IAM permissions исправлены, деплой перезапущен

---

## Исправления

### 1. ✅ Workflow условие исправлено

**Проблема:** Production job запускался автоматически при деплое на staging.

**Решение:**
- Убрано условие `github.ref == 'refs/heads/main'` из staging/production jobs
- Теперь каждый job запускается только при правильном параметре `stage`

**Изменения в `.github/workflows/backend-deploy.yml`:**
```diff
- if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'staging')
+ if: github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'staging'

- if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'production')
+ if: github.event_name == 'workflow_dispatch' && github.event.inputs.stage == 'production'
```

### 2. ✅ IAM S3 Deployment Bucket Permissions исправлены

**Проблема:** "Could not access objects in the deployment bucket"

**Решение:**
- Добавлены права на S3 deployment bucket в IAM policy для `flowlogic-ci-cd-staging`
- Обновлена policy через AWS CLI

**Добавленный statement:**
```json
{
  "Sid": "S3DeploymentBucket",
  "Effect": "Allow",
  "Action": [
    "s3:CreateBucket",
    "s3:DeleteBucket",
    "s3:GetBucketLocation",
    "s3:ListBucket",
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:GetBucketVersioning",
    "s3:PutBucketVersioning",
    "s3:GetLifecycleConfiguration",
    "s3:PutLifecycleConfiguration"
  ],
  "Resource": [
    "arn:aws:s3:::serverless-deployment-buckets-*",
    "arn:aws:s3:::serverless-deployment-buckets-*/*"
  ]
}
```

**Применено:**
```bash
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --policy-document file://docs/deployment/aws_iam_policy_fixed.json
```

✅ **Результат:** Policy обновлена, права подтверждены.

---

## Новый деплой запущен

**Статус:** 🚀 Деплой на staging перезапущен с исправлениями

### Мониторинг:

```bash
# Проверить статус последнего run
gh run list --workflow="Backend Deployment" --limit 1

# Мониторить выполнение (live)
gh run watch

# Просмотреть логи когда завершится
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view $LATEST_RUN --log
```

---

## Ожидаемые результаты

### ✅ Успешный деплой:

1. **Workflow:**
   - ✅ `Deploy to Staging` - запущен и завершится успешно
   - ✅ `Deploy to Production` - skipped (не запустится)
   - ✅ `Deploy to Dev` - skipped (не запустится)

2. **Deployment:**
   - ✅ OIDC authentication работает
   - ✅ S3 deployment bucket доступен
   - ✅ Serverless Framework деплоится успешно
   - ✅ Health endpoint доступен

3. **После деплоя:**
   - ✅ Health endpoint возвращает `200 OK`
   - ✅ Smoke tests пройдут успешно
   - ✅ Backend доступен на staging URL

---

## Проверка после завершения деплоя

```bash
# 1. Проверить health endpoint
STAGING_URL="https://84xkp5s9q6.execute-api.us-east-1.amazonaws.com/staging"
curl -s "$STAGING_URL/health" | jq '.'

# 2. Запустить smoke tests
bash scripts/smoke_tests.sh staging

# 3. Проверить OIDC credentials
bash scripts/validate-aws-credentials.sh staging
```

---

## Файлы изменений

1. `.github/workflows/backend-deploy.yml` - исправлены условия для jobs
2. `docs/deployment/aws_iam_policy_fixed.json` - добавлены права на S3 deployment bucket
3. `scripts/fix-staging-s3-permissions.sh` - скрипт для обновления policy

---

## Следующие шаги

1. ⏸️ Дождаться завершения деплоя (2-5 минут)
2. ⬜ Проверить health endpoint
3. ⬜ Запустить smoke tests
4. ⬜ Обновить результаты
5. ⬜ Архивировать change после успешной verification

---

**Статус:** ✅ Исправления применены, деплой перезапущен
