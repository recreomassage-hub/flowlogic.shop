# Staging Deploy Failed: configure-aws-credentials

**Дата:** 2026-01-15  
**Change:** `configure-aws-credentials`  
**Environment:** staging  
**Run ID:** 21100907700

---

## Статус деплоя

❌ **Deployment провалился**

**Run ID:** `21100907700`  
**Job:** `Deploy to Staging`  
**Conclusion:** `failure`  
**Статус:** `completed`

### Результаты jobs:
- ✅ `Deploy to Staging` - ❌ **failure**
- ⏸️ `Deploy to Production` - cancelled (правильно отменен)
- ⏸️ `Deploy to Dev` - skipped (правильно пропущен)

---

## Диагностика проблемы

### Проверка логов:

```bash
# Просмотреть полные логи staging job
gh run view 21100907700 --log --job "Deploy to Staging"

# Поиск ошибок
gh run view 21100907700 --log --job "Deploy to Staging" | grep -i "error\|fail\|oidc\|credential"

# Последние 100 строк логов
gh run view 21100907700 --log --job "Deploy to Staging" | tail -100
```

### Возможные причины:

1. **OIDC credentials не настроены:**
   - AWS_ROLE_ARN отсутствует в GitHub Environment staging
   - OIDC Provider не настроен в AWS
   - Trust policy не позволяет GitHub Actions

2. **Fallback на Access Keys не работает:**
   - AWS_ACCESS_KEY_ID_STAGING отсутствует
   - AWS_SECRET_ACCESS_KEY_STAGING отсутствует

3. **IAM permissions:**
   - IAM роль не имеет достаточных прав для deployment
   - SSM Parameter Store недоступен

4. **Environment не настроен:**
   - GitHub Environment staging не существует
   - Protection rules блокируют deployment

---

## Проверка настроек

### 1. Проверка GitHub Environment

```bash
# Проверить что environment существует
gh api repos/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/environments/staging

# Проверить секреты в environment
gh secret list --env staging
```

### 2. Проверка необходимых секретов

**Обязательные секреты для staging:**
- ✅ `AWS_ROLE_ARN` - ARN IAM роли для OIDC (обязательно)
- ⚠️ `AWS_ACCESS_KEY_ID_STAGING` - для fallback (опционально)
- ⚠️ `AWS_SECRET_ACCESS_KEY_STAGING` - для fallback (опционально)

### 3. Проверка AWS IAM

**Требуется:**
- OIDC Provider в AWS IAM для GitHub Actions
- IAM роль `flowlogic-ci-cd-staging` с правильным trust policy
- Permissions policy для deployment

---

## Решение проблемы

### Вариант 1: Настроить OIDC (рекомендуется)

```bash
# 1. Убедиться что OIDC Provider настроен в AWS
# См. docs/deployment/aws-oidc-setup.md

# 2. Создать IAM роль flowlogic-ci-cd-staging
# См. docs/deployment/aws-oidc-setup.md

# 3. Добавить AWS_ROLE_ARN в GitHub Environment
gh secret set AWS_ROLE_ARN --env staging
# Ввести ARN: arn:aws:iam::ACCOUNT_ID:role/flowlogic-ci-cd-staging
```

### Вариант 2: Настроить fallback на Access Keys (временно)

```bash
# Добавить Access Keys для staging (только для fallback)
gh secret set AWS_ACCESS_KEY_ID_STAGING --env staging
gh secret set AWS_SECRET_ACCESS_KEY_STAGING --env staging
```

---

## Повторный запуск

После исправления проблемы:

```bash
# Запустить деплой на staging снова
gh workflow run "Backend Deployment" -f stage=staging

# Мониторить выполнение
gh run watch
```

---

## Следующие шаги

1. ✅ Проверить логи для понимания причины ошибки
2. ⬜ Настроить недостающие секреты в GitHub Environment staging
3. ⬜ Убедиться что OIDC настроен правильно
4. ⬜ Запустить деплой снова
5. ⬜ Проверить результаты после успешного деплоя

---

**Примечание:** Убедитесь что деплой идет на staging, а не на production. Production job был правильно отменен (cancelled).
