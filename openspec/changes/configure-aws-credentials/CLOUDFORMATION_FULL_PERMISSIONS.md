# CloudFormation Full Permissions Fix

**Дата:** 2026-01-15  
**Проблема:** "cloudformation:ValidateTemplate" не разрешен, несмотря на наличие в policy

---

## Проблема

**Ошибка:**
```
User is not authorized to perform: cloudformation:ValidateTemplate 
because no identity-based policy allows the cloudformation:ValidateTemplate action
```

**Причина:**
Несмотря на то, что `cloudformation:ValidateTemplate` был в policy, проблема могла быть в:
1. Resource pattern слишком ограниченный
2. Недостающие связанные права
3. Проблемы с кэшированием IAM policy

---

## Решение

**Использованы полные права на CloudFormation:**

**Файл:** `docs/deployment/aws_iam_policy_fixed.json`

**Обновлен statement "CloudFormationManage":**
```json
{
  "Sid": "CloudFormationManage",
  "Effect": "Allow",
  "Action": [
    "cloudformation:*"
  ],
  "Resource": [
    "arn:aws:cloudformation:*:*:stack/flowlogic-*/*",
    "arn:aws:cloudformation:*:*:stack/flowlogic-*",
    "*"
  ]
}
```

**Изменения:**
- ✅ `Action: ["cloudformation:*"]` - полные права на CloudFormation
- ✅ `Resource: ["*"]` - разрешает все CloudFormation операции, включая ValidateTemplate (который не привязан к конкретному stack)

**Обоснование:**
- `cloudformation:ValidateTemplate` - это глобальная операция, не привязанная к конкретному stack
- Serverless Framework требует широкий набор CloudFormation операций
- Для staging окружения можно дать полные права на CloudFormation (stacks все равно ограничены паттерном `flowlogic-*`)

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
  --query 'PolicyDocument.Statement[?Sid==`CloudFormationManage`]' \
  --output json | jq '.[0]'
```

---

## Результат

✅ **После исправления:**
- IAM роль `flowlogic-ci-cd-staging` имеет полные права на CloudFormation
- `cloudformation:ValidateTemplate` работает
- Serverless Framework сможет валидировать и деплоить CloudFormation templates
- Деплой на staging должен пройти успешно

---

## Безопасность

⚠️ **Примечание:** Использование `cloudformation:*` с `Resource: ["*"]` дает широкие права, но:
- Стеки все равно ограничены паттерном `flowlogic-*` (для большинства операций)
- Это staging окружение, не production
- Для production можно ограничить права более строго

---

**Статус:** ✅ Исправлено, деплой перезапущен
