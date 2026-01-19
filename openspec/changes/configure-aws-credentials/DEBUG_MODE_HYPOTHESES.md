# Debug Mode: Deployment Failure Hypotheses

**Дата:** 2026-01-15  
**Режим:** DEBUG MODE - диагностика с runtime evidence

---

## Гипотезы о причине провала деплоя

### Гипотеза A: Проблема с синтаксисом serverless.yml
**Описание:** После изменений (отключение onError, monitoring.yml) синтаксис YAML может быть нарушен.

**Проверка:** 
- Логирование: вывод первых 5 строк serverless.yml
- Ожидаемый результат: корректный YAML синтаксис
- Если подтвердится: исправить синтаксис YAML

---

### Гипотеза B: Проблема с service name
**Описание:** Изменение service name на `flowlogic-backend-staging-new` может вызвать конфликты или неправильное именование ресурсов.

**Проверка:**
- Логирование: проверка service name в serverless.yml
- Ожидаемый результат: `service: flowlogic-backend-staging-new`
- Если подтвердится: вернуть старое имя или проверить конфликты

---

### Гипотеза C: Проблема с импортом resources.yml
**Оплема:** Отключение monitoring.yml может вызвать проблемы с импортом resources.yml или синтаксисом.

**Проверка:**
- Логирование: проверка секции resources в serverless.yml
- Ожидаемый результат: корректный импорт resources.yml (без monitoring.yml)
- Если подтвердится: проверить синтаксис импорта

---

### Гипотеза D: Проблема с AWS credentials
**Описание:** OIDC или fallback credentials могут быть не настроены или не работать.

**Проверка:**
- Логирование: проверка AWS credentials через `aws sts get-caller-identity`
- Ожидаемый результат: успешный ответ с account ID и role/user ARN
- Если подтвердится: проверить OIDC setup или Access Keys

---

### Гипотеза E: Ошибка при выполнении serverless deploy
**Описание:** Serverless Framework может падать с ошибкой ResourceExistenceCheck или другой ошибкой.

**Проверка:**
- Логирование: вывод полного лога serverless deploy
- Ожидаемый результат: успешный деплой или конкретная ошибка
- Если подтвердится: анализировать ошибку из логов

---

## Инструментация

**Добавлено логирование в `.github/workflows/backend-deploy.yml`:**

```yaml
- name: Deploy to AWS (Staging)
  run: |
    echo "=== DEBUG: Starting deployment ==="
    echo "HYPOTHESIS_A: Checking serverless.yml syntax"
    cat serverless.yml | head -5
    echo "HYPOTHESIS_B: Checking service name"
    grep "^service:" serverless.yml
    echo "HYPOTHESIS_C: Checking resources import"
    grep -A 2 "resources:" serverless.yml
    echo "HYPOTHESIS_D: Checking AWS credentials"
    aws sts get-caller-identity
    echo "HYPOTHESIS_E: Running serverless deploy"
    serverless deploy --stage staging --verbose 2>&1 | tee /tmp/serverless-deploy.log
```

---

## Следующие шаги

1. ✅ Логирование добавлено
2. ✅ Деплой перезапущен
3. ⏳ Ожидание завершения деплоя
4. ⬜ Анализ логов из GitHub Actions
5. ⬜ Подтверждение/отклонение гипотез
6. ⬜ Исправление с 100% уверенностью

---

**Статус:** ⏳ Логирование добавлено, деплой запущен, ожидание runtime evidence
