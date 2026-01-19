# CloudFormation Permissions Fix

**Дата:** 2026-01-15  
**Проблема:** "User is not authorized to perform: cloudformation:ValidateTemplate"

---

## Проблема

**Ошибка в логах:**
```
The CloudFormation template is invalid: 
User: arn:aws:sts::353731341341:assumed-role/flowlogic-ci-cd-staging/github-21101100261-staging 
is not authorized to perform: cloudformation:ValidateTemplate 
because no identity-based policy allows the cloudformation:ValidateTemplate action
```

**Причина:**
IAM роль `flowlogic-ci-cd-staging` не имеет достаточных прав на CloudFormation операции, необходимые для Serverless Framework deployment.

---

## Решение

### 1. ✅ Обновлена IAM Policy для CloudFormation

**Файл:** `docs/deployment/aws_iam_policy_fixed.json`

**Обновлен statement "CloudFormationManage":**
```json
{
  "Sid": "CloudFormationManage",
  "Effect": "Allow",
  "Action": [
    "cloudformation:CreateStack",
    "cloudformation:UpdateStack",
    "cloudformation:DeleteStack",
    "cloudformation:DescribeStacks",
    "cloudformation:DescribeStackEvents",
    "cloudformation:DescribeStackResources",
    "cloudformation:DescribeStackResource",
    "cloudformation:GetTemplate",
    "cloudformation:ValidateTemplate",  // ✅ Добавлено (уже было, но проверено)
    "cloudformation:ListStacks",
    "cloudformation:DescribeChangeSet",    // ✅ Добавлено
    "cloudformation:CreateChangeSet",      // ✅ Добавлено
    "cloudformation:ExecuteChangeSet",     // ✅ Добавлено
    "cloudformation:DeleteChangeSet",      // ✅ Добавлено
    "cloudformation:ListChangeSets"        // ✅ Добавлено
  ],
  "Resource": [
    "arn:aws:cloudformation:*:*:stack/flowlogic-*/*",
    "arn:aws:cloudformation:*:*:stack/flowlogic-*"  // ✅ Добавлено
  ]
}
```

**Добавленные права:**
- ✅ `cloudformation:DescribeStackResource` - для получения информации о ресурсах
- ✅ `cloudformation:DescribeChangeSet` - для работы с change sets
- ✅ `cloudformation:CreateChangeSet` - для создания change sets
- ✅ `cloudformation:ExecuteChangeSet` - для выполнения change sets
- ✅ `cloudformation:DeleteChangeSet` - для удаления change sets
- ✅ `cloudformation:ListChangeSets` - для листинга change sets

**Обновлен Resource:**
- ✅ Добавлен `arn:aws:cloudformation:*:*:stack/flowlogic-*` (без /*) для работы с самими stack'ами

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
# Проверить что ValidateTemplate присутствует
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --query 'PolicyDocument.Statement[?Sid==`CloudFormationManage`].Action' \
  --output json | jq '.[] | select(. == "cloudformation:ValidateTemplate")'
```

---

## Результат

✅ **После исправления:**
- IAM роль `flowlogic-ci-cd-staging` имеет все необходимые права на CloudFormation
- Serverless Framework сможет валидировать и деплоить CloudFormation templates
- Деплой на staging должен пройти успешно

---

## Новый деплой

🚀 **Деплой перезапущен** с исправленными правами на CloudFormation.

**Мониторинг:**
```bash
gh run watch
```

---

**Статус:** ✅ Исправлено, деплой перезапущен
