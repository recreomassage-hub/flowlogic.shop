# Debug Mode Status: Deployment Diagnostic

**Дата:** 2026-01-15  
**Статус:** DEBUG MODE активен, деплой в процессе

---

## Текущий статус

**Workflow Run:**
- ✅ Зависшие runs отменены (9 runs cancelled)
- ✅ Новый деплой запущен
- ✅ Job "Deploy to Staging": `in_progress`
- ⏸️ Job "Deploy to Production": `waiting` (правильно, не запустится)
- ✅ Job "Deploy to Dev": `skipped` (правильно)

**Логирование добавлено:**
- ✅ Проверка синтаксиса serverless.yml (HYPOTHESIS_A)
- ✅ Проверка service name (HYPOTHESIS_B)
- ✅ Проверка импорта resources.yml (HYPOTHESIS_C)
- ✅ Проверка AWS credentials (HYPOTHESIS_D)
- ✅ Полный лог serverless deploy (HYPOTHESIS_E)

---

## Гипотезы для проверки

### HYPOTHESIS_A: Проблема с синтаксисом serverless.yml
**Проверка:** Первые 5 строк serverless.yml в логах

### HYPOTHESIS_B: Проблема с service name
**Проверка:** `service: flowlogic-backend-staging-new` в логах

### HYPOTHESIS_C: Проблема с импортом resources.yml
**Проверка:** Секция resources в логах (без monitoring.yml)

### HYPOTHESIS_D: Проблема с AWS credentials
**Проверка:** Результат `aws sts get-caller-identity` в логах

### HYPOTHESIS_E: Ошибка при выполнении serverless deploy
**Проверка:** Полный лог serverless deploy в логах

---

## Следующие шаги

1. ⏳ Дождаться завершения деплоя (2-5 минут)
2. ⬜ Получить логи из GitHub Actions
3. ⬜ Проанализировать логи для подтверждения/отклонения гипотез
4. ⬜ Исправить проблему с 100% уверенностью
5. ⬜ Проверить исправление с помощью логов

---

## Получение логов

После завершения деплоя:

```bash
LATEST_RUN=$(gh run list --workflow="Backend Deployment" --limit 1 --json databaseId -q '.[0].databaseId')

# Получить логи staging job
gh run view $LATEST_RUN --log --job "Deploy to Staging"

# Анализ для гипотез
gh run view $LATEST_RUN --log --job "Deploy to Staging" | grep -E "(HYPOTHESIS|DEBUG|DEPLOYMENT|error|Error|failed|Failed)" | head -100
```

---

**Статус:** ⏳ Деплой в процессе, ожидание runtime evidence для анализа гипотез
