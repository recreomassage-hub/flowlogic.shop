# S3 Deployment Bucket Pattern Fix

**Дата:** 2026-01-15  
**Проблема:** Неправильный паттерн для S3 deployment bucket в IAM policy

---

## Проблема

**Ошибка:** "Could not access objects in the deployment bucket"  
**Причина:** Паттерн в IAM policy не соответствует реальному имени bucket

**Реальное имя bucket (из aws s3 ls):**
```
flowlogic-backend-staging-serverlessdeploymentbuck-hl2wzrvp2vjw
```

**Старый паттерн в policy:**
```
arn:aws:s3:::serverless-deployment-buckets-*
```

❌ **Не совпадает!** Serverless Framework создает bucket с именем:
- `flowlogic-backend-{stage}-serverlessdeploymentbucket-{hash}`

---

## Решение

**Исправлен паттерн в IAM policy:**

**Файл:** `docs/deployment/aws_iam_policy_fixed.json`

**Добавлены паттерны:**
```json
{
  "Sid": "S3DeploymentBucket",
  "Effect": "Allow",
  "Action": [...],
  "Resource": [
    "arn:aws:s3:::serverless-deployment-buckets-*",
    "arn:aws:s3:::serverless-deployment-buckets-*/*",
    "arn:aws:s3:::flowlogic-backend-*-serverlessdeploymentbucket-*",
    "arn:aws:s3:::flowlogic-backend-*-serverlessdeploymentbucket-*/*",
    "arn:aws:s3:::*-serverlessdeploymentbuck-*",
    "arn:aws:s3:::*-serverlessdeploymentbuck-*/*"
  ]
}
```

**Паттерны покрывают:**
1. `serverless-deployment-buckets-*` - стандартный паттерн Serverless Framework
2. `flowlogic-backend-*-serverlessdeploymentbucket-*` - паттерн с service name
3. `*-serverlessdeploymentbuck-*` - усеченный паттерн (для bucket с длинными именами)

---

## Применение

✅ **Policy обновлена через AWS CLI:**
```bash
aws iam put-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --policy-document file://docs/deployment/aws_iam_policy_fixed.json
```

✅ **Проверка:**
```bash
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --query 'PolicyDocument.Statement[?Sid==`S3DeploymentBucket`].Resource' \
  --output json | jq '.'
```

---

## Результат

✅ **После исправления:**
- IAM роль `flowlogic-ci-cd-staging` имеет права на правильный паттерн bucket
- Деплой должен пройти успешно
- Serverless Framework сможет создавать/использовать deployment bucket

---

## Новый деплой

🚀 **Деплой перезапущен** с исправленным паттерном bucket.

**Мониторинг:**
```bash
gh run watch
```

---

**Статус:** ✅ Исправлено, деплой перезапущен
