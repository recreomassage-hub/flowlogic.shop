# DEBUG MODE: ResourceExistenceCheck Failure - Summary

**Дата:** 2026-01-18  
**Статус:** Проблема не решена, требуется другой подход

---

## Runtime Evidence Получен

### Подтвержденные гипотезы:
- ✅ **HYPOTHESIS_A**: serverless.yml синтаксис корректен
- ✅ **HYPOTHESIS_B**: service name корректный (flowlogic-backend-staging-new)
- ✅ **HYPOTHESIS_C**: resources section найдена
- ✅ **HYPOTHESIS_D**: AWS credentials работают
- ✅ **HYPOTHESIS_E**: ResourceExistenceCheck failed

### Отклоненные гипотезы:
- ❌ **HYPOTHESIS_G**: Cognito User Pool ARN (изменен на wildcard, проблема сохранилась)
- ❌ **HYPOTHESIS_H**: SSM параметры с ~true (проблема сохранилась)

---

## Проблема

**Ошибка:**
```
Could not create Change Set "flowlogic-backend-staging-new-staging-change-set" due to: 
The following hook(s)/validation failed: [AWS::EarlyValidation::ResourceExistenceCheck].
```

**Причина (предположительно):**
CloudFormation ResourceExistenceCheck валидирует SSM параметры, используемые в `environment` variables через `${ssm:...}`, во время создания change set. Даже если параметры существуют и доступны, CloudFormation не может их проверить до выполнения change set.

**Использованные SSM параметры:**
- `/flowlogic/staging/cognito/user-pool-id`
- `/flowlogic/staging/cognito/client-id`
- `/flowlogic/staging/stripe/secret-key`

Все параметры **существуют** и **доступны** (проверено через AWS CLI).

---

## Попытки исправления

1. ✅ Изменен Cognito User Pool ARN в IAM policy на wildcard `*` (не помогло)
2. ✅ Изменен синтаксис SSM параметров на `~true` (не помогло)
3. ⏸️ Удаление старого stack для чистого старта (в процессе)

---

## Следующие шаги

### Вариант 1: Использовать CloudFormation Parameters вместо SSM
Заменить `${ssm:...}` на CloudFormation Parameters, которые загружаются во время создания stack.

### Вариант 2: Загружать SSM параметры в runtime
Вместо использования SSM параметров в environment variables, загружать их в runtime через AWS SDK в Lambda функции.

### Вариант 3: Использовать Secrets Manager
Использовать AWS Secrets Manager вместо SSM Parameter Store, так как он может лучше работать с CloudFormation.

### Вариант 4: Отключить ResourceExistenceCheck (если возможно)
Использовать CloudFormation Transform или другие механизмы для обхода ResourceExistenceCheck.

---

## Логи

Все логи сохранены в:
- `.cursor/debug.log` - гипотезы и результаты анализа
- `/tmp/serverless-deploy-*.log` - логи деплоя

---

**Статус:** ⏸️ Требуется другой подход для решения ResourceExistenceCheck проблемы
