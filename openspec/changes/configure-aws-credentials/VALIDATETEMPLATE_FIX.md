# CloudFormation ValidateTemplate Fix

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
`cloudformation:ValidateTemplate` - это **глобальная операция**, которая не привязана к конкретному stack Resource. В policy ValidateTemplate был указан вместе с другими операциями, которые требуют конкретный Resource pattern (`arn:aws:cloudformation:*:*:stack/flowlogic-*/*`).

AWS требует, чтобы для глобальных операций CloudFormation (таких как ValidateTemplate) был указан `Resource: "*"`.

---

## Решение

**Создан отдельный statement для глобальных операций CloudFormation:**

**Файл:** `docs/deployment/aws_iam_policy_fixed.json`

**Добавлен новый statement "CloudFormationGlobal":**
```json
{
  "Sid": "CloudFormationGlobal",
  "Effect": "Allow",
  "Action": [
    "cloudformation:ValidateTemplate",
    "cloudformation:ListStacks",
    "cloudformation:DescribeStackEvents",
    "cloudformation:EstimateTemplateCost"
  ],
  "Resource": "*"
}
```

**Обновлен statement "CloudFormationManage":**
- Убран `cloudformation:ValidateTemplate` (перенесен в CloudFormationGlobal)
- Оставлены операции, которые требуют конкретный stack Resource

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
# Проверить что CloudFormationGlobal statement создан
aws iam get-role-policy \
  --role-name flowlogic-ci-cd-staging \
  --policy-name flowlogic-ci-cd-staging-policy \
  --query 'PolicyDocument.Statement[?Sid==`CloudFormationGlobal`]' \
  --output json | jq '.[0]'
```

---

## Результат

✅ **После исправления:**
- IAM роль `flowlogic-ci-cd-staging` имеет правильные права на `cloudformation:ValidateTemplate`
- ValidateTemplate теперь с `Resource: "*"` (для глобальных операций)
- Stack-специфичные операции остаются с ограниченным Resource pattern
- Деплой на staging должен пройти успешно

---

## Новый деплой

🚀 **Деплой перезапущен** с исправленными правами на ValidateTemplate.

**Мониторинг:**
```bash
gh run watch
```

---

## Объяснение

**Почему ValidateTemplate требует Resource: "*":**
- `cloudformation:ValidateTemplate` - валидирует template до создания stack'а
- Не привязан к конкретному stack Resource
- AWS требует `Resource: "*"` для таких глобальных операций

**Безопасность:**
- ValidateTemplate - read-only операция (не изменяет ресурсы)
- Stack-специфичные операции остаются ограничены паттерном `flowlogic-*`
- Безопасно для staging окружения

---

**Статус:** ✅ Исправлено, деплой перезапущен
